import { useState, useEffect, useCallback } from 'react';

interface WearableData {
  steps: number;
  heartRate: number;
  sleep: number;
  calories: number;
  distance: number;
  lastSync: Date;
}

interface WearableDevice {
  id: string;
  name: string;
  type: 'apple' | 'google' | 'samsung' | 'fitbit' | 'garmin';
  connected: boolean;
  lastSync?: Date;
}

export function useWearables() {
  const [devices, setDevices] = useState<WearableDevice[]>([
    { id: '1', name: 'Apple Health', type: 'apple', connected: false },
    { id: '2', name: 'Google Fit', type: 'google', connected: false },
    { id: '3', name: 'Samsung Health', type: 'samsung', connected: false },
    { id: '4', name: 'Fitbit', type: 'fitbit', connected: false },
    { id: '5', name: 'Garmin Connect', type: 'garmin', connected: false }
  ]);

  const [data, setData] = useState<WearableData>({
    steps: 0,
    heartRate: 0,
    sleep: 0,
    calories: 0,
    distance: 0,
    lastSync: new Date()
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular conexão com dispositivo
  const connectDevice = useCallback(async (deviceId: string) => {
    setIsSyncing(true);
    setError(null);

    try {
      // Simular delay de conexão
      await new Promise(resolve => setTimeout(resolve, 1500));

      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId
            ? { ...d, connected: true, lastSync: new Date() }
            : d
        )
      );

      // Gerar dados simulados
      const mockData: WearableData = {
        steps: Math.floor(Math.random() * 5000) + 5000,
        heartRate: Math.floor(Math.random() * 30) + 60,
        sleep: Math.random() * 3 + 5,
        calories: Math.floor(Math.random() * 500) + 1500,
        distance: Math.random() * 3 + 2,
        lastSync: new Date()
      };

      setData(mockData);
      setIsSyncing(false);
      return true;
    } catch (err) {
      setError('Erro ao conectar dispositivo');
      setIsSyncing(false);
      return false;
    }
  }, []);

  // Desconectar dispositivo
  const disconnectDevice = useCallback((deviceId: string) => {
    setDevices(prev =>
      prev.map(d =>
        d.id === deviceId
          ? { ...d, connected: false, lastSync: undefined }
          : d
      )
    );
  }, []);

  // Sincronizar dados
  const syncData = useCallback(async () => {
    const connectedDevice = devices.find(d => d.connected);
    if (!connectedDevice) {
      setError('Nenhum dispositivo conectado');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      // Simular sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Atualizar dados com valores simulados
      setData(prev => ({
        steps: prev.steps + Math.floor(Math.random() * 1000),
        heartRate: Math.floor(Math.random() * 30) + 60,
        sleep: Math.random() * 3 + 5,
        calories: prev.calories + Math.floor(Math.random() * 200),
        distance: prev.distance + Math.random() * 0.5,
        lastSync: new Date()
      }));

      // Atualizar lastSync do dispositivo
      setDevices(prev =>
        prev.map(d =>
          d.id === connectedDevice.id
            ? { ...d, lastSync: new Date() }
            : d
        )
      );

      setIsSyncing(false);
    } catch (err) {
      setError('Erro ao sincronizar dados');
      setIsSyncing(false);
    }
  }, [devices]);

  // Auto-sync a cada 5 minutos se houver dispositivo conectado
  useEffect(() => {
    const interval = setInterval(() => {
      const hasConnected = devices.some(d => d.connected);
      if (hasConnected) {
        syncData();
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [devices, syncData]);

  // Calcular metas
  const goals = {
    steps: 10000,
    sleep: 8,
    calories: 2000
  };

  const progress = {
    steps: Math.min((data.steps / goals.steps) * 100, 100),
    sleep: Math.min((data.sleep / goals.sleep) * 100, 100),
    calories: Math.min((data.calories / goals.calories) * 100, 100)
  };

  return {
    devices,
    data,
    isSyncing,
    error,
    progress,
    goals,
    connectDevice,
    disconnectDevice,
    syncData
  };
}

// Hook para importar dados dos wearables para o check-in
export function useWearableImport() {
  const [isImporting, setIsImporting] = useState(false);

  const importToCheckin = useCallback(async (wearableData: WearableData) => {
    setIsImporting(true);

    try {
      // Simular importação
      await new Promise(resolve => setTimeout(resolve, 1000));

      const checkinData = {
        steps_count: wearableData.steps,
        sleep_hours: wearableData.sleep,
        calories_burned: wearableData.calories,
        heart_rate_avg: wearableData.heartRate,
        distance_km: wearableData.distance
      };

      setIsImporting(false);
      return checkinData;
    } catch (err) {
      setIsImporting(false);
      throw new Error('Erro ao importar dados');
    }
  }, []);

  return { importToCheckin, isImporting };
}
