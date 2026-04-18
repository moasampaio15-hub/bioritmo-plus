import { createContext, useContext, useState, useEffect, ReactNode, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { User } from "./types";
import { api } from "./lib/api";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { Layout } from "./components/Layout";
import { HelmetProvider, Helmet } from "react-helmet-async";

// Lazy loading para melhor performance
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Home = lazy(() => import("./pages/Home"));
const CheckInPage = lazy(() => import("./pages/CheckIn"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
const Report = lazy(() => import("./pages/Report"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Breathing = lazy(() => import("./pages/Breathing"));
const Achievements = lazy(() => import("./pages/Achievements"));
const WellnessGuide = lazy(() => import("./pages/WellnessGuide"));
const Exercises = lazy(() => import("./pages/Exercises"));

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

// Componente de loading
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("bioritmo_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

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
    <HelmetProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthContext.Provider value={{ user, loading, login, logout }}>
            <BrowserRouter>
              <SEO />
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </BrowserRouter>
          </AuthContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    </HelmetProvider>
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

// SEO Component
function SEO() {
  const location = useLocation();
  
  const getMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'BIORITMO+ | Dashboard de Saúde',
          description: 'Monitore sua saúde, hábitos e bem-estar com inteligência.'
        };
      case '/checkin':
        return {
          title: 'Check-in Diário | BIORITMO+',
          description: 'Registre seu humor, energia e sono diariamente.'
        };
      case '/dashboard':
        return {
          title: 'Dashboard | BIORITMO+',
          description: 'Visualize sua evolução e correlações de saúde.'
        };
      default:
        return {
          title: 'BIORITMO+ | Saúde Inteligente',
          description: 'Transforme seus hábitos em saúde com BIORITMO+.'
        };
    }
  };
  
  const meta = getMeta();
  
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
