const express = require('express');
const router = express.Router();
const correlacaoEngine = require('../services/correlacaoEngine');
const { authMiddleware } = require('../../core/auth/jwt');

router.use(authMiddleware);

// POST /api/correlacao/analisar/:pacienteId - Rodar análise completa
router.post('/analisar/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const periodoDias = parseInt(req.body.periodo_dias) || 14;
        
        const resultado = await correlacaoEngine.analisarCorrelacoes(pacienteId, periodoDias);
        
        res.json({ success: true, data: resultado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/correlacao/paciente/:pacienteId - Listar correlações encontradas
router.get('/paciente/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const filtros = {
            tipo: req.query.tipo,
            significancia: req.query.significancia,
            confirmada: req.query.confirmada === 'true' ? true : 
                       req.query.confirmada === 'false' ? false : undefined
        };
        
        const correlacoes = await correlacaoEngine.buscarCorrelacoes(pacienteId, filtros);
        
        res.json({
            success: true,
            data: correlacoes,
            meta: {
                total: correlacoes.length,
                positivas: correlacoes.filter(c => c.tipo_correlacao === 'positiva').length,
                negativas: correlacoes.filter(c => c.tipo_correlacao === 'negativa').length,
                confirmadas: correlacoes.filter(c => c.confirmada === 1).length
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/correlacao/:correlacaoId/feedback - Confirmar/rejeitar correlação
router.post('/:correlacaoId/feedback', async (req, res) => {
    try {
        const correlacaoId = parseInt(req.params.correlacaoId);
        const pacienteId = parseInt(req.body.paciente_id);
        const { confirmada } = req.body;
        
        if (confirmada === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Campo confirmada é obrigatório (true/false)'
            });
        }
        
        await correlacaoEngine.feedbackCorrelacao(correlacaoId, confirmada, pacienteId);
        
        res.json({
            success: true,
            message: confirmada ? 'Correlação confirmada' : 'Correlação rejeitada'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/correlacao/paciente/:pacienteId/insights - Insights automáticos
router.get('/paciente/:pacienteId/insights', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const insights = await correlacaoEngine.gerarInsights(pacienteId);
        
        res.json({ success: true, data: insights });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/correlacao/paciente/:pacienteId/dashboard - Dashboard completo
router.get('/paciente/:pacienteId/dashboard', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        
        // Buscar correlações
        const correlacoes = await correlacaoEngine.buscarCorrelacoes(pacienteId);
        
        // Separar por tipo e significância
        const topPositivas = correlacoes
            .filter(c => c.tipo_correlacao === 'positiva')
            .slice(0, 3);
        
        const topNegativas = correlacoes
            .filter(c => c.tipo_correlacao === 'negativa')
            .slice(0, 3);
        
        const fortes = correlacoes.filter(c => c.significancia === 'alta');
        
        // Insights
        const insights = await correlacaoEngine.gerarInsights(pacienteId);
        
        res.json({
            success: true,
            data: {
                resumo: {
                    totalCorrelacoes: correlacoes.length,
                    correlacoesFortes: fortes.length,
                    confirmadas: correlacoes.filter(c => c.confirmada === 1).length,
                    pendentesConfirmacao: correlacoes.filter(c => c.confirmada === 0 && c.rejeitada === 0).length
                },
                destaques: {
                    topPositivas,
                    topNegativas,
                    maisFortes: fortes.slice(0, 3)
                },
                insights,
                sugestoes: insights.acoes
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
