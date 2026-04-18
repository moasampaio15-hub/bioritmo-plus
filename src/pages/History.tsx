import { useEffect, useState } from "react";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { CheckIn } from "../types";
import { motion } from "motion/react";
import { Calendar, ChevronRight, Heart, Moon, Zap, AlertCircle, Filter, X, Search, Sparkles, Footprints } from "lucide-react";
import { clsx } from "clsx";

export default function History() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheckin, setSelectedCheckin] = useState<CheckIn | null>(null);
  
  // Filter states
  const [filterMood, setFilterMood] = useState<number | null>(null);
  const [filterMinScore, setFilterMinScore] = useState<number>(0);
  const [filterDate, setFilterDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (user) {
      api.getCheckIns(user.id).then(data => {
        setCheckins(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div>;

  const getMoodConfig = (m: number) => {
    const configs: Record<number, { emoji: string, color: string, label: string, bg: string, border: string, accent: string }> = {
      1: { emoji: "😫", color: "text-red-600", label: "Exausto", bg: "bg-red-50/50", border: "border-red-100", accent: "bg-red-500" },
      2: { emoji: "😕", color: "text-orange-600", label: "Para baixo", bg: "bg-orange-50/50", border: "border-orange-100", accent: "bg-orange-500" },
      3: { emoji: "😐", color: "text-amber-600", label: "Neutro", bg: "bg-amber-50/50", border: "border-amber-100", accent: "bg-amber-500" },
      4: { emoji: "🙂", color: "text-sky-600", label: "Bem", bg: "bg-sky-50/50", border: "border-sky-100", accent: "bg-sky-500" },
      5: { emoji: "🤩", color: "text-emerald-600", label: "Incrível", bg: "bg-emerald-50/50", border: "border-emerald-100", accent: "bg-emerald-500" },
    };
    return configs[m] || configs[3];
  };

  const filteredCheckins = checkins.filter(c => {
    const matchesMood = filterMood === null || c.mood === filterMood;
    const matchesScore = c.health_score >= filterMinScore;
    const matchesDate = !filterDate || c.date.startsWith(filterDate);
    return matchesMood && matchesScore && matchesDate;
  });

  const clearFilters = () => {
    setFilterMood(null);
    setFilterMinScore(0);
    setFilterDate("");
    setVisibleCount(10);
  };

  const hasActiveFilters = filterMood !== null || filterMinScore > 0 || filterDate !== "";

  const visibleCheckins = filteredCheckins.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCheckins.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-display text-slate-900">Seu <span className="text-sky-600">Histórico</span></h2>
          <p className="text-xs text-slate-500 font-medium">Acompanhe sua jornada de bem-estar.</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            "p-3 rounded-2xl border transition-all relative",
            showFilters || hasActiveFilters ? "bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-600/20" : "bg-white border-slate-100 text-slate-400"
          )}
        >
          <Filter className="w-5 h-5" />
          {hasActiveFilters && !showFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </header>

      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filtros</h3>
            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  {filteredCheckins.length} {filteredCheckins.length === 1 ? 'resultado' : 'resultados'}
                </span>
              )}
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-sky-600 uppercase flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mood Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Humor</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(m => (
                  <button
                    key={m}
                    onClick={() => setFilterMood(filterMood === m ? null : m)}
                    className={clsx(
                      "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border",
                      filterMood === m ? "bg-sky-50 border-sky-200 scale-110" : "bg-slate-50 border-transparent opacity-60"
                    )}
                  >
                    {getMoodConfig(m).emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Mínimo: {filterMinScore}</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={filterMinScore}
                onChange={(e) => setFilterMinScore(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            {/* Date Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</label>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative space-y-6 before:absolute before:left-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {filteredCheckins.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 ml-16">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum registro encontrado com esses filtros.</p>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="mt-4 text-sky-600 font-bold text-sm"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {visibleCheckins.map((c, idx) => {
              const mood = getMoodConfig(c.mood);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-16 group"
                >
                  {/* Timeline Dot */}
                  <div className={clsx(
                    "absolute left-6 top-8 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-125",
                    mood.accent
                  )} />

                  <div
                    onClick={() => setSelectedCheckin(selectedCheckin?.id === c.id ? null : c)}
                    className={clsx(
                      "p-6 rounded-[2.5rem] shadow-sm border transition-all cursor-pointer active:scale-98 group/card",
                      mood.bg, mood.border,
                      selectedCheckin?.id === c.id ? "shadow-xl ring-2 ring-sky-500/10" : "hover:shadow-md hover:bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={clsx(
                          "w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm bg-white transition-transform group-hover/card:scale-110"
                        )}>
                          {mood.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(c.date).toLocaleDateString('pt-BR', { weekday: 'long' })}
                            </p>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <div className={clsx(
                              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                              mood.color, "bg-white/50"
                            )}>
                              {mood.label}
                            </div>
                          </div>
                          <h3 className="font-bold text-slate-900 text-lg leading-none">
                            {new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                          </h3>
                          
                          <div className="flex gap-4 mt-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                                <span className="text-xs font-black text-slate-700">{c.health_score}</span>
                              </div>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${c.health_score}%` }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-black text-slate-700">{c.energy}/10</span>
                              </div>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${c.energy * 10}%` }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Moon className="w-3 h-3 text-blue-500 fill-blue-500" />
                                <span className="text-xs font-black text-slate-700">{c.sleep_hours}h</span>
                              </div>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${(c.sleep_hours / 12) * 100}%` }} />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Footprints className="w-3 h-3 text-sky-500" />
                                <span className="text-xs font-black text-slate-700">{c.steps_count?.toLocaleString() || 0}</span>
                              </div>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500" style={{ width: `${Math.min(((c.steps_count || 0) / (user?.daily_steps_goal || 10000)) * 100, 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center border border-white shadow-sm">
                          <ChevronRight className={clsx(
                            "w-5 h-5 text-slate-400 transition-all",
                            selectedCheckin?.id === c.id && "rotate-90 text-sky-500"
                          )} />
                        </div>
                      </div>
                    </div>

                    {selectedCheckin?.id === c.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-8 pt-8 border-t border-slate-900/5 space-y-6"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="p-4 bg-white/50 rounded-2xl border border-white shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estresse</p>
                            <p className="font-bold text-slate-700">{c.stress_level}/10</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-2xl border border-white shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dor</p>
                            <p className="font-bold text-slate-700">{c.pain}/10</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-2xl border border-white shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Água (250ml)</p>
                            <p className="font-bold text-slate-700">{c.water} copos</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-2xl border border-white shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso</p>
                            <p className="font-bold text-slate-700">{c.weight} kg</p>
                          </div>
                          <div className="p-4 bg-white/50 rounded-2xl border border-white shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Passos</p>
                            <p className="font-bold text-slate-700">{c.steps_count?.toLocaleString() || 0}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {c.notes && (
                            <div className="p-5 bg-white/80 rounded-3xl border border-white shadow-sm relative overflow-hidden">
                              <Sparkles className="absolute -right-2 -top-2 w-12 h-12 text-sky-200/30 rotate-12" />
                              <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-2">Reflexão do Dia</p>
                              <p className="text-sm text-slate-700 italic leading-relaxed font-medium">"{c.notes}"</p>
                            </div>
                          )}

                          {c.tomorrow_goals && (
                            <div className="p-5 bg-emerald-500 rounded-3xl shadow-lg shadow-emerald-500/20 text-white">
                              <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2">Foco para Amanhã</p>
                              <p className="text-sm leading-relaxed font-bold">{c.tomorrow_goals}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {hasMore && (
              <div className="pl-16 pt-4">
                <button 
                  onClick={loadMore}
                  className="w-full py-4 bg-white border border-slate-100 rounded-3xl text-sm font-black text-sky-600 uppercase tracking-widest hover:bg-sky-50 transition-colors shadow-sm"
                >
                  Carregar mais registros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
