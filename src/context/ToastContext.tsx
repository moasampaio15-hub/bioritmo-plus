import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md
                ${toast.type === "success" ? "bg-emerald-50/90 border-emerald-200 text-emerald-900" : 
                  toast.type === "error" ? "bg-red-50/90 border-red-200 text-red-900" : 
                  "bg-white/90 border-slate-200 text-slate-900"}
              `}>
                {toast.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : 
                 toast.type === "error" ? <AlertCircle className="w-5 h-5 text-red-500" /> : 
                 <CheckCircle className="w-5 h-5 text-sky-500" />}
                
                <p className="text-sm font-bold pr-4">{toast.message}</p>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
