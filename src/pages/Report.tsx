import { useEffect, useState } from "react";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { CheckIn } from "../types";
import { Link, useNavigate } from "react-router-dom";
import { generateWeeklyReport } from "../services/geminiService";
import { motion } from "motion/react";
import { BarChart3, Download, Sparkles, TrendingUp, AlertCircle, CheckCircle2, Heart, ShieldAlert, Lock, Crown, Quote } from "lucide-react";
import { getHealthStatusLabel, getBurnoutStatusLabel } from "../lib/healthLogic";
import { clsx } from "clsx";
import { useTheme } from "../context/ThemeContext";
import ReactMarkdown from "react-markdown";

export default function Report() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      api.getCheckIns(user.id).then(data => {
        setCheckins(data);
        setLoading(false);
      });
    }
  }, [user]);

  const generateAIReport = async () => {
    if (!user?.is_premium) {
      navigate("/subscription");
      return;
    }
    if (checkins.length === 0) return;
    setGenerating(true);
    try {
      const insight = await generateWeeklyReport(checkins);
      setAiInsight(insight);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div>;

  const last7Days = checkins.slice(0, 7);
  const avgSleep = last7Days.reduce((acc, c) => acc + c.sleep_hours, 0) / (last7Days.length || 1);
  const avgMood = last7Days.reduce((acc, c) => acc + c.mood, 0) / (last7Days.length || 1);
  const avgEnergy = last7Days.reduce((acc, c) => acc + c.energy, 0) / (last7Days.length || 1);
  const avgPain = last7Days.reduce((acc, c) => acc + c.pain, 0) / (last7Days.length || 1);
  const avgStress = last7Days.reduce((acc, c) => acc + c.stress_level, 0) / (last7Days.length || 1);
  const healthScore = last7Days[0]?.health_score || 0;
  const burnoutScore = last7Days[0]?.burnout_score || 0;

  const Card = ({ title, children, icon: Icon, color }: any) => (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className={clsx("w-4 h-4", color)} />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Relatório Semanal</h2>
          <p className="text-slate-500">Resumo dos seus últimos 7 dias.</p>
        </div>
        <button className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-600 hover:text-sky-600 transition-colors">
          <Download className="w-5 h-5" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Score de Saúde" icon={Heart} color="text-sky-500">
          <div className="space-y-1">
            <span className="text-3xl font-black text-sky-600">{healthScore}</span>
            <p className="text-[10px] font-bold text-sky-600/60 uppercase">{getHealthStatusLabel(healthScore)}</p>
          </div>
        </Card>
        <Card title="Risco Burnout" icon={ShieldAlert} color="text-orange-500">
          <div className="space-y-1">
            <span className="text-3xl font-black text-orange-500">{burnoutScore}%</span>
            <p className="text-[10px] font-bold text-orange-500/60 uppercase">{getBurnoutStatusLabel(burnoutScore)}</p>
          </div>
        </Card>
      </div>

      <Card title="Resumo da Semana" icon={TrendingUp} color="text-blue-500">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Média de Sono</p>
            <p className="text-lg font-bold text-slate-700">{avgSleep.toFixed(1)}h</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Média Humor</p>
            <p className="text-lg font-bold text-slate-700">{avgMood.toFixed(1)}/5</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Média Energia</p>
            <p className="text-lg font-bold text-slate-700">{avgEnergy.toFixed(1)}/10</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Média Estresse</p>
            <p className="text-lg font-bold text-slate-700">{avgStress.toFixed(1)}/10</p>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            Insights de IA
          </h3>
          {!aiInsight && (
            <button 
              onClick={generateAIReport}
              disabled={generating}
              className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-4 py-2 rounded-full border border-sky-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {generating ? "Gerando..." : "Gerar Análise"}
            </button>
          )}
        </div>

        <div className="glass-card p-6 min-h-[100px] relative overflow-hidden">
          {!user?.is_premium ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="p-5 bg-sky-50 dark:bg-sky-900/20 rounded-full relative">
                <Sparkles className="w-10 h-10 text-sky-600 dark:text-sky-400" />
                <Lock className="w-5 h-5 text-sky-600 dark:text-sky-400 absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1" />
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white">Insights de IA Premium</h4>
                <p className="text-slate-500 text-xs max-w-[240px] mx-auto">
                  Assine o Bioritmo+ Premium para receber análises profundas da sua saúde geradas por IA.
                </p>
              </div>
              <Link to="/subscription" className="w-full max-w-[200px] py-4 bg-sky-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                Ver Planos
              </Link>
            </div>
          ) : generating && (
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">Analisando seus dados...</p>
              </div>
            </div>
          )}
          
          {user?.is_premium && (aiInsight ? (
            <div className="markdown-body prose prose-slate dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-sky-700 dark:prose-strong:text-sky-400 prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
              <ReactMarkdown>{aiInsight}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm max-w-[200px]">Clique em "Gerar Análise" para receber recomendações personalizadas da IA.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Pontos de Atenção</h3>
        <div className="space-y-3">
          {avgStress > 6 && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-800 font-medium">Seu nível de estresse médio está alto. Considere técnicas de relaxamento.</p>
            </div>
          )}
          {avgSleep < 6 && (
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <p className="text-sm text-orange-800 font-medium">Você está dormindo menos de 6h por noite. O sono é vital para a recuperação.</p>
            </div>
          )}
          {avgSleep >= 7 && avgStress < 5 && (
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
              <p className="text-sm text-sky-800 font-medium">Ótimo equilíbrio entre sono e estresse esta semana! Continue assim.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
