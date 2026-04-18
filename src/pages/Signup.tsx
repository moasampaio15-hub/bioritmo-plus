import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../App";
import { useToast } from "../context/ToastContext";
import { Activity } from "lucide-react";
import { motion } from "motion/react";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await api.signup({ full_name: fullName, email, password });
      login(user);
      showToast("Conta criada com sucesso! Bem-vindo.", "success");
      navigate("/profile"); // Go to profile to complete setup
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar. Email já pode estar em uso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-10"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 premium-gradient rounded-[2rem] shadow-xl shadow-sky-500/20 mb-2">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-display text-slate-900 tracking-tight">Bioritmo<span className="text-sky-600">+</span></h1>
            <p className="text-slate-500 font-medium">Sua jornada para o bem-estar começa aqui.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none text-slate-900 font-medium"
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none text-slate-900 font-medium"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none text-slate-900 font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Criando conta..." : "Começar Agora"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 font-medium">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-sky-600 font-black hover:underline">
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
