import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import { calculateHealthScore, calculateBurnoutScore, getHealthStatusLabel } from "../lib/healthLogic";
import { CheckIn } from "../types";
import { motion } from "motion/react";
import { 
  Moon, Sun, Smile, Zap, AlertCircle, Droplets, 
  Dumbbell, Footprints, Wine, Cigarette, Brain, 
  Users, Scale, Activity, Thermometer, FileText, Target, Heart,
  ChevronRight, ChevronLeft, Check, Wind
} from "lucide-react";
import { clsx } from "clsx";

const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <section className="glass-card p-8 space-y-6">
    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
      <div className="p-2.5 bg-sky-50 rounded-xl">
        <Icon className="w-5 h-5 text-sky-600" />
      </div>
      <h3 className="font-bold text-display text-slate-900">{title}</h3>
    </div>
    <div className="space-y-6">{children}</div>
  </section>
);

const SliderField = ({ label, value, min, max, onChange, unit = "", getLabel }: any) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div className="space-y-0.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{label}</label>
        {getLabel && <p className="text-[10px] font-bold text-sky-500 uppercase tracking-tight">{getLabel(value)}</p>}
      </div>
      <span className="text-sky-600 font-black text-xl text-display">{value}{unit}</span>
    </div>
    <div className="relative h-2 bg-slate-100 rounded-full">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <motion.div 
        initial={false}
        animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
        className="h-full premium-gradient rounded-full"
      />
    </div>
  </div>
);

const SwitchField = ({ label, icon: Icon, value, onChange }: any) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={clsx(
      "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300",
      value ? "bg-sky-50 border-sky-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
    )}
  >
    <div className="flex items-center gap-4">
      <div className={clsx(
        "p-2 rounded-lg transition-colors",
        value ? "bg-sky-500 text-white" : "bg-slate-50 text-slate-400"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={clsx(
        "text-sm font-bold transition-colors",
        value ? "text-sky-900" : "text-slate-500"
      )}>{label}</span>
    </div>
    <div className={clsx(
      "w-10 h-5 rounded-full transition-colors relative",
      value ? "bg-sky-500" : "bg-slate-200"
    )}>
      <motion.div 
        animate={{ x: value ? 20 : 2 }}
        className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
      />
    </div>
  </button>
);

export default function CheckInPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [formData, setFormData] = useState<Partial<CheckIn>>({
    sleep_hours: 7,
    sleep_quality: 7,
    mood: 3,
    energy: 7,
    pain: 0,
    stress_level: 7,
    water: 8,
    steps_count: 0,
    exercise_today: false,
    steps_goal_reached: false,
    alcohol_today: false,
    smoking_today: false,
    meditation_today: false,
    social_connection_today: false,
    weight: 70,
    blood_pressure: "120/80",
    glucose: 90,
    notes: "",
    tomorrow_goals: "",
    gratitude: "",
  });

  const liveScore = calculateHealthScore(formData);

  useEffect(() => {
    if (user) {
      api.getTodayCheckIn(user.id).then(checkin => {
        if (checkin) setAlreadyDone(true);
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const recent = await api.getCheckIns(user.id);
      const health_score = calculateHealthScore(formData);
      const burnout_score = calculateBurnoutScore([formData as CheckIn, ...recent]);

      const payload: CheckIn = {
        ...(formData as CheckIn),
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        health_score,
        burnout_score,
      };

      await api.saveCheckIn(payload);
      showToast("Check-in realizado com sucesso!", "success");
      navigate("/");
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar check-in.", "error");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Humor e Energia",
      icon: Smile,
      content: (
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-600">Como está seu humor?</label>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: m })}
                  className={clsx(
                    "flex-1 py-4 rounded-2xl text-2xl transition-all border-2",
                    formData.mood === m ? "bg-sky-50 border-sky-500 scale-105" : "bg-slate-50 border-transparent"
                  )}
                >
                  {m === 1 ? "😫" : m === 2 ? "😕" : m === 3 ? "😐" : m === 4 ? "🙂" : "🤩"}
                </button>
              ))}
            </div>
          </div>

          {formData.mood && formData.mood <= 2 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-6 bg-sky-50 rounded-[2rem] border border-sky-100 space-y-4"
            >
              <div className="flex items-center gap-3 text-sky-700">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Heart className="w-5 h-5 fill-sky-500 text-sky-500" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight">Cuidado Especial</p>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Sugestão de Bem-estar</p>
                </div>
              </div>
              
              <p className="text-xs text-sky-900 leading-relaxed font-medium">
                Sentimos que seu humor está um pouco baixo hoje. Atividades leves podem ajudar a clarear a mente e liberar endorfinas. Que tal tentar uma destas?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate("/breathing")}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <Wind className="w-6 h-6 text-sky-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-sky-900 uppercase tracking-tighter">Respiração</span>
                </button>
                <button 
                  onClick={() => navigate("/exercises")}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <Footprints className="w-6 h-6 text-sky-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-sky-900 uppercase tracking-tighter">Caminhada</span>
                </button>
              </div>
            </motion.div>
          )}

          <SliderField 
            label="Nível de Energia" 
            value={formData.energy} 
            min={0} max={10} 
            getLabel={(v: number) => v <= 3 ? "Baixa" : v <= 6 ? "Média" : v <= 9 ? "Alta" : "Máxima"}
            onChange={(v: number) => setFormData({ ...formData, energy: v })} 
          />
          <SliderField 
            label="Nível de Tranquilidade" 
            value={formData.stress_level} 
            min={0} max={10} 
            getLabel={(v: number) => v <= 2 ? "Extremo Estresse" : v <= 5 ? "Tenso" : v <= 8 ? "Calmo" : "Pleno"}
            onChange={(v: number) => setFormData({ ...formData, stress_level: v })} 
          />
        </div>
      )
    },
    {
      title: "Sono e Corpo",
      icon: Moon,
      content: (
        <div className="space-y-8">
          <SliderField 
            label="Horas de Sono" 
            value={formData.sleep_hours} 
            min={0} max={12} 
            unit="h"
            onChange={(v: number) => setFormData({ ...formData, sleep_hours: v })} 
          />
          <SliderField 
            label="Qualidade do Sono" 
            value={formData.sleep_quality} 
            min={0} max={10} 
            getLabel={(v: number) => v <= 3 ? "Ruim" : v <= 6 ? "Regular" : v <= 9 ? "Bom" : "Excelente"}
            onChange={(v: number) => setFormData({ ...formData, sleep_quality: v })} 
          />
          <SliderField 
            label="Nível de Dor" 
            value={formData.pain} 
            min={0} max={10} 
            getLabel={(v: number) => v === 0 ? "Sem Dor" : v <= 3 ? "Leve" : v <= 6 ? "Moderada" : v <= 9 ? "Intensa" : "Insuportável"}
            onChange={(v: number) => setFormData({ ...formData, pain: v })} 
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Peso (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Glicose (mg/dL)</label>
              <input
                type="number"
                value={formData.glucose}
                onChange={(e) => setFormData({ ...formData, glucose: parseFloat(e.target.value) })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Hábitos e Nutrição",
      icon: Droplets,
      content: (
        <div className="space-y-8">
          <SliderField 
            label="Hidratação (Copos de 250ml)" 
            value={formData.water} 
            min={0} max={12} 
            onChange={(v: number) => setFormData({ ...formData, water: v })} 
          />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passos Dados Hoje</label>
              <span className="text-sky-600 font-black text-xl text-display">{formData.steps_count?.toLocaleString()}</span>
            </div>
            <input
              type="number"
              value={formData.steps_count}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setFormData({ 
                  ...formData, 
                  steps_count: val,
                  steps_goal_reached: val >= (user?.daily_steps_goal || 10000)
                });
              }}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 font-bold text-lg"
              placeholder="Ex: 8500"
            />
            {formData.steps_count && user?.daily_steps_goal && (
              <p className={clsx(
                "text-[10px] font-bold uppercase tracking-widest",
                formData.steps_count >= user.daily_steps_goal ? "text-emerald-500" : "text-amber-500"
              )}>
                {formData.steps_count >= user.daily_steps_goal 
                  ? "🎉 Meta Atingida!" 
                  : `${user.daily_steps_goal - formData.steps_count} passos para a meta`}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <SwitchField label="Exercício Hoje" icon={Dumbbell} value={formData.exercise_today} onChange={(v: boolean) => setFormData({ ...formData, exercise_today: v })} />
            <SwitchField label="Meditação / Mindfulness" icon={Brain} value={formData.meditation_today} onChange={(v: boolean) => setFormData({ ...formData, meditation_today: v })} />
            <SwitchField label="Conexão Social" icon={Users} value={formData.social_connection_today} onChange={(v: boolean) => setFormData({ ...formData, social_connection_today: v })} />
            <SwitchField label="Consumiu Álcool" icon={Wine} value={formData.alcohol_today} onChange={(v: boolean) => setFormData({ ...formData, alcohol_today: v })} />
            <SwitchField label="Fumou Hoje" icon={Cigarette} value={formData.smoking_today} onChange={(v: boolean) => setFormData({ ...formData, smoking_today: v })} />
          </div>
        </div>
      )
    },
    {
      title: "Reflexão",
      icon: FileText,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Diário de Gratidão ❤️</label>
            <textarea
              value={formData.gratitude}
              onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-sky-500 min-h-[80px]"
              placeholder="Pelo que você é grato hoje?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Notas do Dia</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-sky-500 min-h-[100px]"
              placeholder="Como foi seu dia?"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Metas para Amanhã</label>
            <textarea
              value={formData.tomorrow_goals}
              onChange={(e) => setFormData({ ...formData, tomorrow_goals: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 min-h-[100px]"
              placeholder="O que você quer focar amanhã?"
            />
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  if (alreadyDone) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-4 bg-sky-50 rounded-full">
          <Activity className="w-12 h-12 text-sky-600" />
        </div>
        <h2 className="text-xl font-bold">Check-in Concluído</h2>
        <p className="text-slate-500">Você já registrou seu check-in de hoje. Volte amanhã!</p>
        <button 
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-sky-600 text-white font-bold rounded-xl"
        >
          Voltar para Início
        </button>
      </div>
    );
  }

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="space-y-8 pb-12 relative">
      <header className="sticky top-[72px] z-20 bg-[#F8FAFC]/80 backdrop-blur-md py-4 -mx-6 px-6 border-b border-slate-200/50 flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-display text-slate-900 tracking-tight">Check-in</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Passo {currentStep + 1} de {steps.length}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Score Vitalidade</span>
            <span className="text-xs font-black text-sky-600 uppercase">{getHealthStatusLabel(liveScore)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-sky-500/20">
            <span className="text-white font-black text-lg">{liveScore}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {steps.map((_, idx) => (
          <div 
            key={idx}
            className={clsx(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              idx <= currentStep ? "bg-sky-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="glass-card p-8 space-y-8"
      >
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="p-3 bg-sky-50 rounded-2xl text-sky-600">
            <StepIcon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-display text-slate-900">{steps[currentStep].title}</h3>
        </div>

        {steps[currentStep].content}
      </motion.div>

      <div className="flex gap-4">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 font-black text-sm rounded-[2rem] shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>
        )}
        <button
          type="button"
          onClick={nextStep}
          disabled={loading}
          className="flex-[2] py-5 bg-slate-900 text-white font-black text-sm rounded-[2rem] shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <Check className="w-5 h-5" />
              {loading ? "Salvando..." : "Finalizar Check-in"}
            </>
          ) : (
            <>
              Próximo
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
