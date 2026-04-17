const puppeteer = require('puppeteer');
const { query, queryOne } = require('../core/database/connection');

/**
 * Serviço de Geração de Relatórios PDF
 * BIORITMO+ - Padrão Clínico Profissional
 */

class RelatorioService {
    
    /**
     * Gerar relatório individual do paciente
     */
    async gerarRelatorioPaciente(pacienteId, dataInicio, dataFim) {
        // Buscar dados do paciente
        const paciente = await queryOne(`
            SELECT p.*, u.nome, u.email, u.telefone
            FROM pacientes p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ?
        `, [pacienteId]);
        
        if (!paciente) {
            throw new Error('Paciente não encontrado');
        }
        
        // Buscar check-ins do período
        const checkins = await query(`
            SELECT * FROM checkins 
            WHERE paciente_id = ? AND data BETWEEN ? AND ?
            ORDER BY data DESC, hora DESC
        `, [pacienteId, dataInicio, dataFim]);
        
        // Buscar scores do período
        const scores = await query(`
            SELECT * FROM score_calculos 
            WHERE paciente_id = ? AND data BETWEEN ? AND ?
            ORDER BY data DESC
        `, [pacienteId, dataInicio, dataFim]);
        
        // Buscar hábitos do período
        const habitos = await query(`
            SELECT * FROM habitos_registro 
            WHERE paciente_id = ? AND data BETWEEN ? AND ?
            ORDER BY data DESC
        `, [pacienteId, dataInicio, dataFim]);
        
        // Calcular estatísticas
        const stats = this.calcularEstatisticas(checkins, scores, habitos);
        
        // Gerar HTML do relatório
        const html = this.gerarHTMLRelatorio(paciente, checkins, scores, stats, dataInicio, dataFim);
        
        // Gerar PDF
        const pdf = await this.htmlParaPDF(html);
        
        return {
            pdf,
            filename: `relatorio_${paciente.nome.replace(/\s+/g, '_')}_${dataInicio}_${dataFim}.pdf`,
            stats
        };
    }
    
    /**
     * Calcular estatísticas do período
     */
    calcularEstatisticas(checkins, scores, habitos) {
        if (checkins.length === 0) {
            return {
                totalCheckins: 0,
                mediaHumor: null,
                mediaEnergia: null,
                mediaSono: null,
                mediaHorasSono: null,
                adesao: 0
            };
        }
        
        const humorSum = checkins.reduce((a, c) => a + (c.humor || 0), 0);
        const energiaSum = checkins.reduce((a, c) => a + (c.energia || 0), 0);
        const sonoSum = checkins.reduce((a, c) => a + (c.sono || 0), 0);
        const horasSum = checkins.reduce((a, c) => a + (c.horas_sono || 0), 0);
        
        const diasComExercicio = habitos.filter(h => h.exercicio === 1).length;
        const diasComAgua = habitos.filter(h => h.agua_litros >= 1.5).length;
        
        return {
            totalCheckins: checkins.length,
            mediaHumor: (humorSum / checkins.length).toFixed(1),
            mediaEnergia: (energiaSum / checkins.length).toFixed(1),
            mediaSono: (sonoSum / checkins.length).toFixed(1),
            mediaHorasSono: (horasSum / checkins.filter(c => c.horas_sono).length || 0).toFixed(1),
            scoreInicial: scores.length > 0 ? scores[scores.length - 1].score_geral : null,
            scoreFinal: scores.length > 0 ? scores[0].score_geral : null,
            variacaoScore: scores.length > 1 ? (scores[0].score_geral - scores[scores.length - 1].score_geral) : 0,
            adesao: Math.round((checkins.length / 30) * 100), // Simplificado
            diasComExercicio,
            diasComAgua
        };
    }
    
    /**
     * Gerar HTML do relatório
     */
    gerarHTMLRelatorio(paciente, checkins, scores, stats, dataInicio, dataFim) {
        const hoje = new Date().toLocaleDateString('pt-BR');
        const periodo = `${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}`;
        
        return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório BIORITMO+</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1F2937;
            padding: 40px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #7C3AED;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .logo-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        
        .logo-text h1 {
            font-size: 20pt;
            font-weight: 800;
            color: #7C3AED;
            letter-spacing: -0.5px;
        }
        
        .logo-text p {
            font-size: 9pt;
            color: #6B7280;
        }
        
        .doc-info {
            text-align: right;
        }
        
        .doc-info .date {
            font-size: 10pt;
            color: #6B7280;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: 700;
            color: #7C3AED;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .patient-info {
            background: #F9FAFB;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .patient-info h2 {
            font-size: 18pt;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
        }
        
        .patient-info p {
            color: #6B7280;
            font-size: 10pt;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-box {
            background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid #E5E7EB;
        }
        
        .stat-box .value {
            font-size: 24pt;
            font-weight: 800;
            color: #7C3AED;
            display: block;
        }
        
        .stat-box .label {
            font-size: 9pt;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .score-box {
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .score-box .score-value {
            font-size: 48pt;
            font-weight: 800;
            line-height: 1;
        }
        
        .score-box .score-label {
            font-size: 11pt;
            opacity: 0.9;
        }
        
        .insights {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px 20px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 20px;
        }
        
        .insights h4 {
            color: #92400E;
            font-size: 11pt;
            margin-bottom: 8px;
        }
        
        .insights ul {
            list-style: none;
            color: #92400E;
        }
        
        .insights li {
            padding: 4px 0;
            font-size: 10pt;
        }
        
        .chart-placeholder {
            background: #F9FAFB;
            height: 200px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9CA3AF;
            font-size: 10pt;
            margin-bottom: 15px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
        }
        
        th {
            background: #F3F4F6;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #E5E7EB;
        }
        
        td {
            padding: 10px;
            border-bottom: 1px solid #E5E7EB;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            font-size: 8pt;
            color: #9CA3AF;
        }
        
        .disclaimer {
            background: #FEE2E2;
            border: 1px solid #FECACA;
            padding: 15px;
            border-radius: 8px;
            margin-top: 30px;
        }
        
        .disclaimer p {
            font-size: 8pt;
            color: #991B1B;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <div class="logo-icon">🌊</div>
            <div class="logo-text">
                <h1>BIORITMO+</h1>
                <p>Relatório de Acompanhamento de Saúde</p>
            </div>
        </div>
        <div class="doc-info">
            <p class="date">Gerado em: ${hoje}</p>
            <p class="date">Período: ${periodo}</p>
        </div>
    </div>
    
    <div class="patient-info">
        <h2>${paciente.nome}</h2>
        <p>Paciente desde: ${new Date(paciente.criado_em).toLocaleDateString('pt-BR')}</p>
    </div>
    
    <div class="section">
        <h3 class="section-title">Score de Saúde</h3>
        <div class="score-box">
            <div class="score-value">${stats.scoreFinal || '--'}</div>
            <div class="score-label">Score Atual (0-100)</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-box">
                <span class="value">${stats.totalCheckins}</span>
                <span class="label">Check-ins</span>
            </div>
            <div class="stat-box">
                <span class="value">${stats.adesao}%</span>
                <span class="label">Adesão</span>
            </div>
            <div class="stat-box">
                <span class="value">${stats.variacaoScore > 0 ? '+' : ''}${stats.variacaoScore}</span>
                <span class="label">Variação</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h3 class="section-title">Médias do Período</h3>
        <div class="stats-grid">
            <div class="stat-box">
                <span class="value">${stats.mediaHumor || '--'}</span>
                <span class="label">Humor (1-10)</span>
            </div>
            <div class="stat-box">
                <span class="value">${stats.mediaEnergia || '--'}</span>
                <span class="label">Energia (1-10)</span>
            </div>
            <div class="stat-box">
                <span class="value">${stats.mediaSono || '--'}</span>
                <span class="label">Sono (1-10)</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h3 class="section-title">Hábitos</h3>
        <div class="stats-grid">
            <div class="stat-box">
                <span class="value">${stats.mediaHorasSono || '--'}h</span>
                <span class="label">Média de Sono</span>
            </div>
            <div class="stat-box">
                <span class="value">${stats.diasComExercicio}</span>
                <span class="label">Dias com Exercício</span>
            </div>
            <div class="stat-box">
                <span class="value">${stats.diasComAgua}</span>
                <span class="label">Dias com Hidratação</span>
            </div>
        </div>
    </div>
    
    <div class="insights">
        <h4>📊 Observações do Período</h4>
        <ul>
            <li>• Total de ${stats.totalCheckins} check-ins registrados</li>
            <li>• Adesão de ${stats.adesao}% ao monitoramento</li>
            ${stats.variacaoScore !== 0 ? `<li>• Variação de ${stats.variacaoScore > 0 ? '+' : ''}${stats.variacaoScore} pontos no score</li>` : ''}
            <li>• Dados coletados via aplicativo BIORITMO+</li>
        </ul>
    </div>
    
    <div class="disclaimer">
        <p><strong>IMPORTANTE:</strong> Este relatório é gerado automaticamente com base nos dados inseridos pelo paciente no aplicativo BIORITMO+. Não substitui avaliação médica profissional. Os dados devem ser interpretados por médico habilitado.</p>
    </div>
    
    <div class="footer">
        <p>BIORITMO+ - Monitoramento Contínuo de Saúde</p>
        <p>Este documento é confidencial e destinado a uso médico.</p>
    </div>
</body>
</html>
        `;
    }
    
    /**
     * Converter HTML para PDF
     */
    async htmlParaPDF(html) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 }
            });
            
            return pdf;
        } finally {
            await browser.close();
        }
    }
    
    /**
     * Gerar relatório consolidado do médico
     */
    async gerarRelatorioMedico(medicoId, dataInicio, dataFim) {
        // Buscar estatísticas gerais
        const stats = await queryOne(`
            SELECT 
                COUNT(DISTINCT mp.paciente_id) as total_pacientes,
                AVG(sc.score_geral) as media_score,
                COUNT(DISTINCT c.id) as total_checkins
            FROM medico_pacientes mp
            LEFT JOIN score_calculos sc ON mp.paciente_id = sc.paciente_id 
                AND sc.data BETWEEN ? AND ?
            LEFT JOIN checkins c ON mp.paciente_id = c.paciente_id 
                AND c.data BETWEEN ? AND ?
            WHERE mp.medico_id = ? AND mp.ativo = 1
        `, [dataInicio, dataFim, dataInicio, dataFim, medicoId]);
        
        return {
            filename: `relatorio_consolidado_${dataInicio}_${dataFim}.pdf`,
            stats
        };
    }
}

module.exports = new RelatorioService();
