import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { User } from "./types";
import { api } from "./lib/api.demo";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { PWAInstallBanner, OfflineIndicator, NotificationPrompt } from "./components/PWAInstall";
import { Onboarding } from "./components/Onboarding";

// Pages
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
import MedicalDashboard from "./pages/MedicalDashboard";
import { Layout } from "./components/Layout";

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

// Versão DEMO do App
export default function AppDemo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Verificar se usuário já está logado
    const savedUser = localStorage.getItem('bioritmo_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Verificar se é primeira visita
    const hasSeenOnboarding = localStorage.getItem('bioritmo_onboarding_complete');
    if (!hasSeenOnboarding && !savedUser) {
      setShowOnboarding(true);
    }
    
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('bioritmo_current_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('bioritmo_current_user');
    setUser(null);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('bioritmo_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // Mostrar onboarding se necessário
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthContext.Provider value={{ user, loading, login, logout }}>
          <BrowserRouter>
            <OfflineIndicator />
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
                  <Route path="/medical" element={<MedicalDashboard />} />
                </Route>
              </Route>
            </Routes>
            <PWAInstallBanner />
            <NotificationPrompt />
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
