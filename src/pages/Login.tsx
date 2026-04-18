import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { Activity } from "lucide-react";
import { motion } from "motion/react";

// USUÁRIO DEMO HARDCODED - Funciona sempre!
const DEMO_USER = {
  id: 1,
  full_name: 'Dr. Moacir Sampaio',
  email: 'demo@sampaio.com',
  password: 'demo123',
  is_premium: true
};

export default function Login() {
  const [email, setEmail] = useState("demo@sampaio.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Delay para parecer real
    await new Promise(r => setTimeout(r, 500));
    
    // Verificar se é o usuário demo
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      const { password: _, ...userWithoutPassword } = DEMO_USER;
      login(userWithoutPassword);
      navigate("/");
    } else {
      setError('Email ou senha incorretos. Use: demo@sampaio.com / demo123');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-gradient-to-br from-sky-500 to-blue-600 rounded-[2rem] shadow-xl shadow-sky-500/20 mb-2">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Bioritmo<span className="text-sky-600">+</span></h1>
            <p className="text-slate-500 font-medium">by Sampaio Diagnóstico</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button className="flex-1 py-3 bg-white rounded-xl font-bold text-slate-900 shadow-sm">
            Entrar
          </button>
          <Link to="/signup" className="flex-1 py-3 rounded-xl font-bold text-slate-500 text-center">
            Criar conta
          </Link>
        </div>

        {/* Demo info */}
        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200">
          <p className="text-sm text-sky-800 font-bold mb-2">🎮 Modo Demo</p>
          <p className="text-sm text-sky-700">
            <strong>Email:</strong> demo@sampaio.com<br/>
            <strong>Senha:</strong> demo123
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none text-slate-900 font-medium"
              placeholder="Email"
            />
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none text-slate-900 font-medium"
              placeholder="Senha"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-sky-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-sky-500/25 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
