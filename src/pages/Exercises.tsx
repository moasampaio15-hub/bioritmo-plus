import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ChevronLeft, Dumbbell, Zap, Heart, Sparkles, 
  ArrowRight, Activity, Timer, Sun, Search, Wind, Lock
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import Paywall from "../components/Paywall";

const EXERCISES = [
  {
    id: 1,
    title: "Alongamento Matinal",
    duration: 5,
    durationLabel: "5 min",
    intensity: "Baixa",
    muscleGroup: "Corpo Inteiro",
    description: "Movimentos suaves para despertar as articulações e melhorar a circulação logo cedo.",
    icon: Sun,
    color: "bg-amber-50 text-amber-600",
    steps: ["Estique os braços para cima", "Incline o pescoço suavemente", "Gire os ombros para trás"],
    isPremium: false
  },
  {
    id: 2,
    title: "Caminhada Consciente",
    duration: 15,
    durationLabel: "15 min",
    intensity: "Baixa",
    muscleGroup: "Pernas",
    description: "Caminhe em um ritmo confortável, focando na sensação dos pés tocando o chão.",
    icon: Activity,
    color: "bg-sky-50 text-sky-600",
    steps: ["Mantenha a postura ereta", "Respire ritmicamente", "Observe o ambiente ao redor"],
    isPremium: false
  },
  {
    id: 3,
    title: "Agachamentos Leves",
    duration: 3,
    durationLabel: "3 min",
    intensity: "Média",
    muscleGroup: "Pernas",
    description: "Fortaleça as pernas e melhore o metabolismo com agachamentos controlados.",
    icon: Dumbbell,
    color: "bg-emerald-50 text-emerald-600",
    steps: ["Pés na largura dos ombros", "Desça como se fosse sentar", "Mantenha o calcanhar no chão"],
    isPremium: false
  },
  {
    id: 4,
    title: "Pausa Ativa no Trabalho",
    duration: 2,
    durationLabel: "2 min",
    intensity: "Baixa",
    muscleGroup: "Costas",
    description: "Ideal para quem passa muito tempo sentado. Alivia a tensão lombar e cervical.",
    icon: Zap,
    color: "bg-purple-50 text-purple-600",
    steps: ["Levante-se da cadeira", "Estique as pernas", "Gire os pulsos e tornozelos"],
    isPremium: false
  },
  {
    id: 5,
    title: "HIIT Express",
    duration: 7,
    durationLabel: "7 min",
    intensity: "Alta",
    muscleGroup: "Corpo Inteiro",
    description: "Treino de alta intensidade para queima calórica rápida e melhora cardiovascular.",
    icon: Zap,
    color: "bg-rose-50 text-rose-600",
    steps: ["Polichinelos por 30s", "Burpees por 30s", "Corrida estacionária por 30s"],
    isPremium: true
  },
  {
    id: 6,
    title: "Yoga para Foco",
    duration: 10,
    durationLabel: "10 min",
    intensity: "Média",
    muscleGroup: "Corpo Inteiro",
    description: "Posturas que exigem equilíbrio e concentração para acalmar a mente e focar no presente.",
    icon: Sparkles,
    color: "bg-indigo-50 text-indigo-600",
    steps: ["Postura da Árvore", "Postura do Guerreiro I", "Postura da Criança"],
    isPremium: true
  }
];

export default function Exercises() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterIntensity, setFilterIntensity] = React.useState<string | null>(null);
  const [filterMuscle, setFilterMuscle] = React.useState<string | null>(null);
  const [filterMaxDuration, setFilterMaxDuration] = React.useState<number>(20);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [userMood, setUserMood] = React.useState<number | null>(null);

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesIntensity = !filterIntensity || ex.intensity === filterIntensity;
    const matchesMuscle = !filterMuscle || ex.muscleGroup === filterMuscle;
    const matchesDuration = ex.duration <= filterMaxDuration;
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIntensity && matchesMuscle && matchesDuration && matchesSearch;
  });

  const intensities = Array.from(new Set(EXERCISES.map(ex => ex.intensity)));
  const muscles = Array.from(new Set(EXERCISES.map(ex => ex.muscleGroup)));

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/wellness-guide" 
            className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-display text-slate-900">Sugestões de <span className="text-sky-600">Movimento</span></h2>
            <p className="text-xs text-slate-500 font-medium">Exercícios simples para qualquer momento do dia.</p>
          </div>
        </div>
      </header>

      {/* Mood Selector */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-600">Como você está se sentindo agora?</label>
          {userMood && (
            <button 
              onClick={() => setUserMood(null)}
              className="text-[10px] font-bold text-slate-400 uppercase hover:text-sky-600 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setUserMood(m)}
              className={clsx(
                "flex-1 py-3 rounded-2xl text-xl transition-all border-2",
                userMood === m ? "bg-sky-50 border-sky-500 scale-105 shadow-sm" : "bg-slate-50 border-transparent hover:bg-slate-100"
              )}
            >
              {m === 1 ? "😫" : m === 2 ? "😕" : m === 3 ? "😐" : m === 4 ? "🙂" : "🤩"}
            </button>
          ))}
        </div>

        {userMood && userMood <= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-amber-50 rounded-3xl border border-amber-100 space-y-3"
          >
            <div className="flex items-center gap-3 text-amber-700">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <p className="font-bold text-xs">Sugerimos algo leve para hoje</p>
            </div>
            <p className="text-[11px] text-amber-900/70 leading-relaxed font-medium">
              Percebemos que seu humor está um pouco baixo. Que tal uma atividade que ajude a relaxar e renovar as energias?
            </p>
            <div className="flex gap-2">
              <Link 
                to="/breathing"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white rounded-xl text-[10px] font-black text-amber-700 uppercase tracking-tighter shadow-sm border border-amber-100"
              >
                <Wind className="w-3.5 h-3.5" /> Respiração Guiada
              </Link>
              <button 
                onClick={() => {
                  setFilterIntensity("Baixa");
                  setSearchQuery("Caminhada");
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white rounded-xl text-[10px] font-black text-amber-700 uppercase tracking-tighter shadow-sm border border-amber-100"
              >
                <Activity className="w-3.5 h-3.5" /> Caminhada Leve
              </button>
            </div>
          </motion.div>
        )}
      </section>

      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar exercícios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent rounded-3xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Intensity Filter */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Intensidade</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterIntensity(null)}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                  !filterIntensity ? "bg-sky-600 border-sky-600 text-white" : "bg-slate-50 border-transparent text-slate-400"
                )}
              >
                Todas
              </button>
              {intensities.map(int => (
                <button
                  key={int}
                  onClick={() => setFilterIntensity(int)}
                  className={clsx(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    filterIntensity === int ? "bg-sky-600 border-sky-600 text-white" : "bg-slate-50 border-transparent text-slate-400"
                  )}
                >
                  {int}
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Group Filter */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grupo Muscular</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterMuscle(null)}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                  !filterMuscle ? "bg-sky-600 border-sky-600 text-white" : "bg-slate-50 border-transparent text-slate-400"
                )}
              >
                Todos
              </button>
              {muscles.map(m => (
                <button
                  key={m}
                  onClick={() => setFilterMuscle(m)}
                  className={clsx(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    filterMuscle === m ? "bg-sky-600 border-sky-600 text-white" : "bg-slate-50 border-transparent text-slate-400"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duração Máxima: {filterMaxDuration} min</label>
            <input 
              type="range" 
              min="2" 
              max="20" 
              step="1"
              value={filterMaxDuration}
              onChange={(e) => setFilterMaxDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[2.5rem] border border-slate-100">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">Nenhum exercício encontrado com esses filtros.</p>
          </div>
        ) : (
          filteredExercises.map((ex, idx) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={clsx("p-3 rounded-2xl relative", ex.color)}>
                    <ex.icon className="w-6 h-6" />
                    {ex.isPremium && !user?.is_premium && (
                      <div className="absolute -top-1 -right-1 bg-slate-900 text-white p-1 rounded-full border-2 border-white">
                        <Lock className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900">{ex.title}</h3>
                      {ex.title === "Alongamento Matinal" && <Sun className="w-4 h-4 text-amber-500" />}
                      {ex.isPremium && (
                        <span className="px-1.5 py-0.5 bg-sky-500 text-white text-[8px] font-black uppercase rounded-md">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Timer className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{ex.durationLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{ex.intensity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{ex.muscleGroup}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {ex.description}
              </p>

              {ex.isPremium && !user?.is_premium ? (
                <div className="pt-2">
                  <button 
                    onClick={() => navigate("/subscription")}
                    className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2"
                  >
                    <Lock className="w-3 h-3" /> Desbloquear Treino
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passo a passo</p>
                  <ul className="space-y-1">
                    {ex.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <div className="w-1 h-1 bg-sky-500 rounded-full" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-sky-600 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-sky-600/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold">Por que se mover?</h4>
        </div>
        <p className="text-xs text-sky-100 leading-relaxed opacity-90">
          O movimento físico libera endorfinas, melhora a circulação e ajuda a regular o ciclo circadiano. Mesmo 5 minutos podem mudar seu estado mental.
        </p>
        <Link 
          to="/checkin"
          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-sky-600 text-xs font-black rounded-2xl"
        >
          Registrar Atividade <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
