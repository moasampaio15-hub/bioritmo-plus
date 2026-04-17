const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authMiddleware } = require('../../core/auth/jwt');
const { authLimiter } = require('../../core/api/middleware');

// POST /api/auth/registro - Registrar paciente (público)
router.post('/registro', async (req, res) => {
    try {
        const { nome, email, senha, telefone, data_nascimento, sexo, cpf } = req.body;
        
        // Validações
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }
        
        if (senha.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Senha deve ter pelo menos 6 caracteres'
            });
        }
        
        const resultado = await authService.registrarPaciente({
            nome, email, senha, telefone, data_nascimento, sexo, cpf
        });
        
        res.status(201).json({ success: true, data: resultado });
    } catch (err) {
        if (err.message === 'Email já cadastrado') {
            return res.status(409).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/auth/login - Login (público, com rate limit)
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                error: 'Email e senha são obrigatórios'
            });
        }
        
        const resultado = await authService.login(email, senha);
        res.json({ success: true, data: resultado });
    } catch (err) {
        if (err.message === 'Email ou senha incorretos') {
            return res.status(401).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/auth/perfil - Perfil do usuário logado
router.get('/perfil', authMiddleware, async (req, res) => {
    try {
        const perfil = await authService.perfil(req.user.id);
        res.json({ success: true, data: perfil });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/auth/perfil - Atualizar perfil
router.put('/perfil', authMiddleware, async (req, res) => {
    try {
        const atualizado = await authService.atualizarPerfil(req.user.id, req.body);
        res.json({ success: true, data: atualizado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/auth/alterar-senha - Alterar senha
router.post('/alterar-senha', authMiddleware, async (req, res) => {
    try {
        const { senha_atual, nova_senha } = req.body;
        
        if (!senha_atual || !nova_senha) {
            return res.status(400).json({
                success: false,
                error: 'Senha atual e nova senha são obrigatórias'
            });
        }
        
        if (nova_senha.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Nova senha deve ter pelo menos 6 caracteres'
            });
        }
        
        const resultado = await authService.alterarSenha(req.user.id, senha_atual, nova_senha);
        res.json({ success: true, data: resultado });
    } catch (err) {
        if (err.message === 'Senha atual incorreta') {
            return res.status(401).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/auth/refresh - Renovar token
router.post('/refresh', authMiddleware, async (req, res) => {
    try {
        // Buscar dados atualizados do usuário
        const perfil = await authService.perfil(req.user.id);
        
        // Gerar novo token
        const { generateToken } = require('../../core/auth/jwt');
        const token = generateToken({
            id: perfil.id,
            email: perfil.email,
            tipo: perfil.tipo,
            pacienteId: perfil.perfil?.pacienteId,
            medicoId: perfil.perfil?.medicoId
        });
        
        res.json({
            success: true,
            data: {
                usuario: perfil,
                token
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
