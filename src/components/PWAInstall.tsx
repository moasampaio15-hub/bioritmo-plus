import { usePWA, useNotifications } from '../hooks/usePWA';
import { Download, Bell, WifiOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isOffline, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center">
          <Download className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-sm">Instale o BIORITMO+</p>
          <p className="text-xs text-slate-400">Acesse direto da tela inicial</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={install}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-xl text-sm font-bold transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function OfflineIndicator() {
  const { isOffline } = usePWA();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShow(true);
    } else {
      setTimeout(() => setShow(false), 3000);
    }
  }, [isOffline]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 transition-all ${
      isOffline ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
    }`}>
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-bold">Você está offline</span>
        </>
      ) : (
        <>
          <span className="text-sm font-bold">✓ Conexão restaurada</span>
        </>
      )}
    </div>
  );
}

export function NotificationPrompt() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-sky-50 border border-sky-200 p-4 rounded-2xl shadow-lg z-40 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-slate-900">Ative as notificações</p>
          <p className="text-xs text-slate-600">Receba lembretes de check-in</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold transition-colors"
        >
          Ativar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-2 hover:bg-sky-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>
    </div>
  );
}
