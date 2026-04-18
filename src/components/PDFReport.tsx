import { useState } from 'react';
import { FileText, Download, TrendingUp, Calendar, Activity, Moon, Heart, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface HealthData {
  period: string;
  avgSleep: number;
  avgMood: number;
  avgEnergy: number;
  checkinsCount: number;
  streakDays: number;
  improvements: string[];
  recommendations: string[];
}

export function PDFReportGenerator() {
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const mockData: HealthData = {
    period: 'Últimos 7 dias',
    avgSleep: 7.2,
    avgMood: 4.2,
    avgEnergy: 7.8,
    checkinsCount: 7,
    streakDays: 5,
    improvements: [
      'Qualidade do sono melhorou 15%',
      'Nível de energia mais consistente',
      'Hidratação adequada todos os dias'
    ],
    recommendations: [
      'Tente manter horário regular de sono',
      'Aumente atividade física leve',
      'Pratique respiração antes de dormir'
    ]
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    // Simulação de geração de PDF
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Criar conteúdo HTML do relatório
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório BIORITMO+</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #3B82F6; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 10px 0 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #1e293b; border-left: 4px solid #3B82F6; padding-left: 15px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .stat-box { background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; }
          .stat-value { font-size: 32px; font-weight: bold; color: #3B82F6; }
          .stat-label { color: #64748b; font-size: 14px; }
          .improvements { background: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #22c55e; }
          .recommendations { background: #eff6ff; padding: 20px; border-radius: 10px; border-left: 4px solid #3B82F6; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin: 8px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 BIORITMO+</h1>
          <p>Relatório de Saúde e Bem-estar</p>
          <p style="color: #999; font-size: 12px;">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="section">
          <h2>📊 Resumo do Período</h2>
          <p><strong>Período analisado:</strong> ${mockData.period}</p>
          <p><strong>Check-ins realizados:</strong> ${mockData.checkinsCount} de 7 dias</p>
          <p><strong>Sequência atual:</strong> ${mockData.streakDays} dias consecutivos</p>
        </div>
        
        <div class="section">
          <h2>📈 Métricas Principais</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${mockData.avgSleep}h</div>
              <div class="stat-label">Média de Sono</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${mockData.avgMood}/5</div>
              <div class="stat-label">Média de Humor</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${mockData.avgEnergy}/10</div>
              <div class="stat-label">Média de Energia</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">85</div>
              <div class="stat-label">Score de Saúde</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>✅ Melhorias Identificadas</h2>
          <div class="improvements">
            <ul>
              ${mockData.improvements.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="section">
          <h2>💡 Recomendações</h2>
          <div class="recommendations">
            <ul>
              ${mockData.recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>BIORITMO+ by Sampaio Diagnóstico</p>
          <p>Este relatório é gerado automaticamente baseado nos seus check-ins diários.</p>
        </div>
      </body>
      </html>
    `;
    
    // Abrir em nova aba para impressão/PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.print();
    }
    
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Relatório de Saúde</h2>
            <p className="text-sm text-slate-500">PDF profissional para médicos</p>
          </div>
        </div>
        
        {/* Seletor de período */}
        <div className="flex gap-2 mb-4">
          {[
            { id: '7d', label: '7 dias' },
            { id: '30d', label: '30 dias' },
            { id: '90d', label: '3 meses' }
          ].map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedPeriod === period.id
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        {/* Botão gerar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generatePDF}
          disabled={generating}
          className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-2xl shadow-lg shadow-sky-500/25 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gerando relatório...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Gerar Relatório PDF
            </>
          )}
        </motion.button>
      </div>

      {/* Preview das métricas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Moon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">7.2h</p>
            <p className="text-xs text-slate-500">Média de sono</p>
          </div>
        </div>
        
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">7.8/10</p>
            <p className="text-xs text-slate-500">Nível de energia</p>
          </div>
        </div>
        
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">4.2/5</p>
            <p className="text-xs text-slate-500">Média de humor</p>
          </div>
        </div>
        
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">85</p>
            <p className="text-xs text-slate-500">Score de saúde</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="glass-card p-4 bg-sky-50 border-sky-200">
        <p className="text-sm text-sky-800">
          <strong>💡 Dica:</strong> O relatório PDF inclui gráficos, tendências e recomendações 
          personalizadas baseadas nos seus dados. Ideal para consultas médicas.
        </p>
      </div>
    </div>
  );
}
