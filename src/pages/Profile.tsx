import React, { useState } from "react";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { User } from "../types";
import { motion } from "motion/react";
import { User as UserIcon, Mail, Calendar, Ruler, Scale, Target, Activity, Heart, Save } from "lucide-react";
import { clsx } from "clsx";

export default function Profile() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<User>>({
    id: user?.id,
    sex: user?.sex || "Prefiro não dizer",
    age: user?.age || 25,
    height: user?.height || 170,
    weight: user?.weight || 70,
    goals: user?.goals || "",
    conditions: user?.conditions || "",
    activity_level: user?.activity_level || "Moderado",
    daily_steps_goal: user?.daily_steps_goal || 10000,
    daily_exercise_minutes_goal: user?.daily_exercise_minutes_goal || 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await api.updateProfile(formData);
      login({ ...user!, ...formData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, icon: Icon, children }: any) => (
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

  const InputField = ({ label, icon: Icon, value, onChange, type = "text", placeholder }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-medium text-slate-900"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-display text-slate-900 tracking-tight">Seu Perfil</h2>
        <p className="text-slate-500 font-medium">Personalize sua experiência para melhores resultados.</p>
      </header>

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-sky-50 text-sky-700 font-bold rounded-2xl border border-sky-100 text-center"
        >
          Perfil atualizado com sucesso!
        </motion.div>
      )}

      <Section title="Informações Básicas" icon={UserIcon}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sexo</label>
            <div className="grid grid-cols-3 gap-2">
              {["Masculino", "Feminino", "Outro"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData({ ...formData, sex: s })}
                  className={clsx(
                    "py-3 rounded-xl text-sm font-bold border-2 transition-all",
                    formData.sex === s ? "bg-sky-50 border-sky-500 text-sky-700" : "bg-slate-50 border-transparent text-slate-500"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <InputField label="Idade" icon={Calendar} type="number" value={formData.age} onChange={(v: string) => setFormData({ ...formData, age: parseInt(v) })} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Altura (cm)" icon={Ruler} type="number" value={formData.height} onChange={(v: string) => setFormData({ ...formData, height: parseFloat(v) })} />
            <InputField label="Peso (kg)" icon={Scale} type="number" value={formData.weight} onChange={(v: string) => setFormData({ ...formData, weight: parseFloat(v) })} />
          </div>
        </div>
      </Section>
      
      <Section title="Metas de Atividade Diária" icon={Target}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Passos Diários</label>
              <span className="text-sky-600 font-black">{formData.daily_steps_goal?.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="30000" 
              step="500"
              value={formData.daily_steps_goal}
              onChange={(e) => setFormData({ ...formData, daily_steps_goal: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>1k</span>
              <span>15k</span>
              <span>30k</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Minutos de Exercício</label>
              <span className="text-sky-600 font-black">{formData.daily_exercise_minutes_goal} min</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="180" 
              step="5"
              value={formData.daily_exercise_minutes_goal}
              onChange={(e) => setFormData({ ...formData, daily_exercise_minutes_goal: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>5m</span>
              <span>90m</span>
              <span>180m</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Objetivos e Saúde" icon={Heart}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nível de Atividade</label>
            <div className="grid grid-cols-2 gap-2">
              {["Sedentário", "Leve", "Moderado", "Intenso"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setFormData({ ...formData, activity_level: a })}
                  className={clsx(
                    "py-3 rounded-xl text-sm font-bold border-2 transition-all",
                    formData.activity_level === a ? "bg-sky-50 border-sky-500 text-sky-700" : "bg-slate-50 border-transparent text-slate-500"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Metas de Saúde</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 min-h-[100px]"
              placeholder="Ex: Perder peso, melhorar sono..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Condições Médicas</label>
            <textarea
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-500 min-h-[100px]"
              placeholder="Ex: Hipertensão, Diabetes..."
            />
          </div>
        </div>
      </Section>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-slate-900 text-white font-black text-sm rounded-[2rem] shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {loading ? "Salvando..." : "Salvar Alterações"}
      </button>
    </form>
  );
}
