import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Shield, HelpCircle, Info, ChevronRight, Moon, Globe, Crown, Star, Clock, CreditCard, ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";

export default function Settings() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem("notifications_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [notificationTime, setNotificationTime] = useState(() => {
    return localStorage.getItem("notification_time") || "09:00";
  });

  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleManageSubscription = async () => {
    if (!user?.stripe_customer_id) {
      alert("Ainda não há uma assinatura ativa para gerenciar.");
      return;
    }
    setLoadingPortal(true);
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: user.stripe_customer_id }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      alert("Erro ao abrir portal de assinatura.");
    } finally {
      setLoadingPortal(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("notifications_enabled", JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem("notification_time", notificationTime);
  }, [notificationTime]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, color = "text-slate-400", bg = "bg-slate-50" }: any) => (
    <button
      onClick={onClick}
      className="w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-98 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={clsx("p-2 rounded-xl", bg)}>
          <Icon className={clsx("w-5 h-5", color)} />
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-800">{label}</p>
          {value && <p className="text-xs text-slate-400 font-medium">{value}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300" />
    </button>
  );

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-slate-500">Gerencie sua conta e preferências.</p>
      </header>

      <div className="space-y-4">
        <div className={clsx(
          "p-6 rounded-3xl shadow-xl text-white flex items-center gap-4 relative overflow-hidden",
          user?.is_premium ? "bg-sky-600 shadow-sky-600/20" : "bg-slate-800 shadow-slate-800/20"
        )}>
          {user?.is_premium && <Crown className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />}
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black">
            {user?.full_name.charAt(0)}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{user?.full_name}</h3>
              {user?.is_premium && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 text-white text-[8px] font-black uppercase rounded-md border border-white/20">
                  <Crown className="w-2 h-2" />
                  Premium
                </div>
              )}
            </div>
            <p className={clsx("text-sm", user?.is_premium ? "text-sky-100" : "text-slate-400")}>{user?.email}</p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Assinatura</h3>
          <SettingItem 
            icon={Crown} 
            label="Plano Bioritmo+" 
            value={user?.is_premium ? "Premium Ativo" : "Versão Gratuita"} 
            color={user?.is_premium ? "text-sky-500" : "text-slate-400"}
            bg={user?.is_premium ? "bg-sky-50" : "bg-slate-50"}
            onClick={() => navigate("/subscription")}
          />
          {user?.is_premium && (
            <button 
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-slate-50">
                  <CreditCard className="w-5 h-5 text-slate-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-800">Gerenciar Pagamentos</p>
                  <p className="text-xs text-slate-400 font-medium">Abrir portal seguro do Stripe</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Notificações</h3>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-sky-50">
                  <Bell className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">Lembrete Diário</p>
                  <p className="text-xs text-slate-400 font-medium">Receba um aviso para fazer seu check-in</p>
                </div>
              </div>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={clsx(
                  "w-12 h-6 rounded-full transition-colors relative",
                  notificationsEnabled ? "bg-sky-500" : "bg-slate-200"
                )}
              >
                <div className={clsx(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  notificationsEnabled ? "right-1" : "left-1"
                )} />
              </button>
            </div>

            {notificationsEnabled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="pt-4 border-t border-slate-50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-amber-50">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Horário do Lembrete</p>
                      <p className="text-xs text-slate-400 font-medium">Defina o melhor momento para você</p>
                    </div>
                  </div>
                  <input 
                    type="time" 
                    value={notificationTime}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
                  />
                </div>
                
                <div className="bg-slate-50 p-3 rounded-2xl flex items-center gap-3">
                  <Info className="w-4 h-4 text-slate-400" />
                  <p className="text-[10px] text-slate-500 font-medium">
                    Você será notificado diariamente às <span className="font-bold text-slate-900">{notificationTime}</span> para manter sua sequência.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-4">Segurança</h3>
          <SettingItem icon={Shield} label="Privacidade" color="text-orange-500" bg="bg-orange-50" />
          <SettingItem icon={HelpCircle} label="Ajuda e Suporte" color="text-slate-500" bg="bg-slate-50" />
          <SettingItem icon={Info} label="Sobre o Bioritmo+" color="text-slate-500" bg="bg-slate-50" />
        </section>

        <button
          onClick={handleLogout}
          className="w-full py-5 bg-red-50 text-red-600 font-black text-lg rounded-3xl border border-red-100 hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <LogOut className="w-6 h-6" />
          Sair da Conta
        </button>

        <div className="text-center py-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Versão 1.0.0 • Bioritmo+ Premium</p>
        </div>
      </div>
    </div>
  );
}
