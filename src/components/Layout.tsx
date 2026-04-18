import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Activity, History, BarChart3, User, Settings, Sun, Moon, Sparkles, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../App";

export function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/wellness-guide", icon: Sparkles, label: "Guia" },
    { path: "/dashboard", icon: BarChart3, label: "Painel" },
    { path: "/checkin", icon: Activity, label: "Check-in" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <div className={clsx("min-h-screen pb-32 font-sans transition-colors duration-300", theme === 'dark' ? "bg-[#0F172A] text-slate-50" : "bg-[#F8FAFC] text-slate-900")}>
      <header className={clsx("sticky top-0 z-30 backdrop-blur-xl border-b px-6 py-5 transition-colors duration-300", theme === 'dark' ? "bg-slate-900/70 border-slate-800" : "bg-white/70 border-slate-200/50")}>
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 premium-gradient rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className={clsx("text-xl font-black text-display tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Bioritmo<span className="text-sky-600">+</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className={clsx("p-2.5 rounded-xl transition-all border", theme === 'dark' ? "bg-slate-800 border-slate-700 text-sky-400" : "bg-slate-50 border-slate-200/50 text-slate-500")}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link to="/settings" className={clsx("p-2.5 rounded-xl transition-all border", theme === 'dark' ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-200/50 text-slate-500")}>
              <Settings className="w-5 h-5" />
            </Link>
            <button 
              onClick={logout}
              className={clsx("p-2.5 rounded-xl transition-all border", theme === 'dark' ? "bg-slate-800 border-slate-700 text-rose-400" : "bg-slate-50 border-slate-200/50 text-rose-500")}
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-6 left-6 right-6 z-40">
        <div className={clsx("max-w-md mx-auto glass-card p-2 flex justify-between items-center shadow-2xl shadow-sky-900/10", theme === 'dark' ? "border-slate-800" : "border-slate-200/50")}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300",
                  isActive 
                    ? (theme === 'dark' ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 scale-110" : "bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-110")
                    : (theme === 'dark' ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
