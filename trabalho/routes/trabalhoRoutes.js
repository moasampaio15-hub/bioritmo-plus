const express = require('express');
const router = express.Router();
const trabalhoService = require('../services/trabalhoService');
const { authMiddleware } = require('../../core/auth/jwt');

router.use(authMiddleware);

// ============================================
// EMPRESAS
// ============================================

// POST /api/trabalho/empresas - Criar empresa
router.post('/empresas', async (req, res) => {
    try {
        const empresa = await trabalhoService.criarEmpresa(req.body);
        res.status(201).json({ success: true, data: empresa });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/empresas - Listar empresas
router.get('/empresas', async (req, res) => {
    try {
        const empresas = await trabalhoService.listarEmpresas(req.query);
        res.json({ success: true, data: empresas });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/empresas/:id - Buscar empresa
router.get('/empresas/:id', async (req, res) => {
    try {
        const empresa = await trabalhoService.buscarEmpresa(req.params.id);
        if (!empresa) {
            return res.status(404).json({ success: false, error: 'Empresa não encontrada' });
        }
        res.json({ success: true, data: empresa });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/trabalho/empresas/:id - Atualizar empresa
router.put('/empresas/:id', async (req, res) => {
    try {
        const atualizada = await trabalhoService.atualizarEmpresa(req.params.id, req.body);
        res.json({ success: true, data: atualizada });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/empresas/:id/dashboard - Dashboard da empresa
router.get('/empresas/:id/dashboard', async (req, res) => {
    try {
        const dashboard = await trabalhoService.dashboardEmpresa(req.params.id);
        res.json({ success: true, data: dashboard });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================
// FUNCIONÁRIOS
// ============================================

// POST /api/trabalho/funcionarios - Vincular funcionário
router.post('/funcionarios', async (req, res) => {
    try {
        const funcionario = await trabalhoService.vincularFuncionario(req.body);
        res.status(201).json({ success: true, data: funcionario });
    } catch (err) {
        if (err.message.includes('já é funcionário')) {
            return res.status(409).json({ success: false, error: err.message });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/empresas/:id/funcionarios - Listar funcionários
router.get('/empresas/:id/funcionarios', async (req, res) => {
    try {
        const funcionarios = await trabalhoService.listarFuncionariosEmpresa(req.params.id, req.query);
        res.json({ success: true, data: funcionarios });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/funcionarios/:id - Buscar funcionário
router.get('/funcionarios/:id', async (req, res) => {
    try {
        const funcionario = await trabalhoService.buscarFuncionario(req.params.id);
        if (!funcionario) {
            return res.status(404).json({ success: false, error: 'Funcionário não encontrado' });
        }
        res.json({ success: true, data: funcionario });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/trabalho/funcionarios/:id/desligar - Desligar funcionário
router.post('/funcionarios/:id/desligar', async (req, res) => {
    try {
        const { data_demissao } = req.body;
        const resultado = await trabalhoService.desligarFuncionario(req.params.id, data_demissao);
        res.json({ success: true, data: resultado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================
// ASO
// ============================================

// POST /api/trabalho/asos - Criar ASO
router.post('/asos', async (req, res) => {
    try {
        const aso = await trabalhoService.criarASO(req.body);
        res.status(201).json({ success: true, data: aso });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/funcionarios/:id/asos - Listar ASOs do funcionário
router.get('/funcionarios/:id/asos', async (req, res) => {
    try {
        const asos = await trabalhoService.listarASOsFuncionario(req.params.id);
        res.json({ success: true, data: asos });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/asos/:id - Buscar ASO
router.get('/asos/:id', async (req, res) => {
    try {
        const aso = await trabalhoService.buscarASO(req.params.id);
        if (!aso) {
            return res.status(404).json({ success: false, error: 'ASO não encontrado' });
        }
        res.json({ success: true, data: aso });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/asos/vencendo - ASOs vencendo
router.get('/asos/vencendo', async (req, res) => {
    try {
        const dias = parseInt(req.query.dias) || 30;
        const asos = await trabalhoService.listarASOsVencendo(dias);
        res.json({ success: true, data: asos });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================
// PPP
// ============================================

// POST /api/trabalho/ppps - Criar/atualizar PPP
router.post('/ppps', async (req, res) => {
    try {
        const ppp = await trabalhoService.criarPPP(req.body);
        res.status(201).json({ success: true, data: ppp });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/funcionarios/:id/ppps - Listar PPPs
router.get('/funcionarios/:id/ppps', async (req, res) => {
    try {
        const ppps = await trabalhoService.listarPPPsFuncionario(req.params.id);
        res.json({ success: true, data: ppps });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/trabalho/funcionarios/:funcionarioId/ppps/:ano - Buscar PPP
router.get('/funcionarios/:funcionarioId/ppps/:ano', async (req, res) => {
    try {
        const ppp = await trabalhoService.buscarPPP(req.params.funcionarioId, req.params.ano);
        if (!ppp) {
            return res.status(404).json({ success: false, error: 'PPP não encontrado' });
        }
        res.json({ success: true, data: ppp });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
