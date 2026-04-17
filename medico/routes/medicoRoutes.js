const express = require('express');
const router = express.Router();
const medicoService = require('../services/medicoService');
const { authMiddleware } = require('../../core/auth/jwt');

router.use(authMiddleware);

// Middleware para garantir que é um médico
async function requireMedico(req, res, next) {
    try {
        const medico = await medicoService.buscarPorUsuarioId(req.user.id);
        if (!medico) {
            return res.status(403).json({ success: false, error: 'Acesso restrito a médicos' });
        }
        req.medicoId = medico.id;
        next();
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

router.use(requireMedico);

// GET /api/medico/dashboard - Dashboard do médico
router.get('/dashboard', async (req, res) => {
    try {
        const dashboard = await medicoService.dashboard(req.medicoId);
        res.json({ success: true, data: dashboard });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/medico/pacientes - Listar pacientes vinculados
router.get('/pacientes', async (req, res) => {
    try {
        const filtros = {
            nome: req.query.nome,
            alerta: req.query.alerta
        };
        
        const pacientes = await medicoService.listarPacientes(req.medicoId, filtros);
        res.json({ success: true, data: pacientes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/medico/pacientes/:pacienteId - Detalhes completos do paciente
router.get('/pacientes/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const detalhes = await medicoService.detalhesPaciente(req.medicoId, pacienteId);
        res.json({ success: true, data: detalhes });
    } catch (err) {
        if (err.message.includes('não vinculado')) {
            return res.status(403).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/medico/pacientes/:pacienteId/anotacoes - Adicionar anotação
router.post('/pacientes/:pacienteId/anotacoes', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const { anotacao, tipo } = req.body;
        
        if (!anotacao) {
            return res.status(400).json({ success: false, error: 'Anotação é obrigatória' });
        }
        
        const novaAnotacao = await medicoService.adicionarAnotacao(req.medicoId, pacienteId, {
            anotacao,
            tipo
        });
        
        res.status(201).json({ success: true, data: novaAnotacao });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/medico/pacientes/:pacienteId/anotacoes - Listar anotações
router.get('/pacientes/:pacienteId/anotacoes', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const filtros = {
            tipo: req.query.tipo
        };
        
        const anotacoes = await medicoService.listarAnotacoes(req.medicoId, pacienteId, filtros);
        res.json({ success: true, data: anotacoes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/medico/pacientes/:pacienteId/vincular - Vincular paciente
router.post('/pacientes/:pacienteId/vincular', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const resultado = await medicoService.vincularPaciente(req.medicoId, pacienteId);
        res.json({ success: true, data: resultado });
    } catch (err) {
        if (err.message.includes('já vinculado')) {
            return res.status(409).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/medico/pacientes/:pacienteId/desvincular - Desvincular paciente
router.post('/pacientes/:pacienteId/desvincular', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const resultado = await medicoService.desvincularPaciente(req.medicoId, pacienteId);
        res.json({ success: true, data: resultado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/medico/estatisticas - Estatísticas da prática
router.get('/estatisticas', async (req, res) => {
    try {
        const estatisticas = await medicoService.estatisticas(req.medicoId);
        res.json({ success: true, data: estatisticas });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
