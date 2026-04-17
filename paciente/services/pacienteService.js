const { run, query, queryOne, transaction } = require('../../core/database/connection');
const { hashPassword } = require('../../core/auth/password');

class PacienteService {
    // Criar novo paciente (com usuário associado)
    async criar(dados) {
        const { nome, email, senha, telefone, data_nascimento, sexo, cpf, endereco, cidade, estado, profissao, observacoes } = dados;
        
        return transaction(async () => {
            // 1. Criar usuário
            const senhaHash = hashPassword(senha);
            const usuarioResult = await run(
                'INSERT INTO usuarios (email, senha_hash, nome, tipo, telefone) VALUES (?, ?, ?, ?, ?)',
                [email, senhaHash, nome, 'paciente', telefone]
            );
            const usuarioId = usuarioResult.lastInsertRowid;
            
            // 2. Criar paciente
            const pacienteResult = await run(
                `INSERT INTO pacientes (usuario_id, data_nascimento, sexo, cpf, endereco, cidade, estado, profissao, observacoes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [usuarioId, data_nascimento, sexo, cpf, endereco, cidade, estado, profissao, observacoes]
            );
            
            return this.buscarPorId(pacienteResult.lastInsertRowid);
        });
    }
    
    // Listar todos os pacientes (com filtros opcionais)
    async listar(filtros = {}) {
        let sql = `
            SELECT p.*, u.nome, u.email, u.telefone, u.ativo, u.criado_em
            FROM pacientes p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];
        
        if (filtros.nome) {
            sql += ' AND u.nome LIKE ?';
            params.push(`%${filtros.nome}%`);
        }
        
        if (filtros.ativo !== undefined) {
            sql += ' AND u.ativo = ?';
            params.push(filtros.ativo ? 1 : 0);
        }
        
        if (filtros.medico_id) {
            sql += ' AND p.medico_responsavel_id = ?';
            params.push(filtros.medico_id);
        }
        
        sql += ' ORDER BY u.nome';
        
        return query(sql, params);
    }
    
    // Buscar paciente por ID
    async buscarPorId(id) {
        return queryOne(`
            SELECT p.*, u.nome, u.email, u.telefone, u.ativo, u.ultimo_acesso
            FROM pacientes p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ?
        `, [id]);
    }
    
    // Buscar por usuário
    async buscarPorUsuarioId(usuarioId) {
        return queryOne(`
            SELECT p.*, u.nome, u.email, u.telefone, u.ativo
            FROM pacientes p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.usuario_id = ?
        `, [usuarioId]);
    }
    
    // Atualizar paciente
    async atualizar(id, dados) {
        const paciente = await this.buscarPorId(id);
        if (!paciente) return null;
        
        const camposPaciente = [];
        const valoresPaciente = [];
        
        const camposUsuario = [];
        const valoresUsuario = [];
        
        // Separar campos de paciente vs usuário
        const pacienteFields = ['data_nascimento', 'sexo', 'cpf', 'endereco', 'cidade', 'estado', 'profissao', 'empresa_id', 'medico_responsavel_id', 'observacoes'];
        const usuarioFields = ['nome', 'email', 'telefone'];
        
        for (const [key, value] of Object.entries(dados)) {
            if (pacienteFields.includes(key)) {
                camposPaciente.push(`${key} = ?`);
                valoresPaciente.push(value);
            } else if (usuarioFields.includes(key)) {
                camposUsuario.push(`${key} = ?`);
                valoresUsuario.push(value);
            }
        }
        
        return transaction(async () => {
            if (camposPaciente.length > 0) {
                valoresPaciente.push(id);
                await run(`UPDATE pacientes SET ${camposPaciente.join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`, valoresPaciente);
            }
            
            if (camposUsuario.length > 0) {
                valoresUsuario.push(paciente.usuario_id);
                await run(`UPDATE usuarios SET ${camposUsuario.join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`, valoresUsuario);
            }
            
            return this.buscarPorId(id);
        });
    }
    
    // Desativar paciente (soft delete)
    async desativar(id) {
        const paciente = await this.buscarPorId(id);
        if (!paciente) return false;
        
        await run('UPDATE usuarios SET ativo = 0 WHERE id = ?', [paciente.usuario_id]);
        return true;
    }
    
    // Adicionar histórico médico
    async adicionarHistoricoMedico(pacienteId, dados) {
        const { condicao, diagnostico_cid, data_diagnostico, em_tratamento, medicamentos, observacoes } = dados;
        
        const result = await run(
            `INSERT INTO paciente_historico_medico 
             (paciente_id, condicao, diagnostico_cid, data_diagnostico, em_tratamento, medicamentos, observacoes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [pacienteId, condicao, diagnostico_cid, data_diagnostico, em_tratamento ? 1 : 0, medicamentos, observacoes]
        );
        
        return this.buscarHistoricoMedico(result.lastInsertRowid);
    }
    
    // Buscar histórico médico do paciente
    async buscarHistoricoMedicoPaciente(pacienteId) {
        return query(
            'SELECT * FROM paciente_historico_medico WHERE paciente_id = ? ORDER BY data_diagnostico DESC',
            [pacienteId]
        );
    }
    
    // Buscar item de histórico por ID
    async buscarHistoricoMedico(id) {
        return queryOne('SELECT * FROM paciente_historico_medico WHERE id = ?', [id]);
    }
    
    // Estatísticas do paciente
    async estatisticas(pacienteId) {
        const checkins = await queryOne('SELECT COUNT(*) as total FROM checkins WHERE paciente_id = ?', [pacienteId]);
        const ultimoCheckin = await queryOne('SELECT MAX(data) as data FROM checkins WHERE paciente_id = ?', [pacienteId]);
        const scoreAtual = await queryOne('SELECT score_geral FROM score_calculos WHERE paciente_id = ? ORDER BY data DESC LIMIT 1', [pacienteId]);
        
        return {
            totalCheckins: checkins?.total || 0,
            ultimoCheckin: ultimoCheckin?.data || null,
            scoreAtual: scoreAtual?.score_geral || null
        };
    }
}

module.exports = new PacienteService();
