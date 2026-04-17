const { run, query, queryOne } = require('../../core/database/connection');

/**
 * Engine de Correlação Bioritmo
 * 
 * Analisa relações entre hábitos e métricas de saúde:
 * - Horas de sono vs Humor
 * - Exercício vs Energia
 * - Alimentação vs Bem-estar
 * - Estresse vs Qualidade do sono
 * - etc.
 * 
 * Usa coeficiente de correlação de Pearson
 */
class CorrelacaoEngine {
    
    // Fatores que podem ser correlacionados
    FATORES_CHECKIN = ['humor', 'energia', 'sono', 'intensidade_sintomas'];
    FATORES_HABITOS = [
        'horas_sono', 'qualidade_sono',
        'duracao_exercicio', 'exercicio',
        'alimentacao_saudavel', 'refeicoes_regulares',
        'agua_litros', 'cafe_copos',
        'horas_trabalho', 'estresse_trabalho', 'pausas_regulares',
        'contato_social', 'atividades_lazer',
        'fumou', 'bebidas_alcoolicas'
    ];
    
    /**
     * Analisar todas as correlações possíveis para um paciente
     */
    async analisarCorrelacoes(pacienteId, periodoDias = 14) {
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - periodoDias);
        const dataInicioStr = dataInicio.toISOString().split('T')[0];
        
        // Buscar dados combinados (checkins + hábitos do mesmo dia)
        const dados = await query(
            `SELECT 
                c.humor, c.energia, c.sono, c.intensidade_sintomas,
                c.horas_sono as checkin_horas_sono, c.qualidade_sono as checkin_qualidade_sono,
                h.duracao_exercicio, h.exercicio, h.alimentacao_saudavel,
                h.refeicoes_regulares, h.agua_litros, h.cafe_copos,
                h.horas_trabalho, h.estresse_trabalho, h.pausas_regulares,
                h.contato_social, h.atividades_lazer, h.fumou, h.bebidas_alcoolicas
             FROM checkins c
             LEFT JOIN habitos_registro h ON c.paciente_id = h.paciente_id AND c.data = h.data
             WHERE c.paciente_id = ? AND c.data >= ?
             ORDER BY c.data`,
            [pacienteId, dataInicioStr]
        );
        
        if (dados.length < 5) {
            return {
                sucesso: false,
                mensagem: 'Dados insuficientes. Mínimo: 5 dias de check-ins.',
                amostrasAtuais: dados.length
            };
        }
        
        const correlacoes = [];
        
        // Analisar correlações: hábitos vs métricas de saúde
        const combinacoes = [
            // Sono
            { habito: 'horas_sono', metrica: 'humor', nome: 'Horas de sono vs Humor' },
            { habito: 'horas_sono', metrica: 'energia', nome: 'Horas de sono vs Energia' },
            { habito: 'qualidade_sono', metrica: 'humor', nome: 'Qualidade do sono vs Humor' },
            
            // Exercício
            { habito: 'duracao_exercicio', metrica: 'energia', nome: 'Exercício vs Energia' },
            { habito: 'duracao_exercicio', metrica: 'humor', nome: 'Exercício vs Humor' },
            { habito: 'exercicio', metrica: 'sono', nome: 'Fez exercício vs Qualidade do sono' },
            
            // Alimentação
            { habito: 'alimentacao_saudavel', metrica: 'energia', nome: 'Alimentação saudável vs Energia' },
            { habito: 'refeicoes_regulares', metrica: 'humor', nome: 'Refeições regulares vs Humor' },
            { habito: 'agua_litros', metrica: 'energia', nome: 'Hidratação vs Energia' },
            
            // Trabalho
            { habito: 'estresse_trabalho', metrica: 'humor', nome: 'Estresse no trabalho vs Humor', inverso: true },
            { habito: 'estresse_trabalho', metrica: 'sono', nome: 'Estresse vs Qualidade do sono', inverso: true },
            { habito: 'horas_trabalho', metrica: 'energia', nome: 'Horas de trabalho vs Energia', inverso: true },
            { habito: 'pausas_regulares', metrica: 'energia', nome: 'Pausas regulares vs Energia' },
            
            // Social
            { habito: 'contato_social', metrica: 'humor', nome: 'Contato social vs Humor' },
            { habito: 'atividades_lazer', metrica: 'humor', nome: 'Lazer vs Humor' },
            
            // Substâncias
            { habito: 'cafe_copos', metrica: 'sono', nome: 'Café vs Qualidade do sono', inverso: true },
            { habito: 'fumou', metrica: 'energia', nome: 'Fumar vs Energia', inverso: true },
            { habito: 'bebidas_alcoolicas', metrica: 'humor', nome: 'Álcool vs Humor (dia seguinte)', inverso: true }
        ];
        
        for (const combo of combinacoes) {
            const correlacao = this.calcularCorrelacao(dados, combo.habito, combo.metrica, combo.inverso);
            
            if (correlacao && Math.abs(correlacao.coeficiente) >= 0.3) {
                // Só salva correlações significativas
                const interpretacao = this.interpretarCorrelacao(combo.nome, correlacao);
                
                const result = await run(
                    `INSERT INTO correlacoes_encontradas 
                     (paciente_id, fator_a, fator_b, tipo_correlacao, forca, significancia, 
                      periodo_analise, amostras, descricao)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON CONFLICT DO UPDATE SET
                     forca = excluded.forca,
                     significancia = excluded.significancia,
                     amostras = excluded.amostras,
                     descricao = excluded.descricao`,
                    [pacienteId, combo.habito, combo.metrica, correlacao.tipo, 
                     correlacao.coeficiente, correlacao.significancia,
                     periodoDias, correlacao.amostras, interpretacao.descricao]
                );
                
                correlacoes.push({
                    id: result.lastInsertRowid,
                    nome: combo.nome,
                    ...correlacao,
                    interpretacao
                });
            }
        }
        
        // Ordenar por força da correlação
        correlacoes.sort((a, b) => Math.abs(b.coeficiente) - Math.abs(a.coeficiente));
        
        return {
            sucesso: true,
            periodoDias,
            amostras: dados.length,
            totalCorrelacoes: correlacoes.length,
            correlacoes
        };
    }
    
    /**
     * Calcular correlação de Pearson entre dois fatores
     */
    calcularCorrelacao(dados, fatorA, fatorB, inverso = false) {
        // Extrair pares de valores válidos
        const pares = [];
        for (const d of dados) {
            const valA = d[fatorA];
            const valB = d[fatorB];
            if (valA !== null && valA !== undefined && valB !== null && valB !== undefined) {
                pares.push({ a: valA, b: valB });
            }
        }
        
        if (pares.length < 5) return null;
        
        // Calcular médias
        const mediaA = pares.reduce((s, p) => s + p.a, 0) / pares.length;
        const mediaB = pares.reduce((s, p) => s + p.b, 0) / pares.length;
        
        // Calcular coeficiente de Pearson
        let numerador = 0;
        let somaQuadA = 0;
        let somaQuadB = 0;
        
        for (const p of pares) {
            const diffA = p.a - mediaA;
            const diffB = p.b - mediaB;
            numerador += diffA * diffB;
            somaQuadA += diffA * diffA;
            somaQuadB += diffB * diffB;
        }
        
        const denominador = Math.sqrt(somaQuadA * somaQuadB);
        
        if (denominador === 0) return null;
        
        let coeficiente = numerador / denominador;
        
        // Ajustar se é correlação inversa (ex: estresse vs humor)
        if (inverso) {
            coeficiente = -coeficiente;
        }
        
        // Determinar tipo e significância
        const tipo = coeficiente > 0 ? 'positiva' : 'negativa';
        const absCoef = Math.abs(coeficiente);
        
        let significancia;
        if (absCoef >= 0.7) significancia = 'alta';
        else if (absCoef >= 0.5) significancia = 'media';
        else significancia = 'baixa';
        
        return {
            coeficiente: parseFloat(coeficiente.toFixed(3)),
            tipo,
            significancia,
            amostras: pares.length
        };
    }
    
    /**
     * Interpretar correlação em linguagem natural
     */
    interpretarCorrelacao(nome, correlacao) {
        const { coeficiente, tipo, significancia } = correlacao;
        const absCoef = Math.abs(coeficiente);
        
        let forcaTexto;
        if (absCoef >= 0.7) forcaTexto = 'forte';
        else if (absCoef >= 0.5) forcaTexto = 'moderada';
        else forcaTexto = 'fraca';
        
        let descricao;
        if (tipo === 'positiva') {
            descricao = `Existe uma ${forcaTexto} correlação positiva: quando um aumenta, o outro tende a aumentar também.`;
        } else {
            descricao = `Existe uma ${forcaTexto} correlação negativa: quando um aumenta, o outro tende a diminuir.`;
        }
        
        // Sugestão personalizada
        let sugestao = this.gerarSugestao(nome, tipo, significancia);
        
        return {
            descricao,
            forcaTexto,
            sugestao
        };
    }
    
    /**
     * Gerar sugestão baseada na correlação
     */
    gerarSugestao(nome, tipo, significancia) {
        const sugestoes = {
            'Horas de sono vs Humor': tipo === 'positiva' 
                ? 'Priorize 7-9h de sono para melhorar seu humor.'
                : 'Verifique se está dormindo demais ou de mais.',
            'Horas de sono vs Energia': tipo === 'positiva'
                ? 'Bom sono = mais energia. Mantenha a regularidade.'
                : 'Avalie a qualidade do sono, não só a quantidade.',
            'Exercício vs Energia': tipo === 'positiva'
                ? 'Continue se exercitando! Está funcionando para sua energia.'
                : 'Experimente exercícios em horários diferentes.',
            'Exercício vs Humor': tipo === 'positiva'
                ? 'O exercício está sendo seu aliado para o bem-estar.'
                : 'Tente atividades que você realmente goste.',
            'Alimentação saudável vs Energia': tipo === 'positiva'
                ? 'Sua alimentação está contribuindo para sua disposição!'
                : 'Experimente reduzir açúcar e ultraprocessados.',
            'Estresse no trabalho vs Humor': tipo === 'negativa'
                ? 'O estresse está afetando seu humor. Pratique pausas.'
                : 'Continue gerenciando bem o estresse.',
            'Estresse vs Qualidade do sono': tipo === 'negativa'
                ? 'Técnicas de relaxamento antes de dormir podem ajudar.'
                : 'Você está conseguindo dormir bem apesar do estresse.',
            'Contato social vs Humor': tipo === 'positiva'
                ? 'Pessoas próximas são importantes para você. Cultive!'
                : 'Que tal ligar para alguém especial hoje?',
            'Café vs Qualidade do sono': tipo === 'negativa'
                ? 'Evite café após 14h para dormir melhor.'
                : 'Seu sono resiste bem ao café.',
            'default': tipo === 'positiva'
                ? 'Continue com esse hábito! Está funcionando.'
                : 'Observe como esse fator influencia seu dia.'
        };
        
        return sugestoes[nome] || sugestoes['default'];
    }
    
    /**
     * Buscar correlações já encontradas
     */
    async buscarCorrelacoes(pacienteId, filtros = {}) {
        let sql = 'SELECT * FROM correlacoes_encontradas WHERE paciente_id = ?';
        const params = [pacienteId];
        
        if (filtros.tipo) {
            sql += ' AND tipo_correlacao = ?';
            params.push(filtros.tipo);
        }
        
        if (filtros.significancia) {
            sql += ' AND significancia = ?';
            params.push(filtros.significancia);
        }
        
        if (filtros.confirmada !== undefined) {
            sql += ' AND confirmada = ?';
            params.push(filtros.confirmada ? 1 : 0);
        }
        
        sql += ' ORDER BY ABS(forca) DESC';
        
        return query(sql, params);
    }
    
    /**
     * Confirmar ou rejeitar uma correlação
     */
    async feedbackCorrelacao(correlacaoId, confirmada, pacienteId) {
        await run(
            `UPDATE correlacoes_encontradas 
             SET confirmada = ?, rejeitada = ?
             WHERE id = ? AND paciente_id = ?`,
            [confirmada ? 1 : 0, confirmada ? 0 : 1, correlacaoId, pacienteId]
        );
        return true;
    }
    
    /**
     * Gerar insights automáticos para o paciente
     */
    async gerarInsights(pacienteId) {
        const correlacoes = await this.buscarCorrelacoes(pacienteId, { confirmada: true });
        
        if (correlacoes.length === 0) {
            return {
                mensagem: 'Continue registrando seus dados para descobrir padrões pessoais.',
                acoes: ['Faça check-ins diários', 'Registre seus hábitos', 'Análise em 7 dias']
            };
        }
        
        const topCorrelacoes = correlacoes.slice(0, 3);
        
        return {
            mensagem: `Encontramos ${correlacoes.length} padrões nos seus dados.`,
            principais: topCorrelacoes.map(c => ({
                fator: `${c.fator_a} ↔ ${c.fator_b}`,
                forca: c.forca,
                tipo: c.tipo_correlacao,
                descricao: c.descricao
            })),
            acoes: this.gerarAcoesRecomendadas(correlacoes)
        };
    }
    
    gerarAcoesRecomendadas(correlacoes) {
        const acoes = [];
        
        for (const c of correlacoes.slice(0, 5)) {
            if (c.confirmada) {
                const acao = this.gerarSugestao(`${c.fator_a} vs ${c.fator_b}`, c.tipo_correlacao, c.significancia);
                if (!acoes.includes(acao)) {
                    acoes.push(acao);
                }
            }
        }
        
        return acoes.slice(0, 3);
    }
}

module.exports = new CorrelacaoEngine();
