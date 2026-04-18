import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wind, Play, Pause, RotateCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";

type Phase = "Inspirar" | "Segurar" | "Expirar" | "Pausa";

export default function Breathing() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("Inspirar");
  const [seconds, setSeconds] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 1) {
            // Switch phase
            if (phase === "Inspirar") {
              setPhase("Segurar");
              return 4;
            } else if (phase === "Segurar") {
              setPhase("Expirar");
              return 4;
            } else if (phase === "Expirar") {
              setPhase("Pausa");
              return 4;
            } else {
              setPhase("Inspirar");
              setCycles((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setPhase("Inspirar");
    setSeconds(4);
    setCycles(0);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 py-10">
      <header className="w-full flex items-center justify-between absolute top-10 px-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-display tracking-tight">Respiração Consciente</h2>
        <div className="w-11" />
      </header>

      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute w-72 h-72 border-2 border-sky-500/20 rounded-full" />
        
        {/* Animated Circle */}
        <motion.div
          animate={{
            scale: phase === "Inspirar" ? 1.5 : phase === "Expirar" ? 1 : phase === "Segurar" ? 1.5 : 1,
          }}
          transition={{ duration: 4, ease: "linear" }}
          className={clsx(
            "w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-2xl transition-colors duration-1000",
            phase === "Inspirar" ? "bg-sky-500 shadow-sky-500/40" : 
            phase === "Segurar" ? "bg-indigo-500 shadow-indigo-500/40" :
            phase === "Expirar" ? "bg-emerald-500 shadow-emerald-500/40" : "bg-slate-500 shadow-slate-500/40"
          )}
        >
          <Wind className="w-10 h-10 text-white mb-2 opacity-50" />
          <span className="text-white font-black text-4xl">{seconds}</span>
        </motion.div>

        {/* Phase Label */}
        <div className="absolute -bottom-20 text-center space-y-2">
          <motion.h3 
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest"
          >
            {phase}
          </motion.h3>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">
            Ciclos Completos: {cycles}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-20">
        <button 
          onClick={reset}
          className="p-5 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-600 transition-all"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button 
          onClick={toggle}
          className={clsx(
            "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95",
            isActive ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-sky-500 text-white"
          )}
        >
          {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>

        <div className="w-16" /> {/* Spacer */}
      </div>

      <div className="max-w-xs text-center">
        <p className="text-slate-400 text-xs font-medium leading-relaxed">
          A técnica 4-4-4-4 (Respiração Quadrada) ajuda a reduzir o estresse e aumentar o foco instantaneamente.
        </p>
      </div>
    </div>
  );
}
