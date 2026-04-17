const { run, query, queryOne } = require('../../core/database/connection');

/**
 * Service para funcionalidades do médico
 * Dashboard, acompanhamento de pacientes, anotações clínicas
 */
class MedicoService {
    
    /**
     * Buscar médico por ID de usuário
     */
    async buscarPorUsuarioId(usuarioId) {
        return queryOne(`
            SELECT m.*, u.nome, u.email, u.telefone
            FROM medicos m
            JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.usuario_id = ?
        `, [usuarioId]);
    }
    
    /**
     * Listar pacientes vinculados ao médico
     */
    async listarPacientes(medicoId, filtros = {}) {
        let sql = `
            SELECT 
                p.id, p.data_nascimento, p.sexo, p.profissao,
                u.nome, u.email, u.telefone, u.ativo, u.ultimo_acesso,
                (SELECT MAX(data) FROM checkins WHERE paciente_id = p.id) as ultimo_checkin,
                (SELECT score_geral FROM score_calculos WHERE paciente_id = p.id ORDER BY data DESC LIMIT 1) as score_atual,
                mp.vinculado_em
            FROM medico_pacientes mp
            JOIN pacientes p ON mp.paciente_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE mp.medico_id = ? AND mp.ativo = 1
        `;
        const params = [medicoId];
        
        if (filtros.nome) {
            sql += ' AND u.nome LIKE ?';
            params.push(`%${filtros.nome}%`);
        }
        
        if (filtros.alerta === 'true') {
            sql += ` AND EXISTS (
                SELECT 1 FROM score_alertas 
                WHERE paciente_id = p.id AND lido = 0 AND tipo = 'critico'
            )`;
        }
        
        sql += ' ORDER BY u.nome';
        
        return query(sql, params);
    }
    
    /**
     * Dashboard do médico - visão geral
     */
    async dashboard(medicoId) {
        // Total de pacientes
        const pacientesResult = await queryOne(
            'SELECT COUNT(*) as total FROM medico_pacientes WHERE medico_id = ? AND ativo = 1',
            [medicoId]
        );
        
        // Pacientes com check-in hoje
        const hoje = new Date().toISOString().split('T')[0];
        const ativosHoje = await queryOne(`
            SELECT COUNT(DISTINCT c.paciente_id) as total
            FROM checkins c
            JOIN medico_pacientes mp ON c.paciente_id = mp.paciente_id
            WHERE mp.medico_id = ? AND mp.ativo = 1 AND c.data = ?
        `, [medicoId, hoje]);
        
        // Alertas pendentes
        const alertas = await query(`
            SELECT sa.*, u.nome as paciente_nome
            FROM score_alertas sa
            JOIN pacientes p ON sa.paciente_id = p.id
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE sa.paciente_id IN (
                SELECT paciente_id FROM medico_pacientes WHERE medico_id = ? AND ativo = 1
            )
            AND sa.lido = 0
            ORDER BY sa.tipo = 'critico' DESC, sa.criado_em DESC
            LIMIT 10
        `, [medicoId]);
        
        // Média de scores dos pacientes
        const mediaScores = await queryOne(`
            SELECT AVG(sc.score_geral) as media
            FROM score_calculos sc
            JOIN medico_pacientes mp ON sc.paciente_id = mp.paciente_id
            WHERE mp.medico_id = ? AND mp.ativo = 1
            AND sc.data = (
                SELECT MAX(data) FROM score_calculos 
                WHERE paciente_id = sc.paciente_id
            )
        `, [medicoId]);
        
        // Pacientes que precisam de atenção (score < 60 ou alerta crítico)
        const atencao = await query(`
            SELECT DISTINCT p.id, u.nome, sc.score_geral,
                (SELECT COUNT(*) FROM score_alertas WHERE paciente_id = p.id AND lido = 0 AND tipo = 'critico') as alertas_criticos
            FROM pacientes p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN medico_pacientes mp ON p.id = mp.paciente_id
            LEFT JOIN score_calculos sc ON p.id = sc.paciente_id
            WHERE mp.medico_id = ? AND mp.ativo = 1
            AND (
                sc.score_geral < 60 
                OR EXISTS (
                    SELECT 1 FROM score_alertas 
                    WHERE paciente_id = p.id AND lido = 0 AND tipo = 'critico'
                )
            )
            AND sc.data = (SELECT MAX(data) FROM score_calculos WHERE paciente_id = p.id)
            ORDER BY sc.score_geral ASC
            LIMIT 5
        `, [medicoId]);
        
        return {
            resumo: {
                totalPacientes: pacientesResult.total,
                pacientesAtivosHoje: ativosHoje.total,
                mediaScoreGeral: Math.round(mediaScores.media || 0),
                alertasPendentes: alertas.length,
                pacientesAtencao: atencao.length
            },
            alertasRecentes: alertas,
            pacientesAtencao: atencao
        };
    }
    
    /**
     * Detalhes completos de um paciente para o médico
     */
    async detalhesPaciente(medicoId, pacienteId) {
        // Verificar se paciente está vinculado
        const vinculo = await queryOne(
            'SELECT * FROM medico_pacientes WHERE medico_id = ? AND paciente_id = ? AND ativo = 1',
            [medicoId, pacienteId]
        );
        
        if (!vinculo) {
            throw new Error('Paciente não vinculado a este médico');
        }
        
        // Dados do paciente
        const paciente = await queryOne(`
            SELECT p.*, u.nome, u.email, u.telefone, u.ativo, u.criado_em
            FROM pacientes p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ?
        `, [pacienteId]);
        
        // Histórico médico
        const historicoMedico = await query(
            'SELECT * FROM paciente_historico_medico WHERE paciente_id = ? ORDER BY data_diagnostico DESC',
            [pacienteId]
        );
        
        // Últimos check-ins
        const checkins = await query(
            'SELECT * FROM checkins WHERE paciente_id = ? ORDER BY data DESC, hora DESC LIMIT 14',
            [pacienteId]
        );
        
        // Histórico de scores
        const scores = await query(
            'SELECT * FROM score_calculos WHERE paciente_id = ? ORDER BY data DESC LIMIT 30',
            [pacienteId]
        );
        
        // Alertas pendentes
        const alertas = await query(
            'SELECT * FROM score_alertas WHERE paciente_id = ? AND lido = 0 ORDER BY criado_em DESC',
            [pacienteId]
        );
        
        // Anotações do médico
        const anotacoes = await query(
            'SELECT * FROM medico_anotacoes WHERE medico_id = ? AND paciente_id = ? ORDER BY criado_em DESC',
            [medicoId, pacienteId]
        );
        
        // Correlações confirmadas
        const correlacoes = await query(
            'SELECT * FROM correlacoes_encontradas WHERE paciente_id = ? AND confirmada = 1 ORDER BY ABS(forca) DESC LIMIT 5',
            [pacienteId]
        );
        
        return {
            paciente,
            historicoMedico,
            ultimosCheckins: checkins,
            historicoScores: scores.map(s => ({
                ...s,
                alertas: s.alertas ? JSON.parse(s.alertas) : []
            })),
            alertasPendentes: alertas,
            anotacoesMedico: anotacoes,
            correlacoesConfirmadas: correlacoes
        };
    }
    
    /**
     * Adicionar anotação clínica
     */
    async adicionarAnotacao(medicoId, pacienteId, dados) {
        // Verificar vinculo
        const vinculo = await queryOne(
            'SELECT * FROM medico_pacientes WHERE medico_id = ? AND paciente_id = ? AND ativo = 1',
            [medicoId, pacienteId]
        );
        
        if (!vinculo) {
            throw new Error('Paciente não vinculado a este médico');
        }
        
        const { anotacao, tipo = 'geral' } = dados;
        
        const result = await run(
            'INSERT INTO medico_anotacoes (medico_id, paciente_id, anotacao, tipo) VALUES (?, ?, ?, ?)',
            [medicoId, pacienteId, anotacao, tipo]
        );
        
        return queryOne('SELECT * FROM medico_anotacoes WHERE id = ?', [result.lastInsertRowid]);
    }
    
    /**
     * Listar anotações de um paciente
     */
    async listarAnotacoes(medicoId, pacienteId, filtros = {}) {
        let sql = `
            SELECT ma.*, u.nome as medico_nome
            FROM medico_anotacoes ma
            JOIN medicos m ON ma.medico_id = m.id
            JOIN usuarios u ON m.usuario_id = u.id
            WHERE ma.paciente_id = ?
        `;
        const params = [pacienteId];
        
        if (filtros.medico_id) {
            sql += ' AND ma.medico_id = ?';
            params.push(filtros.medico_id);
        }
        
        if (filtros.tipo) {
            sql += ' AND ma.tipo = ?';
            params.push(filtros.tipo);
        }
        
        sql += ' ORDER BY ma.criado_em DESC';
        
        return query(sql, params);
    }
    
    /**
     * Vincular novo paciente ao médico
     */
    async vincularPaciente(medicoId, pacienteId) {
        // Verificar se já existe
        const existe = await queryOne(
            'SELECT * FROM medico_pacientes WHERE medico_id = ? AND paciente_id = ?',
            [medicoId, pacienteId]
        );
        
        if (existe) {
            if (existe.ativo === 0) {
                // Reativar
                await run(
                    'UPDATE medico_pacientes SET ativo = 1, vinculado_em = CURRENT_TIMESTAMP WHERE id = ?',
                    [existe.id]
                );
                return { reativado: true };
            }
            throw new Error('Paciente já vinculado a este médico');
        }
        
        await run(
            'INSERT INTO medico_pacientes (medico_id, paciente_id) VALUES (?, ?)',
            [medicoId, pacienteId]
        );
        
        // Atualizar médico responsável no paciente
        await run(
            'UPDATE pacientes SET medico_responsavel_id = ? WHERE id = ?',
            [medicoId, pacienteId]
        );
        
        return { vinculado: true };
    }
    
    /**
     * Desvincular paciente
     */
    async desvincularPaciente(medicoId, pacienteId) {
        await run(
            'UPDATE medico_pacientes SET ativo = 0 WHERE medico_id = ? AND paciente_id = ?',
            [medicoId, pacienteId]
        );
        
        // Remover médico responsável
        await run(
            'UPDATE pacientes SET medico_responsavel_id = NULL WHERE id = ? AND medico_responsavel_id = ?',
            [pacienteId, medicoId]
        );
        
        return { desvinculado: true };
    }
    
    /**
     * Estatísticas da prática médica
     */
    async estatisticas(medicoId) {
        // Check-ins nos últimos 7 dias por paciente
        const atividadeSemanal = await query(`
            SELECT 
                u.nome,
                COUNT(c.id) as total_checkins,
                AVG(c.humor) as media_humor,
                AVG(c.energia) as media_energia
            FROM pacientes p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN medico_pacientes mp ON p.id = mp.paciente_id
            LEFT JOIN checkins c ON p.id = c.paciente_id AND c.data >= date('now', '-7 days')
            WHERE mp.medico_id = ? AND mp.ativo = 1
            GROUP BY p.id
            ORDER BY total_checkins DESC
        `, [medicoId]);
        
        // Distribuição de scores
        const distribuicaoScores = await query(`
            SELECT 
                CASE 
                    WHEN score_geral >= 75 THEN 'bom'
                    WHEN score_geral >= 60 THEN 'atencao'
                    ELSE 'critico'
                END as categoria,
                COUNT(*) as quantidade
            FROM score_calculos sc
            JOIN medico_pacientes mp ON sc.paciente_id = mp.paciente_id
            WHERE mp.medico_id = ? AND mp.ativo = 1
            AND sc.data = (SELECT MAX(data) FROM score_calculos WHERE paciente_id = sc.paciente_id)
            GROUP BY categoria
        `, [medicoId]);
        
        return {
            atividadeSemanal,
            distribuicaoScores
        };
    }
}

module.exports = new MedicoService();
