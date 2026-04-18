import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Info, Sparkles } from 'lucide-react';

// Toast premium
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function PremiumToast({ message, type, onClose }: ToastProps) {
  const icons = {
    success: Check,
    error: X,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'from-emerald-400 to-green-500',
    error: 'from-rose-400 to-red-500',
    warning: 'from-amber-400 to-orange-500',
    info: 'from-sky-400 to-blue-500'
  };

  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-2xl border border-slate-100">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[type]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="font-bold text-slate-800">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </motion.div>
  );
}

// Loader premium
export function PremiumLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div className={`relative ${sizes[size]}`}>
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-slate-100"
      />
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Botão com loading
interface LoadingButtonProps {
  children: React.ReactNode;
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function LoadingButton({ children, loading, onClick, disabled }: LoadingButtonProps) {
  return (
    <motion.button
      whileHover={!loading && !disabled ? { scale: 1.02 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={loading || disabled}
      className="relative px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Processando...</span>
          </motion.div>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// Skeleton loading premium
export function PremiumSkeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="bg-slate-200 rounded-lg h-full w-full" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Confetti celebration
export function Celebration({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
      const newParticles = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5
      }));
      setParticles(newParticles);

      setTimeout(() => setParticles([]), 3000);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: `${particle.x + (Math.random() - 0.5) * 50}vw`,
            y: `${particle.y + 100}vh`,
            scale: particle.scale,
            rotate: particle.rotation
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: 'easeOut'
          }}
          className="absolute w-3 h-3"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}

// Success check animation
export function SuccessCheck({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress bar premium
export function PremiumProgress({ progress, color = 'sky' }: { progress: number; color?: string }) {
  return (
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r from-${color}-400 to-${color}-600`}
      />
    </div>
  );
}

// Badge animado
export function AnimatedBadge({ children, color = 'sky' }: { children: React.ReactNode; color?: string }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700`}
    >
      <Sparkles className="w-3 h-3 mr-1" />
      {children}
    </motion.span>
  );
}
