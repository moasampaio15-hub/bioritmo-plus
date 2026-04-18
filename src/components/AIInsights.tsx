import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb, Sparkles, Activity, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'tip';
  title: string;
  description: string;
  icon: any;
  action?: string;
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'positive',
      title: 'Padrão de sono melhorando',
      description: 'Seu horário de dormir está mais consistente. Você tem dormido em média 23h15, apenas 15 minutos de variação.',
      icon: Moon,
      action: 'Ver detalhes do sono'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Nível de estresse elevado',
      description: 'Seus check-ins mostram aumento no estresse nas últimas 3 noites. Considere técnicas de relaxamento.',
      icon: AlertCircle,
      action: 'Ver exercícios de respiração'
    },
    {
      id: '3',
      type: 'tip',
      title: 'Momento ideal para exercícios',
      description: 'Baseado nos seus dados, seu nível de energia está mais alto entre 16h e 18h. Este é o melhor horário para atividades físicas.',
      icon: Sun,
      action: 'Ver sugestões de exercícios'
    },
    {
      id: '4',
      type: 'positive',
      title: 'Hidratação em dia!',
      description: 'Você atingiu sua meta de 8 copos de água em 5 dos últimos 7 dias. Continue assim!',
      icon: Activity
    }
  ]);

  const [healthScore, setHealthScore] = useState(85);
  const [scoreTrend, setScoreTrend] = useState(+5);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          bg: 'from-emerald-50 to-teal-50 border-emerald-200',
          icon: 'bg-emerald-500',
          text: 'text-emerald-800'
        };
      case 'warning':
        return {
          bg: 'from-amber-50 to-orange-50 border-amber-200',
          icon: 'bg-amber-500',
          text: 'text-amber-800'
        };
      case 'tip':
        return {
          bg: 'from-sky-50 to-blue-50 border-sky-200',
          icon: 'bg-sky-500',
          text: 'text-sky-800'
        };
      default:
        return {
          bg: 'from-slate-50 to-gray-50 border-slate-200',
          icon: 'bg-slate-500',
          text: 'text-slate-800'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com score */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Insights da IA</h2>
              <p className="text-sm text-slate-500">Análise inteligente dos seus dados</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-3xl font-black text-slate-900">{healthScore}</span>
              <span className={`text-sm font-bold ${scoreTrend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {scoreTrend >= 0 ? '+' : ''}{scoreTrend}
              </span>
            </div>
            <p className="text-xs text-slate-400">Health Score</p>
          </div>
        </div>
        
        {/* Barra de progresso do score */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthScore}%` }}
            className="h-full bg-gradient-to-r from-violet-400 to-purple-600 rounded-full"
          />
        </div>
      </div>

      {/* Lista de insights */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const styles = getTypeStyles(insight.type);
          const Icon = insight.icon;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-4 bg-gradient-to-r ${styles.bg} border`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${styles.icon} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold ${styles.text}`}>{insight.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                  
                  {insight.action && (
                    <button className="mt-3 text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                      {insight.action}
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Análise de correlações */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <h3 className="font-bold text-slate-900">Correlações Descobertas</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Sun className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">Sono → Energia</p>
              <p className="text-xs text-slate-500">Quando você dorme 7+ horas, seu nível de energia aumenta 23%</p>
            </div>
            <span className="text-emerald-500 font-bold text-sm">+23%</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                <Brain className="w-4 h-4 text-rose-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">Exercício → Humor</p>
              <p className="text-xs text-slate-500">Dias com exercício têm 31% mais chances de humor positivo</p>
            </div>
            <span className="text-emerald-500 font-bold text-sm">+31%</span>
          </div>
        </div>
      </div>

      {/* Dica da IA */}
      <div className="glass-card p-5 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-violet-600 mt-0.5" />
          <div>
            <p className="font-bold text-violet-900">Previsão da IA</p>
            <p className="text-sm text-violet-700">
              Baseado nos seus padrões, se você manter a consistência nos próximos 3 dias, 
              seu Health Score deve atingir 90+. Continue o ótimo trabalho!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
