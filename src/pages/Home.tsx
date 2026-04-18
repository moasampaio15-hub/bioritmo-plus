import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { CheckIn } from "../types";
import { getHealthStatusLabel, getBurnoutStatusLabel } from "../lib/healthLogic";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Activity, BarChart3, ChevronRight, Heart, Zap, ShieldAlert, 
  Flame, Bell, Sparkles, Quote, Wind, Trophy, Dumbbell, 
  Users, Moon, CheckCircle2, Droplets, Timer, Play, Pause, RefreshCw, TrendingUp, TrendingDown, Brain, Info, Smile, Footprints, Crown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine, Legend, ScatterChart, Scatter, ZAxis } from "recharts";
import { calculateStreak } from "../lib/streakLogic";

export default function Home() {
  const { user } = useAuth();
  const [todayCheckin, setTodayCheckin] = useState<CheckIn | null>(null);
  const [recentCheckins, setRecentCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  
  // New States for Suggestions
  const [waterIntake, setWaterIntake] = useState(0);
  const [habits, setHabits] = useState([
    { id: 1, label: "Bebi 2L de água", completed: false },
    { id: 2, label: "15 min de Sol", completed: false },
    { id: 3, label: "Sem telas antes de dormir", completed: false },
    { id: 4, label: "Leitura rápida", completed: false },
  ]);
  
  // Pomodoro Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const [showSuccessMessage, setShowSuccessMessage] = useState(isSuccess);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.getTodayCheckIn(user.id),
        api.getCheckIns(user.id)
      ]).then(([today, all]) => {
        setTodayCheckin(today);
        setRecentCheckins(all);
        setLoading(false);
      });
    }
  }, [user]);

  // Pomodoro Logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Suggest breathing exercise when timer ends
      alert("Tempo de foco concluído! Que tal 1 minuto de respiração agora?");
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div>;

  const latestCheckin = todayCheckin || recentCheckins[0];
  const healthScore = latestCheckin?.health_score || 0;
  const burnoutScore = latestCheckin?.burnout_score || 0;
  const streak = calculateStreak(recentCheckins);

  // Evolution Comparison Logic
  const last7Days = recentCheckins.slice(0, 7);
  const weeklyAvg = last7Days.length > 0 
    ? last7Days.reduce((acc, c) => acc + c.health_score, 0) / last7Days.length 
    : 0;
  const evolutionDiff = healthScore - weeklyAvg;
  const evolutionPercent = weeklyAvg > 0 ? (evolutionDiff / weeklyAvg) * 100 : 0;

  const totalDays = last7Days.length || 1;
  const habitStats = {
    exercise: (last7Days.filter(c => c.exercise_today).length / totalDays) * 100,
    meditation: (last7Days.filter(c => c.meditation_today).length / totalDays) * 100,
    social: (last7Days.filter(c => c.social_connection_today).length / totalDays) * 100,
  };

  const chartData = recentCheckins
    .slice(0, 7)
    .reverse()
    .map(c => ({
      name: new Date(c.date).toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
      score: c.health_score,
      burnout: c.burnout_score,
      sleep: c.sleep_hours,
      quality: c.sleep_quality
    }));

  return (
    <div className="space-y-10 pb-10">
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-6 right-6 z-50 bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 flex items-center gap-5 border border-white/10"
          >
            <div className="w-14 h-14 bg-sky-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
              <Crown className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-lg leading-tight">Bem-vindo ao Premium!</h4>
              <p className="text-xs text-slate-400 font-medium">Sua conta foi atualizada com sucesso. Aproveite todos os recursos.</p>
            </div>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-slate-500 font-medium text-sm">Olá, {user?.full_name.split(" ")[0]} 👋</p>
            {user?.is_premium && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-sky-500 text-white text-[8px] font-black uppercase rounded-md shadow-lg shadow-sky-500/20">
                <Crown className="w-2 h-2" />
                Premium
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-display text-slate-900 leading-tight">Seu <span className="text-sky-600">equilíbrio</span></h2>
        </div>
        
        {/* Streak Counter & Trend */}
        <div className="flex flex-col items-end gap-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 shadow-sm shadow-orange-200/20"
          >
            <Flame className={clsx("w-5 h-5", streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-300")} />
            <div className="flex flex-col">
              <span className="text-lg font-black text-orange-600 leading-none">{streak}</span>
              <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest">Dias</span>
            </div>
          </motion.div>

          {recentCheckins.length >= 2 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-24 h-10 flex flex-col items-end"
            >
              <div className="w-full h-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#0ea5e9" 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={clsx(
                  "text-[6px] font-black uppercase tracking-widest px-1 py-0.5 rounded-sm border",
                  healthScore >= 85 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  healthScore >= 70 ? "bg-sky-50 text-sky-600 border-sky-100" :
                  healthScore >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                  healthScore >= 30 ? "bg-orange-50 text-orange-600 border-orange-100" :
                  "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                  {getHealthStatusLabel(healthScore)}
                </span>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Tendência 7d</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Evolution Comparison Card */}
      {recentCheckins.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={clsx(
            "glass-card p-4 flex items-center justify-between border-l-4",
            evolutionDiff >= 0 ? "border-l-emerald-500 bg-emerald-50/30" : "border-l-amber-500 bg-amber-50/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={clsx(
              "p-2 rounded-xl",
              evolutionDiff >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            )}>
              {evolutionDiff >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evolução Semanal</p>
              <p className="text-sm font-bold text-slate-700">
                {evolutionDiff >= 0 
                  ? `Seu score está ${Math.abs(Math.round(evolutionPercent))}% melhor que sua média!` 
                  : `Seu score está ${Math.abs(Math.round(evolutionPercent))}% abaixo da sua média.`}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Notification Simulation */}
      <AnimatePresence>
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-5 border-l-4 border-l-sky-500 flex items-center gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <Bell className="w-12 h-12 text-sky-600" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-sky-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Insight da Manhã</p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Baseado no seu sono, o melhor horário para seu treino hoje é às <span className="font-bold text-slate-900">17:30</span>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gratitude Section */}
      {latestCheckin?.gratitude && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 bg-rose-50/50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30 relative overflow-hidden"
        >
          <Quote className="absolute -top-2 -right-2 w-16 h-16 text-rose-500/10 rotate-12" />
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Gratidão de Hoje</span>
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
            "{latestCheckin.gratitude}"
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Hydration Widget */}
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 flex flex-col justify-between space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-500">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hidratação</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black text-display text-slate-900">{waterIntake * 250}ml</p>
              <p className="text-[10px] text-slate-500 font-medium">{waterIntake}/8 copos</p>
            </div>
            <button 
              onClick={() => setWaterIntake(prev => Math.min(prev + 1, 12))}
              className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 active:scale-90 transition-transform"
            >
              <span className="text-xl font-bold">+</span>
            </button>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sky-500 transition-all duration-500" 
              style={{ width: `${(waterIntake / 8) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Pomodoro Timer Widget */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
              <Timer className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Foco</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-display text-slate-900">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setTimerActive(!timerActive)}
              className={clsx(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                timerActive ? "bg-slate-100 text-slate-600" : "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
              )}
            >
              {timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {timerActive ? "Pausar" : "Focar"}
            </button>
            <button 
              onClick={() => { setTimerActive(false); setTimeLeft(25 * 60); }}
              className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Score Info Modal */}
      <AnimatePresence>
        {showScoreInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScoreInfo(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 relative z-10 shadow-2xl"
            >
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Score de Vitalidade</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Como calculamos</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Sono", desc: "Duração e qualidade do descanso.", icon: Moon, color: "text-indigo-500" },
                  { label: "Hábitos", desc: "Exercícios, hidratação e meditação.", icon: Zap, color: "text-amber-500" },
                  { label: "Estado Mental", desc: "Humor, estresse e energia.", icon: Smile, color: "text-sky-500" },
                  { label: "Saúde Física", desc: "Níveis de dor e biomarcadores.", icon: Activity, color: "text-rose-500" },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className={clsx("p-2 bg-slate-50 rounded-xl shrink-0", item.color)}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowScoreInfo(false)}
                className="w-full py-4 bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
              >
                Entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Daily Goals Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="col-span-2 space-y-6"
        >
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-display text-slate-900">Metas do Dia</h3>
            <Link to="/profile" className="text-[10px] font-bold text-sky-600 uppercase tracking-widest hover:underline">Ajustar Metas</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-500">
                  <Footprints className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passos</p>
                  <p className="text-xs font-bold text-slate-600">Meta: {user?.daily_steps_goal?.toLocaleString() || "10.000"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-slate-900">
                    {latestCheckin?.steps_count?.toLocaleString() || "0"}
                  </span>
                  <span className="text-[10px] font-bold text-sky-600 uppercase">
                    {Math.min(Math.round(((latestCheckin?.steps_count || 0) / (user?.daily_steps_goal || 10000)) * 100), 100)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((latestCheckin?.steps_count || 0) / (user?.daily_steps_goal || 10000)) * 100, 100)}%` }}
                    className="h-full bg-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
                  <Timer className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exercício</p>
                  <p className="text-xs font-bold text-slate-600">Meta: {user?.daily_exercise_minutes_goal || "30"} min</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-slate-900">{latestCheckin?.exercise_today ? user?.daily_exercise_minutes_goal : "0"} min</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">{latestCheckin?.exercise_today ? "100%" : "0%"}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: latestCheckin?.exercise_today ? "100%" : "0%" }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Daily Habits Checklist */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 glass-card p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-display text-slate-900">Vitórias de Hoje</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {habits.filter(h => h.completed).length}/{habits.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {habits.map(habit => (
              <button
                key={habit.id}
                onClick={() => setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completed: !h.completed } : h))}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                  habit.completed 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                )}
              >
                <CheckCircle2 className={clsx("w-5 h-5", habit.completed ? "text-emerald-500" : "text-slate-200")} />
                <span className={clsx("text-xs font-bold", habit.completed && "line-through opacity-60")}>
                  {habit.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Breathing Quick Action */}
        <Link 
          to="/breathing"
          className="glass-card p-6 flex flex-col justify-between group hover:scale-[1.02] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Wind className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-display text-slate-900 dark:text-white leading-tight">Respirar</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4-4-4-4</p>
          </div>
        </Link>

        {/* Achievements Quick Action */}
        <Link 
          to="/achievements"
          className="glass-card p-6 flex flex-col justify-between group hover:scale-[1.02] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-display text-slate-900 dark:text-white leading-tight">Conquistas</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ver Medalhas</p>
          </div>
        </Link>

        {/* Wellness Guide Quick Action */}
        <Link 
          to="/wellness-guide"
          className="col-span-2 glass-card p-6 flex items-center gap-6 group hover:scale-[1.01] transition-all bg-sky-600 border-none text-white"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-display text-xl leading-tight">Guia de Bem-estar</h3>
            <p className="text-xs text-sky-100 font-medium opacity-90">Dicas personalizadas para seu equilíbrio hoje.</p>
          </div>
          <ChevronRight className="w-5 h-5 ml-auto text-white/50 group-hover:text-white transition-colors" />
        </Link>

        {/* Main Score Card - Bento Large */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 glass-card p-8 flex flex-col items-center text-center space-y-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Heart className="w-32 h-32 text-sky-600" />
          </div>
          
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] relative z-10">Score de Vitalidade</p>
          
          <button 
            onClick={() => setShowScoreInfo(true)}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-sky-500 transition-colors z-20"
          >
            <Info className="w-5 h-5" />
          </button>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <span className="text-7xl font-black text-display text-slate-900 leading-none">{healthScore}</span>
              <div className="absolute -top-2 -right-6">
                <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse" />
              </div>
            </div>
            <span className="mt-2 px-4 py-1 bg-sky-50 text-sky-600 text-[10px] font-bold uppercase rounded-full border border-sky-100">
              {getHealthStatusLabel(healthScore)}
            </span>
          </div>

          <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden relative z-10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full premium-gradient"
            />
          </div>
        </motion.div>

        {/* Burnout Risk - Bento Small */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col justify-between space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className={clsx(
              "p-2 rounded-xl",
              burnoutScore > 50 ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"
            )}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Burnout</span>
          </div>
          <div>
            <p className="text-2xl font-black text-display text-slate-900">{burnoutScore}%</p>
            <p className="text-[10px] text-slate-500 font-medium">{getBurnoutStatusLabel(burnoutScore)}</p>
          </div>
        </motion.div>

        {/* Sleep Summary - Bento Small */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 flex flex-col justify-between space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
              <Moon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sono (7d)</span>
          </div>
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="sleep" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="quality" stroke="#818cf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-lg font-black text-display text-slate-900">{(chartData.reduce((acc, d) => acc + d.sleep, 0) / (chartData.length || 1)).toFixed(1)}h</p>
            <p className="text-[8px] text-slate-400 font-bold uppercase">Média</p>
          </div>
        </motion.div>

        {/* Quick Action - Bento Large */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 glass-card p-6 flex flex-col justify-between space-y-4 bg-slate-900 border-none group cursor-pointer"
        >
          <Link to="/checkin" className="h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/10 rounded-xl text-white group-hover:bg-sky-500 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-lg font-bold text-display text-white">Check-in</p>
              <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Atualizar agora</p>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Daily Tip - AI Insight Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-sky-50 p-6 rounded-[2rem] border border-sky-100 flex gap-5 items-center relative overflow-hidden"
      >
        <div className="absolute -right-4 -bottom-4 opacity-5">
          <Zap className="w-24 h-24 text-sky-600" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Zap className="w-6 h-6 text-sky-600" />
        </div>
        <div className="space-y-1 relative z-10">
          <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Dica do Dia</p>
          <p className="text-sm text-sky-900 leading-relaxed font-medium">
            {healthScore > 80 
              ? "Seu score está excelente! Aproveite esse pico de energia para realizar tarefas complexas."
              : "Tente beber 500ml de água agora. Pequenos hábitos geram grandes mudanças no seu score."}
          </p>
        </div>
      </motion.div>
      
      {/* My Habits Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-display text-slate-900">Meus Hábitos</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimos 7 dias</span>
        </div>

        <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Exercise */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-50 rounded-lg">
                  <Dumbbell className="w-3.5 h-3.5 text-sky-500" />
                </div>
                <span className="text-xs font-bold text-slate-700">Exercício</span>
              </div>
              <span className="text-xs font-black text-sky-600">{Math.round(habitStats.exercise)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${habitStats.exercise}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-sky-500"
              />
            </div>
          </div>

          {/* Meditation */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <span className="text-xs font-bold text-slate-700">Meditação</span>
              </div>
              <span className="text-xs font-black text-purple-600">{Math.round(habitStats.meditation)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${habitStats.meditation}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-purple-500"
              />
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <span className="text-xs font-bold text-slate-700">Conexão Social</span>
              </div>
              <span className="text-xs font-black text-rose-600">{Math.round(habitStats.social)}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${habitStats.social}%` }}
                transition={{ duration: 1, delay: 0.8 }}
                className="h-full bg-rose-500"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Sleep Analysis Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-display text-slate-900">Análise do Sono</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Horas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Qualidade</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="glass-card p-6 h-64">
            {recentCheckins.length < 1 ? (
              <div className="text-center py-12 space-y-3 h-full flex flex-col justify-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Moon className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-medium">Registre seu sono para ver a análise.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 12]} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '20px' }}
                  />
                  <ReferenceLine 
                    y={8} 
                    stroke="#94a3b8" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'Meta 8h', 
                      position: 'right', 
                      fill: '#94a3b8', 
                      fontSize: 10, 
                      fontWeight: 700 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Horas" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke="#818cf8" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Qualidade" 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Correlation Chart */}
          <div className="glass-card p-6 h-64">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Correlação: Horas vs Qualidade</span>
            </div>
            {recentCheckins.length < 1 ? (
              <div className="text-center py-12 space-y-3 h-full flex flex-col justify-center">
                <p className="text-slate-400 text-sm font-medium">Dados insuficientes.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="sleep" 
                    name="Horas" 
                    unit="h" 
                    domain={[0, 12]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    label={{ value: 'Horas de Sono', position: 'bottom', offset: 0, fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="quality" 
                    name="Qualidade" 
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    label={{ value: 'Qualidade', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <ZAxis type="number" range={[100, 100]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  />
                  <Scatter name="Sono" data={chartData} fill="#0ea5e9" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </motion.section>

      {/* Weekly Summary */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <h3 className="font-bold text-display text-slate-900">Jornada Semanal</h3>
            <div className="flex items-center gap-2">
              <span className={clsx(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                healthScore >= 85 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                healthScore >= 70 ? "bg-sky-50 text-sky-600 border-sky-100" :
                healthScore >= 50 ? "bg-amber-50 text-amber-600 border-amber-100" :
                healthScore >= 30 ? "bg-orange-50 text-orange-600 border-orange-100" :
                "bg-rose-50 text-rose-600 border-rose-100"
              )}>
                {getHealthStatusLabel(healthScore)}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Atual: {healthScore}</span>
            </div>
          </div>
          <Link to="/history" className="text-sky-600 text-xs font-bold flex items-center gap-1 hover:underline mb-1">
            Ver Histórico <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="glass-card p-6 h-64">
          {recentCheckins.length < 2 ? (
            <div className="text-center py-12 space-y-3 h-full flex flex-col justify-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Continue registrando para ver sua evolução.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Label Below Chart */}
        {recentCheckins.length >= 2 && (
          <div className="space-y-4">
            <div className={clsx(
              "w-full p-4 rounded-[2rem] border-2 flex items-center justify-center gap-4 shadow-sm transition-all",
              healthScore >= 85 ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
              healthScore >= 70 ? "bg-sky-50 border-sky-100 text-sky-700" :
              healthScore >= 50 ? "bg-amber-50 border-amber-100 text-amber-700" :
              healthScore >= 30 ? "bg-orange-50 border-orange-100 text-orange-700" :
              "bg-rose-50 border-rose-100 text-rose-700"
            )}>
              <div className={clsx(
                "p-2 rounded-xl",
                healthScore >= 85 ? "bg-emerald-500 text-white" :
                healthScore >= 70 ? "bg-sky-500 text-white" :
                healthScore >= 50 ? "bg-amber-500 text-white" :
                healthScore >= 30 ? "bg-orange-500 text-white" :
                "bg-rose-500 text-white"
              )}>
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Status de Saúde</span>
                <span className="text-lg font-black uppercase tracking-tight">{getHealthStatusLabel(healthScore)}</span>
              </div>
            </div>

            {/* Score Breakdown Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Composição do Score</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Sleep Factor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                      <Moon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Sono e Descanso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500" 
                        style={{ width: `${Math.min(100, ((latestCheckin?.sleep_hours || 0) / 9) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600">{latestCheckin?.sleep_hours || 0}h</span>
                  </div>
                </div>

                {/* Stress/Mood Factor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-50 rounded-lg text-purple-500">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Mente e Estresse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500" 
                        style={{ width: `${(latestCheckin?.stress_level || 0) * 10}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-purple-600">{latestCheckin?.stress_level || 0}/10</span>
                  </div>
                </div>

                {/* Energy/Activity Factor */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Energia e Atividade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500" 
                        style={{ width: `${(latestCheckin?.energy || 0) * 10}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-amber-600">{latestCheckin?.energy || 0}/10</span>
                  </div>
                </div>

                {/* Habits Summary */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {latestCheckin?.exercise_today && (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-md border border-emerald-100">
                      + Exercício
                    </span>
                  )}
                  {latestCheckin?.meditation_today && (
                    <span className="px-2 py-1 bg-sky-50 text-sky-600 text-[8px] font-black uppercase rounded-md border border-sky-100">
                      + Meditação
                    </span>
                  )}
                  {latestCheckin?.water && latestCheckin.water >= 8 && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-md border border-blue-100">
                      + Hidratação
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.section>

      {/* Premium CTA - If not premium */}
      {!user?.is_premium && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="premium-gradient p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl shadow-sky-600/20"
        >
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-display leading-tight">Desbloqueie seu potencial máximo</h4>
            <p className="text-sky-100 text-sm leading-relaxed opacity-90">
              Tenha acesso a relatórios detalhados com IA, tendências de longo prazo e recomendações personalizadas.
            </p>
          </div>
          <Link 
            to="/subscription" 
            className="block w-full py-4 bg-white text-sky-600 font-black text-center rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Seja Premium
          </Link>
        </motion.div>
      )}
    </div>
  );
}
