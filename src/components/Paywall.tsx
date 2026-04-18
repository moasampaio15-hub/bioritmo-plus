import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, Crown, ArrowRight } from "lucide-react";

interface PaywallProps {
  title: string;
  description: string;
}

export default function Paywall({ title, description }: PaywallProps) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 text-white text-center space-y-6 shadow-2xl shadow-slate-900/40"
    >
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20">
          <Lock className="w-8 h-8 text-sky-400" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30">
            <Crown className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Conteúdo Premium</span>
          </div>
          <h3 className="text-2xl font-black text-display leading-tight">{title}</h3>
          <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
            {description}
          </p>
        </div>

        <button 
          onClick={() => navigate("/subscription")}
          className="w-full py-5 bg-white text-slate-900 font-black text-sm rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          Desbloquear Agora
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          A partir de R$ 19,90/mês
        </p>
      </div>
    </motion.div>
  );
}
