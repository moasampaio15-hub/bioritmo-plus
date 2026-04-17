const express = require('express');
const router = express.Router();
const pacienteService = require('../services/pacienteService');
const { authMiddleware } = require('../../core/auth/jwt');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// GET /api/pacientes - Listar todos
router.get('/', async (req, res) => {
    try {
        const filtros = {
            nome: req.query.nome,
            ativo: req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined,
            medico_id: req.query.medico_id ? parseInt(req.query.medico_id) : undefined
        };
        
        const pacientes = await pacienteService.listar(filtros);
        res.json({ success: true, data: pacientes });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/pacientes/:id - Buscar um
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const paciente = await pacienteService.buscarPorId(id);
        
        if (!paciente) {
            return res.status(404).json({ success: false, error: 'Paciente não encontrado' });
        }
        
        // Adicionar estatísticas
        const stats = await pacienteService.estatisticas(id);
        
        res.json({ 
            success: true, 
            data: { ...paciente, estatisticas: stats }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/pacientes - Criar
router.post('/', async (req, res) => {
    try {
        const { nome, email, senha, telefone, data_nascimento, sexo, cpf, endereco, cidade, estado, profissao, observacoes } = req.body;
        
        // Validações básicas
        if (!nome || !email || !senha) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nome, email e senha são obrigatórios' 
            });
        }
        
        const paciente = await pacienteService.criar({
            nome, email, senha, telefone, data_nascimento, sexo, cpf, 
            endereco, cidade, estado, profissao, observacoes
        });
        
        res.status(201).json({ success: true, data: paciente });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ 
                success: false, 
                error: 'Email ou CPF já cadastrado' 
            });
        }
        res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/pacientes/:id - Atualizar
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const atualizado = await pacienteService.atualizar(id, req.body);
        
        if (!atualizado) {
            return res.status(404).json({ success: false, error: 'Paciente não encontrado' });
        }
        
        res.json({ success: true, data: atualizado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/pacientes/:id - Desativar
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const desativado = await pacienteService.desativar(id);
        
        if (!desativado) {
            return res.status(404).json({ success: false, error: 'Paciente não encontrado' });
        }
        
        res.json({ success: true, message: 'Paciente desativado' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/pacientes/:id/historico-medico - Histórico
router.get('/:id/historico-medico', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const historico = await pacienteService.buscarHistoricoMedicoPaciente(id);
        res.json({ success: true, data: historico });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/pacientes/:id/historico-medico - Adicionar ao histórico
router.post('/:id/historico-medico', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { condicao, diagnostico_cid, data_diagnostico, em_tratamento, medicamentos, observacoes } = req.body;
        
        if (!condicao) {
            return res.status(400).json({ success: false, error: 'Condição é obrigatória' });
        }
        
        const item = await pacienteService.adicionarHistoricoMedico(id, {
            condicao, diagnostico_cid, data_diagnostico, em_tratamento, medicamentos, observacoes
        });
        
        res.status(201).json({ success: true, data: item });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/pacientes/:id/estatisticas - Estatísticas
router.get('/:id/estatisticas', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const stats = await pacienteService.estatisticas(id);
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
