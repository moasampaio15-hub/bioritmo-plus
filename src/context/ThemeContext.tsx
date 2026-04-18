import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeColor = 'sky' | 'emerald' | 'violet' | 'rose' | 'amber';
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  color: ThemeColor;
  mode: ThemeMode;
  setColor: (color: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorThemes: Record<ThemeColor, { primary: string; secondary: string; accent: string }> = {
  sky: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#DBEAFE'
  },
  emerald: {
    primary: '#10B981',
    secondary: '#34D399',
    accent: '#D1FAE5'
  },
  violet: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#EDE9FE'
  },
  rose: {
    primary: '#F43F5E',
    secondary: '#FB7185',
    accent: '#FFE4E6'
  },
  amber: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    accent: '#FEF3C7'
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [color, setColorState] = useState<ThemeColor>('sky');
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedColor = localStorage.getItem('bioritmo-theme-color') as ThemeColor;
    const savedMode = localStorage.getItem('bioritmo-theme-mode') as ThemeMode;
    
    if (savedColor && colorThemes[savedColor]) {
      setColorState(savedColor);
    }
    if (savedMode) {
      setModeState(savedMode);
    }
  }, []);

  // Aplicar tema de cor
  useEffect(() => {
    const theme = colorThemes[color];
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    
    localStorage.setItem('bioritmo-theme-color', color);
  }, [color]);

  // Gerenciar modo escuro/claro
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (mode === 'system') {
        setIsDark(mediaQuery.matches);
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };

    if (mode === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else if (mode === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      handleChange();
    }

    mediaQuery.addEventListener('change', handleChange);
    localStorage.setItem('bioritmo-theme-mode', mode);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setColor = (newColor: ThemeColor) => {
    setColorState(newColor);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ color, mode, setColor, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Componente de seletor de tema
export function ThemeSelector() {
  const { color, mode, setColor, setMode } = useTheme();

  const colors: { id: ThemeColor; name: string; gradient: string }[] = [
    { id: 'sky', name: 'Azul', gradient: 'from-sky-400 to-blue-600' },
    { id: 'emerald', name: 'Verde', gradient: 'from-emerald-400 to-green-600' },
    { id: 'violet', name: 'Roxo', gradient: 'from-violet-400 to-purple-600' },
    { id: 'rose', name: 'Rosa', gradient: 'from-rose-400 to-pink-600' },
    { id: 'amber', name: 'Laranja', gradient: 'from-amber-400 to-orange-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Seletor de cor */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">Cor do Tema</h3>
        <div className="grid grid-cols-5 gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              className={`relative aspect-square rounded-2xl bg-gradient-to-br ${c.gradient} transition-all ${
                color === c.id ? 'ring-4 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
              }`}
            >
              {color === c.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de modo */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">Modo</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                mode === m
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'light' && '☀️ Claro'}
              {m === 'dark' && '🌙 Escuro'}
              {m === 'system' && '💻 Automático'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
