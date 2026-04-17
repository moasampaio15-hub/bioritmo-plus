const express = require('express');
const router = express.Router();
const relatorioService = require('../relatorioService');
const { authMiddleware } = require('../../core/auth/jwt');

router.use(authMiddleware);

/**
 * POST /api/relatorios/paciente/:pacienteId
 * Gerar relatório individual do paciente
 */
router.post('/paciente/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const { data_inicio, data_fim } = req.body;
        
        // Validar datas
        if (!data_inicio || !data_fim) {
            return res.status(400).json({
                success: false,
                error: 'data_inicio e data_fim são obrigatórios'
            });
        }
        
        const resultado = await relatorioService.gerarRelatorioPaciente(
            pacienteId,
            data_inicio,
            data_fim
        );
        
        // Enviar PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${resultado.filename}"`);
        res.send(resultado.pdf);
        
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * GET /api/relatorios/paciente/:pacienteId/preview
 * Preview do relatório (retorna stats sem PDF)
 */
router.get('/paciente/:pacienteId/preview', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const { data_inicio, data_fim } = req.query;
        
        if (!data_inicio || !data_fim) {
            return res.status(400).json({
                success: false,
                error: 'data_inicio e data_fim são obrigatórios'
            });
        }
        
        const resultado = await relatorioService.gerarRelatorioPaciente(
            pacienteId,
            data_inicio,
            data_fim
        );
        
        res.json({
            success: true,
            data: {
                filename: resultado.filename,
                stats: resultado.stats
            }
        });
        
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/**
 * POST /api/relatorios/medico/consolidado
 * Gerar relatório consolidado do médico
 */
router.post('/medico/consolidado', async (req, res) => {
    try {
        const medicoId = req.user.medicoId;
        
        if (!medicoId) {
            return res.status(403).json({
                success: false,
                error: 'Acesso restrito a médicos'
            });
        }
        
        const { data_inicio, data_fim } = req.body;
        
        const resultado = await relatorioService.gerarRelatorioMedico(
            medicoId,
            data_inicio,
            data_fim
        );
        
        res.json({
            success: true,
            data: resultado
        });
        
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
