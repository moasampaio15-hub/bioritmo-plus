const { run, query, queryOne } = require('../../core/database/connection');

/**
 * Engine de Score Clínico Bioritmo
 * 
 * Calcula scores baseados em:
 * - Métricas diárias (humor, energia, sono)
 * - Consistência dos registros
 * - Hábitos saudáveis
 * - Tendências temporais
 * 
 * Score geral: 0-100
 * Categorias: Mental, Físico, Sono, Hábitos
 */
class ScoreEngine {
    
    // Pesos para cálculo do score geral - BIORITMO+ Premium
    // Baseado em: Sono 30%, Energia 20%, Humor 20%, Hábitos 30%
    PESOS = {
        sono: 0.30,        // 30% - sono é fundamental
        habitos: 0.30,     // 30% - hábitos definem saúde
        mental: 0.20,      // 20% - humor e bem-estar
        fisico: 0.20       // 20% - energia e disposição
    };
    
    // Thresholds para alertas
    THRESHOLDS = {
        critico: 40,       // abaixo disso = alerta crítico
        atencao: 60,       // abaixo disso = atenção
        bom: 75            // acima disso = bom
    };
    
    /**
     * Calcular score completo de um paciente
     */
    async calcularScore(pacienteId, periodoDias = 7) {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - periodoDias);
        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        
        // Buscar check-ins do período
        const checkins = await query(
            `SELECT * FROM checkins 
             WHERE paciente_id = ? AND data >= ?
             ORDER BY data DESC, hora DESC`,
            [pacienteId, dataInicioStr]
        );
        
        // Buscar hábitos do período
        const habitos = await query(
            `SELECT * FROM habitos_registro 
             WHERE paciente_id = ? AND data >= ?
             ORDER BY data DESC`,
            [pacienteId, dataInicioStr]
        );
        
        if (checkins.length === 0) {
            return null; // Sem dados suficientes
        }
        
        // Calcular scores individuais
        const scoreMental = this.calcularScoreMental(checkins);
        const scoreFisico = this.calcularScoreFisico(checkins);
        const scoreSono = this.calcularScoreSono(checkins);
        const scoreHabitos = this.calcularScoreHabitos(habitos, periodoDias);
        
        // Calcular score geral ponderado
        const scoreGeral = Math.round(
            scoreMental * this.PESOS.mental +
            scoreFisico * this.PESOS.fisico +
            scoreSono * this.PESOS.sono +
            scoreHabitos * this.PESOS.habitos
        );
        
        // Determinar tendência
        const tendencia = await this.calcularTendencia(pacienteId, scoreGeral, periodoDias);
        
        // Gerar alertas
        const alertas = this.gerarAlertas(scoreMental, scoreFisico, scoreSono, scoreHabitos, scoreGeral);
        
        // Salvar no banco
        const result = await run(
            `INSERT INTO score_calculos 
             (paciente_id, data, score_mental, score_fisico, score_sono, score_habitos, 
              score_geral, tendencia, variacao, alertas, periodo_dias)
             VALUES (?, date('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pacienteId, scoreMental, scoreFisico, scoreSono, scoreHabitos,
             scoreGeral, tendencia.tendencia, tendencia.variacao, 
             JSON.stringify(alertas), periodoDias]
        );
        
        // Salvar alertas individuais
        for (const alerta of alertas) {
            await run(
                `INSERT INTO score_alertas (paciente_id, tipo, categoria, mensagem, valor_atual, valor_referencia)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [pacienteId, alerta.tipo, alerta.categoria, alerta.mensagem, 
                 alerta.valorAtual, alerta.valorReferencia]
            );
        }
        
        return {
            id: result.lastInsertRowid,
            pacienteId,
            data: new Date().toISOString().split('T')[0],
            scores: {
                mental: scoreMental,
                fisico: scoreFisico,
                sono: scoreSono,
                habitos: scoreHabitos,
                geral: scoreGeral
            },
            tendencia,
            alertas,
            periodoDias,
            amostras: {
                checkins: checkins.length,
                diasHabitos: habitos.length
            }
        };
    }
    
    /**
     * Score Mental: baseado em humor e variabilidade
     */
    calcularScoreMental(checkins) {
        const humores = checkins.map(c => c.humor).filter(h => h !== null);
        if (humores.length === 0) return 50;
        
        // Média do humor (1-10) -> converter para 0-100
        const mediaHumor = humores.reduce((a, b) => a + b, 0) / humores.length;
        
        // Calcular variabilidade (desvio padrão)
        const variancia = humores.reduce((acc, val) => acc + Math.pow(val - mediaHumor, 2), 0) / humores.length;
        const desvioPadrao = Math.sqrt(variancia);
        
        // Penalidade por alta variabilidade (humor instável)
        const penalidadeVariabilidade = Math.min(desvioPadrao * 3, 15);
        
        // Bônus por consistência de registros
        const consistencia = Math.min(humores.length / 14, 1) * 5; // max 5 pontos
        
        let score = (mediaHumor * 10) - penalidadeVariabilidade + consistencia;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    /**
     * Score Físico: baseado em energia e disposição
     */
    calcularScoreFisico(checkins) {
        const energias = checkins.map(c => c.energia).filter(e => e !== null);
        if (energias.length === 0) return 50;
        
        const mediaEnergia = energias.reduce((a, b) => a + b, 0) / energias.length;
        
        // Analisar padrão de energia ao longo do dia
        const energiaManha = checkins
            .filter(c => c.momento_dia === 'manha')
            .map(c => c.energia)
            .filter(e => e !== null);
        const energiaTarde = checkins
            .filter(c => c.momento_dia === 'tarde')
            .map(c => c.energia)
            .filter(e => e !== null);
        
        // Penalidade se energia cai muito à tarde (fadiga)
        let penalidadeFatiga = 0;
        if (energiaManha.length > 0 && energiaTarde.length > 0) {
            const mediaManha = energiaManha.reduce((a, b) => a + b, 0) / energiaManha.length;
            const mediaTarde = energiaTarde.reduce((a, b) => a + b, 0) / energiaTarde.length;
            const queda = mediaManha - mediaTarde;
            if (queda > 2) {
                penalidadeFatiga = queda * 2; // Penalidade proporcional à queda
            }
        }
        
        let score = (mediaEnergia * 10) - penalidadeFatiga;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    /**
     * Score Sono: baseado em qualidade e consistência
     */
    calcularScoreSono(checkins) {
        const checkinsComSono = checkins.filter(c => c.sono !== null && c.horas_sono !== null);
        if (checkinsComSono.length === 0) return 50;
        
        // Média da avaliação de sono (1-10)
        const mediaSono = checkinsComSono.reduce((a, c) => a + c.sono, 0) / checkinsComSono.length;
        
        // Média de horas de sono
        const mediaHoras = checkinsComSono.reduce((a, c) => a + c.horas_sono, 0) / checkinsComSono.length;
        
        // Ideal: 7-9 horas
        let pontuacaoHoras = 100;
        if (mediaHoras < 6) {
            pontuacaoHoras = 50; // Muito pouco sono
        } else if (mediaHoras < 7) {
            pontuacaoHoras = 75; // Pouco sono
        } else if (mediaHoras > 9) {
            pontuacaoHoras = 80; // Muito sono
        }
        
        // % que acordou descansado
        const descansados = checkinsComSono.filter(c => c.acordou_descansado === 1).length;
        const percentualDescansado = (descansados / checkinsComSono.length) * 100;
        
        // Combinar métricas
        const score = (mediaSono * 5) + (pontuacaoHoras * 0.3) + (percentualDescansado * 0.2);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    
    /**
     * Score Hábitos: baseado em comportamentos saudáveis
     */
    calcularScoreHabitos(habitos, periodoDias) {
        if (habitos.length === 0) return 50;
        
        let pontuacao = 0;
        const totalDias = habitos.length;
        
        // Alimentação (0-25 pontos)
        const diasRefeicoesRegulares = habitos.filter(h => h.refeicoes_regulares === 1).length;
        const mediaAlimentacaoSaudavel = habitos.reduce((a, h) => a + (h.alimentacao_saudavel || 3), 0) / totalDias;
        pontuacao += (diasRefeicoesRegulares / totalDias) * 15;
        pontuacao += (mediaAlimentacaoSaudavel / 5) * 10;
        
        // Exercício (0-25 pontos)
        const diasComExercicio = habitos.filter(h => h.exercicio === 1).length;
        const mediaDuracaoExercicio = habitos
            .filter(h => h.exercicio === 1)
            .reduce((a, h) => a + (h.duracao_exercicio || 0), 0) / Math.max(diasComExercicio, 1);
        pontuacao += (diasComExercicio / totalDias) * 15;
        pontuacao += Math.min(mediaDuracaoExercicio / 30, 1) * 10; // 30min = pontuação máxima
        
        // Hidratação (0-15 pontos)
        const mediaAgua = habitos.reduce((a, h) => a + (h.agua_litros || 0), 0) / totalDias;
        pontuacao += Math.min(mediaAgua / 2, 1) * 15; // 2L = pontuação máxima
        
        // Sono e descanso (0-15 pontos)
        const diasComPausas = habitos.filter(h => h.pausas_regulares === 1).length;
        const mediaEstresse = habitos.reduce((a, h) => a + (h.estresse_trabalho || 5), 0) / totalDias;
        pontuacao += (diasComPausas / totalDias) * 10;
        pontuacao += (1 - (mediaEstresse - 1) / 9) * 5; // Menos estresse = mais pontos
        
        // Social e lazer (0-10 pontos)
        const diasContatoSocial = habitos.filter(h => h.contato_social === 1).length;
        const diasLazer = habitos.filter(h => h.atividades_lazer === 1).length;
        pontuacao += (diasContatoSocial / totalDias) * 5;
        pontuacao += (diasLazer / totalDias) * 5;
        
        // Penalidades
        const diasFumou = habitos.filter(h => h.fumou === 1).length;
        const diasBebeu = habitos.filter(h => h.bebidas_alcoolicas > 0).length;
        pontuacao -= (diasFumou / totalDias) * 10; // Penalidade por fumar
        pontuacao -= (diasBebeu / totalDias) * 5;  // Penalidade por álcool
        
        return Math.max(0, Math.min(100, Math.round(pontuacao)));
    }
    
    /**
     * Calcular tendência comparando com período anterior
     */
    async calcularTendencia(pacienteId, scoreAtual, periodoDias) {
        // Buscar score anterior
        const scoreAnterior = await queryOne(
            `SELECT score_geral FROM score_calculos 
             WHERE paciente_id = ? AND data < date('now')
             ORDER BY data DESC LIMIT 1`,
            [pacienteId]
        );
        
        if (!scoreAnterior) {
            return { tendencia: 'estavel', variacao: 0 };
        }
        
        const variacao = scoreAtual - scoreAnterior.score_geral;
        
        let tendencia;
        if (variacao > 5) tendencia = 'melhora';
        else if (variacao < -5) tendencia = 'piora';
        else tendencia = 'estavel';
        
        return { tendencia, variacao };
    }
    
    /**
     * Gerar alertas baseados nos scores
     */
    gerarAlertas(mental, fisico, sono, habitos, geral) {
        const alertas = [];
        
        // Alertas por categoria
        if (mental < this.THRESHOLDS.critico) {
            alertas.push({
                tipo: 'critico',
                categoria: 'humor',
                mensagem: 'Score mental muito baixo. Considere buscar apoio profissional.',
                valorAtual: mental,
                valorReferencia: this.THRESHOLDS.critico
            });
        } else if (mental < this.THRESHOLDS.atencao) {
            alertas.push({
                tipo: 'atencao',
                categoria: 'humor',
                mensagem: 'Humor instável. Monitore suas emoções e pratique autocuidado.',
                valorAtual: mental,
                valorReferencia: this.THRESHOLDS.atencao
            });
        }
        
        if (fisico < this.THRESHOLDS.atencao) {
            alertas.push({
                tipo: 'atencao',
                categoria: 'energia',
                mensagem: 'Níveis de energia baixos. Verifique sono e alimentação.',
                valorAtual: fisico,
                valorReferencia: this.THRESHOLDS.atencao
            });
        }
        
        if (sono < this.THRESHOLDS.atencao) {
            alertas.push({
                tipo: 'atencao',
                categoria: 'sono',
                mensagem: 'Qualidade do sono prejudicada. Estabeleça uma rotina de sono.',
                valorAtual: sono,
                valorReferencia: this.THRESHOLDS.atencao
            });
        }
        
        if (habitos < this.THRESHOLDS.atencao) {
            alertas.push({
                tipo: 'atencao',
                categoria: 'habitos',
                mensagem: 'Hábitos precisam de atenção. Pequenas mudanças fazem diferença.',
                valorAtual: habitos,
                valorReferencia: this.THRESHOLDS.atencao
            });
        }
        
        // Alerta geral
        if (geral < this.THRESHOLDS.critico) {
            alertas.push({
                tipo: 'critico',
                categoria: 'geral',
                mensagem: 'Score geral crítico. Recomenda-se avaliação médica.',
                valorAtual: geral,
                valorReferencia: this.THRESHOLDS.critico
            });
        }
        
        return alertas;
    }
    
    /**
     * Buscar histórico de scores
     */
    async buscarHistorico(pacienteId, dias = 30) {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - dias);
        
        const scores = await query(
            `SELECT * FROM score_calculos 
             WHERE paciente_id = ? AND data >= ?
             ORDER BY data DESC`,
            [pacienteId, dataInicio.toISOString().split('T')[0]]
        );
        
        return scores.map(s => ({
            ...s,
            alertas: s.alertas ? JSON.parse(s.alertas) : []
        }));
    }
    
    /**
     * Buscar alertas pendentes
     */
    async buscarAlertasPendentes(pacienteId) {
        return query(
            `SELECT * FROM score_alertas 
             WHERE paciente_id = ? AND lido = 0
             ORDER BY criado_em DESC`,
            [pacienteId]
        );
    }
    
    /**
     * Marcar alerta como lido
     */
    async marcarAlertaLido(alertaId) {
        await run(
            `UPDATE score_alertas SET lido = 1, lido_em = CURRENT_TIMESTAMP WHERE id = ?`,
            [alertaId]
        );
        return true;
    }
}

module.exports = new ScoreEngine();
