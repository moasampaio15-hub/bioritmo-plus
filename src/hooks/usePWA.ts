import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  deferredPrompt: any;
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    deferredPrompt: null
  });

  useEffect(() => {
    // Verificar se está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    setStatus(prev => ({ ...prev, isInstalled }));

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setStatus(prev => ({ 
        ...prev, 
        isInstallable: true,
        deferredPrompt: e 
      }));
    };

    // Verificar status online/offline
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const install = async () => {
    if (status.deferredPrompt) {
      status.deferredPrompt.prompt();
      const { outcome } = await status.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setStatus(prev => ({ 
          ...prev, 
          isInstallable: false,
          isInstalled: true,
          deferredPrompt: null 
        }));
      }
    }
  };

  return { ...status, install };
}

// Hook para notificações
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const scheduleNotification = (title: string, options: NotificationOptions, delay: number) => {
    if (permission !== 'granted') return;

    setTimeout(() => {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    }, delay);
  };

  return { permission, isSupported, requestPermission, scheduleNotification };
}
