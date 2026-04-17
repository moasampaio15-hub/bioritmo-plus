const express = require('express');
const router = express.Router();
const checkinService = require('../services/checkinService');
const habitosService = require('../services/habitosService');
const { authMiddleware } = require('../../core/auth/jwt');

router.use(authMiddleware);

// POST /api/checkins - Criar check-in
router.post('/', async (req, res) => {
    try {
        const { paciente_id, humor, energia, sono } = req.body;
        
        // Validações
        if (!paciente_id || !humor || !energia || !sono) {
            return res.status(400).json({
                success: false,
                error: 'paciente_id, humor, energia e sono são obrigatórios'
            });
        }
        
        // Valores devem estar entre 1-10
        if (humor < 1 || humor > 10 || energia < 1 || energia > 10 || sono < 1 || sono > 10) {
            return res.status(400).json({
                success: false,
                error: 'Valores devem estar entre 1 e 10'
            });
        }
        
        // Definir data/hora se não fornecidos
        const agora = new Date();
        const data = req.body.data || agora.toISOString().split('T')[0];
        const hora = req.body.hora || agora.toTimeString().slice(0, 5);
        
        // Detectar momento do dia se não informado
        let momento_dia = req.body.momento_dia;
        if (!momento_dia) {
            const horaNum = parseInt(hora.split(':')[0]);
            if (horaNum < 12) momento_dia = 'manha';
            else if (horaNum < 18) momento_dia = 'tarde';
            else momento_dia = 'noite';
        }
        
        const checkin = await checkinService.criar({
            ...req.body,
            data,
            hora,
            momento_dia
        });
        
        res.status(201).json({ success: true, data: checkin });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
                success: false,
                error: 'Já existe check-in para este momento do dia'
            });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/checkins/paciente/:pacienteId - Listar check-ins de um paciente
router.get('/paciente/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const filtros = {
            data_inicio: req.query.data_inicio,
            data_fim: req.query.data_fim,
            momento_dia: req.query.momento_dia,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };
        
        const checkins = await checkinService.listarPorPaciente(pacienteId, filtros);
        res.json({ success: true, data: checkins });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/checkins/:id - Buscar um check-in
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const checkin = await checkinService.buscarPorId(id);
        
        if (!checkin) {
            return res.status(404).json({ success: false, error: 'Check-in não encontrado' });
        }
        
        res.json({ success: true, data: checkin });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/checkins/:id - Atualizar check-in
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const atualizado = await checkinService.atualizar(id, req.body);
        
        if (!atualizado) {
            return res.status(404).json({ success: false, error: 'Check-in não encontrado' });
        }
        
        res.json({ success: true, data: atualizado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/checkins/:id - Excluir check-in
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const excluido = await checkinService.excluir(id);
        
        if (!excluido) {
            return res.status(404).json({ success: false, error: 'Check-in não encontrado' });
        }
        
        res.json({ success: true, message: 'Check-in excluído' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/checkins/paciente/:pacienteId/dashboard - Dashboard do paciente
router.get('/paciente/:pacienteId/dashboard', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const dashboard = await checkinService.resumoDashboard(pacienteId);
        res.json({ success: true, data: dashboard });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/checkins/paciente/:pacienteId/estatisticas - Estatísticas
router.get('/paciente/:pacienteId/estatisticas', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const dias = parseInt(req.query.dias) || 7;
        const stats = await checkinService.estatisticasPeriodo(pacienteId, dias);
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================
// ROTAS DE HÁBITOS
// ============================================

// POST /api/checkins/habitos - Registrar hábitos
router.post('/habitos', async (req, res) => {
    try {
        const { paciente_id, data } = req.body;
        
        if (!paciente_id) {
            return res.status(400).json({
                success: false,
                error: 'paciente_id é obrigatório'
            });
        }
        
        const dataFinal = data || new Date().toISOString().split('T')[0];
        
        const habito = await habitosService.registrar({
            ...req.body,
            data: dataFinal
        });
        
        res.status(201).json({ success: true, data: habito });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/checkins/habitos/paciente/:pacienteId - Buscar hábitos
router.get('/habitos/paciente/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const { data, data_inicio, data_fim } = req.query;
        
        let result;
        if (data) {
            // Buscar dia específico
            result = await habitosService.buscar(pacienteId, data);
        } else if (data_inicio && data_fim) {
            // Listar período
            result = await habitosService.listarPeriodo(pacienteId, data_inicio, data_fim);
        } else {
            // Buscar hoje
            const hoje = new Date().toISOString().split('T')[0];
            result = await habitosService.buscar(pacienteId, hoje);
        }
        
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/checkins/habitos/paciente/:pacienteId/medias - Médias do período
router.get('/habitos/paciente/:pacienteId/medias', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const dias = parseInt(req.query.dias) || 7;
        const medias = await habitosService.mediasPeriodo(pacienteId, dias);
        res.json({ success: true, data: medias });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
