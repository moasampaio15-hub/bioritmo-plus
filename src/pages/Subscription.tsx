import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { motion } from "motion/react";
import { Check, Crown, Zap, ShieldCheck, Sparkles, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";

export default function Subscription() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const handleUpgrade = async () => {
    if (!user) {
      console.error("Usuário não encontrado");
      return;
    }
    setLoading(true);
    console.log("Iniciando checkout para plano:", selectedPlan);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id,
          planType: selectedPlan
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na requisição");
      }

      const { url } = await response.json();
      if (!url) throw new Error("URL de checkout não recebida");
      
      console.log("Redirecionando para:", url);
      window.location.href = url;
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      alert("Erro ao processar assinatura: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ type, price, period, features, recommended, savings }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={() => setSelectedPlan(type)}
      className={clsx(
        "relative p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer overflow-hidden flex flex-col h-full",
        selectedPlan === type 
          ? "border-sky-500 bg-white shadow-2xl shadow-sky-900/10 ring-4 ring-sky-500/5" 
          : "border-slate-100 bg-white/50 hover:border-slate-200"
      )}
    >
      {recommended && (
        <div className="absolute top-0 right-0 bg-sky-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
          Mais Popular
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-900 capitalize text-lg">{type === 'monthly' ? 'Mensal' : 'Anual'}</h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-slate-900">R$ {price}</span>
            <span className="text-xs text-slate-400 font-medium">/{period}</span>
          </div>
          {savings && (
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">{savings}</p>
          )}
        </div>
        <div className={clsx(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
          selectedPlan === type ? "border-sky-500 bg-sky-500" : "border-slate-200"
        )}>
          {selectedPlan === type && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
      <ul className="space-y-3 mt-auto">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
            <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-display text-slate-900 tracking-tight">Bioritmo<span className="text-sky-600">+</span> Premium</h2>
          <p className="text-slate-500 text-sm font-medium">Escolha o plano ideal para você.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PlanCard 
          type="monthly" 
          price="29,90" 
          period="mês" 
          features={["Insights de IA ilimitados", "Relatórios semanais", "Suporte prioritário", "Alertas de Burnout"]} 
        />
        <PlanCard 
          type="yearly" 
          price="19,90" 
          period="mês" 
          recommended 
          savings="Economize 33%"
          features={["Tudo do plano Mensal", "Acesso antecipado a funções", "Selo exclusivo no perfil", "Melhor custo-benefício"]} 
        />
      </div>

      <div className="space-y-6">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-6 bg-slate-900 text-white font-black text-sm rounded-[2.5rem] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processando...</span>
            </>
          ) : (
            `Assinar Plano ${selectedPlan === 'monthly' ? 'Mensal' : 'Anual'} — R$ ${selectedPlan === 'monthly' ? '29,90' : '238,80'}`
          )}
        </button>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            Cancele a qualquer momento • Pagamento Seguro
          </p>
          <div className="flex gap-4 opacity-30 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
