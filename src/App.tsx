import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { User } from "./types";
import { api } from "./lib/api";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { Layout } from "./components/Layout";

// Importações diretas (sem lazy loading para evitar travamento)
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CheckInPage from "./pages/CheckIn";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Report from "./pages/Report";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";
import Breathing from "./pages/Breathing";
import Achievements from "./pages/Achievements";
import WellnessGuide from "./pages/WellnessGuide";
import Exercises from "./pages/Exercises";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// Componente de loading simples
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("bioritmo_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular verificação de autenticação
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("bioritmo_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bioritmo_user");
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthContext.Provider value={{ user, loading, login, logout }}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
              
              <Route element={<ProtectedRoute user={user} />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/checkin" element={<CheckInPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/breathing" element={<Breathing />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/wellness-guide" element={<WellnessGuide />} />
                  <Route path="/exercises" element={<Exercises />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </ThemeProvider>
  );
}

function ProtectedRoute({ user }: { user: User | null }) {
  if (!user) return <Navigate to="/login" />;
  return <OutletWrapper />;
}

import { Outlet } from "react-router-dom";
function OutletWrapper() {
  return <Outlet />;
}
