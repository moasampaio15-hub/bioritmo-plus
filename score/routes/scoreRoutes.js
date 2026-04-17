const express = require('express');
const router = express.Router();
const scoreEngine = require('../services/scoreEngine');
const { authMiddleware } = require('../../core/auth/jwt');

router.use(authMiddleware);

// POST /api/score/calcular/:pacienteId - Calcular score agora
router.post('/calcular/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const periodoDias = parseInt(req.body.periodo_dias) || 7;
        
        const resultado = await scoreEngine.calcularScore(pacienteId, periodoDias);
        
        if (!resultado) {
            return res.status(400).json({
                success: false,
                error: 'Dados insuficientes para calcular score. Faça check-ins primeiro.'
            });
        }
        
        res.json({ success: true, data: resultado });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/score/paciente/:pacienteId - Último score calculado
router.get('/paciente/:pacienteId', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const historico = await scoreEngine.buscarHistorico(pacienteId, 1);
        
        if (historico.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum score calculado ainda'
            });
        }
        
        res.json({ success: true, data: historico[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/score/paciente/:pacienteId/historico - Histórico de scores
router.get('/paciente/:pacienteId/historico', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const dias = parseInt(req.query.dias) || 30;
        
        const historico = await scoreEngine.buscarHistorico(pacienteId, dias);
        
        res.json({
            success: true,
            data: historico,
            meta: {
                totalRegistros: historico.length,
                periodoDias: dias
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/score/paciente/:pacienteId/tendencia - Análise de tendência
router.get('/paciente/:pacienteId/tendencia', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const dias = parseInt(req.query.dias) || 14;
        
        const historico = await scoreEngine.buscarHistorico(pacienteId, dias);
        
        if (historico.length < 2) {
            return res.json({
                success: true,
                data: {
                    mensagem: 'Dados insuficientes para análise de tendência',
                    registrosNecessarios: 2,
                    registrosAtuais: historico.length
                }
            });
        }
        
        // Calcular tendências por categoria
        const scoresMental = historico.map(h => h.score_mental);
        const scoresFisico = historico.map(h => h.score_fisico);
        const scoresSono = historico.map(h => h.score_sono);
        const scoresGeral = historico.map(h => h.score_geral);
        
        const analise = {
            periodoDias: dias,
            registros: historico.length,
            geral: {
                primeiro: scoresGeral[scoresGeral.length - 1],
                ultimo: scoresGeral[0],
                variacao: scoresGeral[0] - scoresGeral[scoresGeral.length - 1],
                media: Math.round(scoresGeral.reduce((a, b) => a + b, 0) / scoresGeral.length),
                minimo: Math.min(...scoresGeral),
                maximo: Math.max(...scoresGeral)
            },
            categorias: {
                mental: {
                    tendencia: this.calcularDirecao(scoresMental),
                    media: Math.round(scoresMental.reduce((a, b) => a + b, 0) / scoresMental.length)
                },
                fisico: {
                    tendencia: this.calcularDirecao(scoresFisico),
                    media: Math.round(scoresFisico.reduce((a, b) => a + b, 0) / scoresFisico.length)
                },
                sono: {
                    tendencia: this.calcularDirecao(scoresSono),
                    media: Math.round(scoresSono.reduce((a, b) => a + b, 0) / scoresSono.length)
                }
            },
            interpretacao: null
        };
        
        // Gerar interpretação
        const variacao = analise.geral.variacao;
        if (variacao > 10) {
            analise.interpretacao = 'Melhora significativa no período. Continue assim!';
        } else if (variacao > 5) {
            analise.interpretacao = 'Leve melhora. Mantenha os hábitos positivos.';
        } else if (variacao < -10) {
            analise.interpretacao = 'Queda significativa. Avalie fatores de estresse.';
        } else if (variacao < -5) {
            analise.interpretacao = 'Leve queda. Atenção aos sinais do corpo.';
        } else {
            analise.interpretacao = 'Estabilidade. Bom momento para introduzir novos hábitos.';
        }
        
        res.json({ success: true, data: analise });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Helper para calcular direção da tendência
function calcularDirecao(scores) {
    if (scores.length < 2) return 'estavel';
    const primeiraMetade = scores.slice(Math.floor(scores.length / 2));
    const segundaMetade = scores.slice(0, Math.floor(scores.length / 2));
    const media1 = primeiraMetade.reduce((a, b) => a + b, 0) / primeiraMetade.length;
    const media2 = segundaMetade.reduce((a, b) => a + b, 0) / segundaMetade.length;
    
    if (media2 > media1 + 3) return 'melhora';
    if (media2 < media1 - 3) return 'piora';
    return 'estavel';
}

// GET /api/score/paciente/:pacienteId/alertas - Alertas pendentes
router.get('/paciente/:pacienteId/alertas', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const alertas = await scoreEngine.buscarAlertasPendentes(pacienteId);
        
        res.json({
            success: true,
            data: alertas,
            meta: {
                total: alertas.length,
                criticos: alertas.filter(a => a.tipo === 'critico').length,
                atencao: alertas.filter(a => a.tipo === 'atencao').length
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// PATCH /api/score/alertas/:alertaId/lido - Marcar alerta como lido
router.patch('/alertas/:alertaId/lido', async (req, res) => {
    try {
        const alertaId = parseInt(req.params.alertaId);
        await scoreEngine.marcarAlertaLido(alertaId);
        res.json({ success: true, message: 'Alerta marcado como lido' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/score/paciente/:pacienteId/comparativo - Comparativo semanal/mensal
router.get('/paciente/:pacienteId/comparativo', async (req, res) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        
        // Buscar última semana
        const semana = await scoreEngine.buscarHistorico(pacienteId, 7);
        const mediaSemana = semana.length > 0
            ? Math.round(semana.reduce((a, s) => a + s.score_geral, 0) / semana.length)
            : null;
        
        // Buscar último mês
        const mes = await scoreEngine.buscarHistorico(pacienteId, 30);
        const mediaMes = mes.length > 0
            ? Math.round(mes.reduce((a, s) => a + s.score_geral, 0) / mes.length)
            : null;
        
        res.json({
            success: true,
            data: {
                semana: {
                    media: mediaSemana,
                    registros: semana.length
                },
                mes: {
                    media: mediaMes,
                    registros: mes.length
                },
                comparacao: mediaSemana && mediaMes
                    ? {
                        diferenca: mediaSemana - mediaMes,
                        tendencia: mediaSemana > mediaMes ? 'melhora' : mediaSemana < mediaMes ? 'piora' : 'estavel'
                    }
                    : null
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
