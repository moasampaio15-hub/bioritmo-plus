import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'checkin' | 'sleep' | 'water' | 'exercise' | 'mood';
  scheduledTime: Date;
  sent: boolean;
}

export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Verificar permissão ao iniciar
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Solicitar permissão
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notificações não suportadas');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // Agendar notificação inteligente baseada nos hábitos do usuário
  const scheduleSmartNotification = useCallback((type: Notification['type'], userData?: any) => {
    const now = new Date();
    let scheduledTime = new Date();
    let title = '';
    let body = '';

    switch (type) {
      case 'checkin':
        // Horário ideal: 21h (fim do dia)
        scheduledTime.setHours(21, 0, 0, 0);
        title = '📝 Hora do Check-in!';
        body = 'Como foi seu dia? Registre seu humor, sono e energia.';
        break;

      case 'sleep':
        // Horário ideal: 22h (preparação para sono)
        scheduledTime.setHours(22, 0, 0, 0);
        title = '🌙 Preparando para dormir?';
        body = 'Evite telas, faça respiração profunda. Boa noite de sono!';
        break;

      case 'water':
        // Horários ao longo do dia
        const waterHours = [9, 12, 15, 18];
        const nextHour = waterHours.find(h => h > now.getHours()) || 9;
        scheduledTime.setHours(nextHour, 0, 0, 0);
        if (nextHour <= now.getHours()) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        title = '💧 Hora de se hidratar!';
        body = 'Beba um copo de água. Seu corpo agradece!';
        break;

      case 'exercise':
        // Horário ideal: baseado no nível de energia do usuário
        const bestHour = userData?.bestExerciseHour || 17;
        scheduledTime.setHours(bestHour, 0, 0, 0);
        if (bestHour <= now.getHours()) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        title = '🏃‍♂️ Momento de se mover!';
        body = 'Seu nível de energia está ótimo para exercícios. Vamos lá!';
        break;

      case 'mood':
        // Check-in de humor à tarde
        scheduledTime.setHours(15, 0, 0, 0);
        title = '😊 Como você está se sentindo?';
        body = 'Faça uma pausa e avalie seu humor. Cuide da sua mente!';
        break;
    }

    const newNotification: Notification = {
      id: `${type}-${Date.now()}`,
      title,
      body,
      type,
      scheduledTime,
      sent: false
    };

    setNotifications(prev => [...prev, newNotification]);
    return newNotification;
  }, []);

  // Verificar e enviar notificações agendadas
  useEffect(() => {
    if (permission !== 'granted') return;

    const interval = setInterval(() => {
      const now = new Date();

      notifications.forEach(notification => {
        if (!notification.sent && notification.scheduledTime <= now) {
          // Enviar notificação
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(notification.title, {
                body: notification.body,
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png',
                tag: notification.id,
                requireInteraction: true,
                data: {
                  url: notification.type === 'checkin' ? '/checkin' : '/'
                }
              });
            });
          } else {
            new Notification(notification.title, {
              body: notification.body,
              icon: '/icon-192x192.png'
            });
          }

          // Marcar como enviada
          setNotifications(prev =>
            prev.map(n =>
              n.id === notification.id ? { ...n, sent: true } : n
            )
          );

          // Reagendar para o próximo dia (se for recorrente)
          if (['checkin', 'sleep', 'water', 'exercise'].includes(notification.type)) {
            const nextTime = new Date(notification.scheduledTime);
            nextTime.setDate(nextTime.getDate() + 1);

            setNotifications(prev => [
              ...prev,
              {
                ...notification,
                id: `${notification.type}-${Date.now()}`,
                scheduledTime: nextTime,
                sent: false
              }
            ]);
          }
        }
      });
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [notifications, permission]);

  // Cancelar notificação
  const cancelNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Configurar todas as notificações padrão
  const setupDefaultNotifications = useCallback((userData?: any) => {
    scheduleSmartNotification('checkin', userData);
    scheduleSmartNotification('sleep', userData);
    scheduleSmartNotification('water', userData);
    scheduleSmartNotification('exercise', userData);
    scheduleSmartNotification('mood', userData);
  }, [scheduleSmartNotification]);

  return {
    permission,
    requestPermission,
    notifications,
    scheduleSmartNotification,
    cancelNotification,
    setupDefaultNotifications
  };
}

// Hook para lembretes contextuais
export function useContextualReminders() {
  const [reminders, setReminders] = useState<Array<{
    id: string;
    condition: () => boolean;
    message: string;
    shown: boolean;
  }>>([]);

  // Adicionar lembrete contextual
  const addReminder = useCallback((
    condition: () => boolean,
    message: string
  ) => {
    setReminders(prev => [
      ...prev,
      {
        id: `reminder-${Date.now()}`,
        condition,
        message,
        shown: false
      }
    ]);
  }, []);

  // Verificar lembretes
  useEffect(() => {
    const interval = setInterval(() => {
      reminders.forEach(reminder => {
        if (!reminder.shown && reminder.condition()) {
          // Mostrar lembrete
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification('💡 Dica do BIORITMO+', {
                body: reminder.message,
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png'
              });
            });
          }

          // Marcar como mostrado
          setReminders(prev =>
            prev.map(r =>
              r.id === reminder.id ? { ...r, shown: true } : r
            )
          );
        }
      });
    }, 300000); // Verificar a cada 5 minutos

    return () => clearInterval(interval);
  }, [reminders]);

  return { addReminder };
}
