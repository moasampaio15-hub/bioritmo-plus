const { run, query, queryOne } = require('../../core/database/connection');
const { hashPassword, verifyPassword } = require('../../core/auth/password');
const { generateToken } = require('../../core/auth/jwt');

/**
 * Service de Autenticação
 * Login, registro e gestão de sessões
 */
class AuthService {
    
    /**
     * Registrar novo usuário (paciente)
     */
    async registrarPaciente(dados) {
        const { nome, email, senha, telefone, data_nascimento, sexo, cpf } = dados;
        
        // Verificar se email já existe
        const existe = await queryOne('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe) {
            throw new Error('Email já cadastrado');
        }
        
        // Criar usuário
        const senhaHash = hashPassword(senha);
        const usuarioResult = await run(
            'INSERT INTO usuarios (email, senha_hash, nome, tipo, telefone) VALUES (?, ?, ?, ?, ?)',
            [email, senhaHash, nome, 'paciente', telefone]
        );
        
        const usuarioId = usuarioResult.lastInsertRowid;
        
        // Criar paciente
        const pacienteResult = await run(
            'INSERT INTO pacientes (usuario_id, data_nascimento, sexo, cpf) VALUES (?, ?, ?, ?)',
            [usuarioId, data_nascimento, sexo, cpf]
        );
        
        // Buscar dados completos
        const usuario = await queryOne(`
            SELECT u.id, u.nome, u.email, u.tipo, u.telefone, p.id as paciente_id
            FROM usuarios u
            JOIN pacientes p ON u.id = p.usuario_id
            WHERE u.id = ?
        `, [usuarioId]);
        
        // Gerar token
        const token = generateToken({
            id: usuario.id,
            email: usuario.email,
            tipo: usuario.tipo,
            pacienteId: usuario.paciente_id
        });
        
        return {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                pacienteId: usuario.paciente_id
            },
            token
        };
    }
    
    /**
     * Registrar médico (admin only)
     */
    async registrarMedico(dados) {
        const { nome, email, senha, telefone, crm, crm_uf, especialidade } = dados;
        
        // Verificar email
        const existe = await queryOne('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existe) {
            throw new Error('Email já cadastrado');
        }
        
        // Criar usuário
        const senhaHash = hashPassword(senha);
        const usuarioResult = await run(
            'INSERT INTO usuarios (email, senha_hash, nome, tipo, telefone) VALUES (?, ?, ?, ?, ?)',
            [email, senhaHash, nome, 'medico', telefone]
        );
        
        const usuarioId = usuarioResult.lastInsertRowid;
        
        // Criar médico
        const medicoResult = await run(
            'INSERT INTO medicos (usuario_id, crm, crm_uf, especialidade) VALUES (?, ?, ?, ?)',
            [usuarioId, crm, crm_uf, especialidade]
        );
        
        const usuario = await queryOne(`
            SELECT u.id, u.nome, u.email, u.tipo, u.telefone, m.id as medico_id
            FROM usuarios u
            JOIN medicos m ON u.id = m.usuario_id
            WHERE u.id = ?
        `, [usuarioId]);
        
        const token = generateToken({
            id: usuario.id,
            email: usuario.email,
            tipo: usuario.tipo,
            medicoId: usuario.medico_id
        });
        
        return {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                medicoId: usuario.medico_id
            },
            token
        };
    }
    
    /**
     * Login
     */
    async login(email, senha) {
        // Buscar usuário
        const usuario = await queryOne(`
            SELECT u.*, p.id as paciente_id, m.id as medico_id
            FROM usuarios u
            LEFT JOIN pacientes p ON u.id = p.usuario_id
            LEFT JOIN medicos m ON u.id = m.usuario_id
            WHERE u.email = ? AND u.ativo = 1
        `, [email]);
        
        if (!usuario) {
            throw new Error('Email ou senha incorretos');
        }
        
        // Verificar senha
        const senhaValida = verifyPassword(senha, usuario.senha_hash);
        if (!senhaValida) {
            throw new Error('Email ou senha incorretos');
        }
        
        // Atualizar último acesso
        await run(
            'UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?',
            [usuario.id]
        );
        
        // Gerar token
        const token = generateToken({
            id: usuario.id,
            email: usuario.email,
            tipo: usuario.tipo,
            pacienteId: usuario.paciente_id,
            medicoId: usuario.medico_id
        });
        
        return {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                pacienteId: usuario.paciente_id,
                medicoId: usuario.medico_id
            },
            token
        };
    }
    
    /**
     * Buscar perfil do usuário logado
     */
    async perfil(usuarioId) {
        const usuario = await queryOne(`
            SELECT u.id, u.nome, u.email, u.tipo, u.telefone, u.criado_em, u.ultimo_acesso,
                p.id as paciente_id, p.data_nascimento, p.sexo, p.cpf,
                m.id as medico_id, m.crm, m.crm_uf, m.especialidade
            FROM usuarios u
            LEFT JOIN pacientes p ON u.id = p.usuario_id
            LEFT JOIN medicos m ON u.id = m.usuario_id
            WHERE u.id = ?
        `, [usuarioId]);
        
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        
        return {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            telefone: usuario.telefone,
            criadoEm: usuario.criado_em,
            ultimoAcesso: usuario.ultimo_acesso,
            perfil: usuario.tipo === 'paciente' ? {
                pacienteId: usuario.paciente_id,
                dataNascimento: usuario.data_nascimento,
                sexo: usuario.sexo,
                cpf: usuario.cpf
            } : usuario.tipo === 'medico' ? {
                medicoId: usuario.medico_id,
                crm: usuario.crm,
                crmUf: usuario.crm_uf,
                especialidade: usuario.especialidade
            } : null
        };
    }
    
    /**
     * Atualizar perfil
     */
    async atualizarPerfil(usuarioId, dados) {
        const camposPermitidos = ['nome', 'telefone'];
        const campos = [];
        const valores = [];
        
        for (const [key, value] of Object.entries(dados)) {
            if (camposPermitidos.includes(key)) {
                campos.push(`${key} = ?`);
                valores.push(value);
            }
        }
        
        if (campos.length === 0) {
            throw new Error('Nenhum campo válido para atualizar');
        }
        
        valores.push(usuarioId);
        await run(
            `UPDATE usuarios SET ${campos.join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`,
            valores
        );
        
        return this.perfil(usuarioId);
    }
    
    /**
     * Alterar senha
     */
    async alterarSenha(usuarioId, senhaAtual, novaSenha) {
        // Buscar senha atual
        const usuario = await queryOne(
            'SELECT senha_hash FROM usuarios WHERE id = ?',
            [usuarioId]
        );
        
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }
        
        // Verificar senha atual
        const senhaValida = verifyPassword(senhaAtual, usuario.senha_hash);
        if (!senhaValida) {
            throw new Error('Senha atual incorreta');
        }
        
        // Atualizar senha
        const novaSenhaHash = hashPassword(novaSenha);
        await run(
            'UPDATE usuarios SET senha_hash = ? WHERE id = ?',
            [novaSenhaHash, usuarioId]
        );
        
        return { alterado: true };
    }
}

module.exports = new AuthService();
