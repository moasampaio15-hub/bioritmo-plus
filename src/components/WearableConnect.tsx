import { useState } from 'react';
import { Watch, Smartphone, Activity, Heart, Moon, Flame, RefreshCw, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWearables } from '../hooks/useWearables';
import { FadeIn, ScaleOnHover, AnimatedCounter } from './PremiumAnimations';

const deviceIcons: Record<string, any> = {
  apple: Watch,
  google: Smartphone,
  samsung: Smartphone,
  fitbit: Activity,
  garmin: Watch
};

export function WearableConnect() {
  const {
    devices,
    data,
    isSyncing,
    error,
    progress,
    goals,
    connectDevice,
    disconnectDevice,
    syncData
  } = useWearables();

  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showData, setShowData] = useState(false);

  const connectedDevice = devices.find(d => d.connected);

  const handleConnect = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    const success = await connectDevice(deviceId);
    if (success) {
      setShowData(true);
    }
    setSelectedDevice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Watch className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Dispositivos Wearables</h2>
              <p className="text-sm text-slate-500">Conecte seu smartwatch ou pulseira</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Lista de dispositivos */}
      <div className="grid grid-cols-2 gap-4">
        {devices.map((device, index) => {
          const Icon = deviceIcons[device.type] || Watch;
          const isConnecting = selectedDevice === device.id && isSyncing;

          return (
            <FadeIn key={device.id} delay={index * 0.05}>
              <ScaleOnHover scale={1.02}>
                <div
                  onClick={() => !device.connected && handleConnect(device.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all ${
                    device.connected
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500'
                      : 'bg-white border-2 border-slate-100 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      device.connected ? 'bg-emerald-500' : 'bg-slate-100'
                    }`}>
                      {isConnecting ? (
                        <RefreshCw className="w-5 h-5 text-slate-600 animate-spin" />
                      ) : (
                        <Icon className={`w-5 h-5 ${device.connected ? 'text-white' : 'text-slate-600'}`} />
                      )}
                    </div>
                    {device.connected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900">{device.name}</h3>
                  
                  {device.connected && device.lastSync && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Sincronizado {new Date(device.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}

                  {!device.connected && !isConnecting && (
                    <p className="text-xs text-slate-400 mt-1">Toque para conectar</p>
                  )}

                  {device.connected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        disconnectDevice(device.id);
                        setShowData(false);
                      }}
                      className="mt-3 text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Desconectar
                    </button>
                  )}
                </div>
              </ScaleOnHover>
            </FadeIn>
          );
        })}
      </div>

      {/* Dados sincronizados */}
      <AnimatePresence>
        {showData && connectedDevice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Dados Sincronizados</h3>
              <button
                onClick={syncData}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Passos */}
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-sky-500" />
                  <span className="text-sm font-bold text-slate-600">Passos</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  <AnimatedCounter value={data.steps} />
                </p>
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.steps}%` }}
                    className="h-full bg-sky-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Meta: {goals.steps.toLocaleString()}</p>
              </div>

              {/* Sono */}
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-600">Sono</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {data.sleep.toFixed(1)}h
                </p>
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.sleep}%` }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Meta: {goals.sleep}h</p>
              </div>

              {/* Calorias */}
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold text-slate-600">Calorias</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  <AnimatedCounter value={data.calories} />
                </p>
                <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.calories}%` }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Meta: {goals.calories}</p>
              </div>

              {/* Frequência Cardíaca */}
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span className="text-sm font-bold text-slate-600">Batimentos</span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {data.heartRate} <span className="text-sm font-normal text-slate-500">bpm</span>
                </p>
                <p className="text-xs text-slate-400 mt-3">Média do dia</p>
              </div>
            </div>

            {/* Botão importar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg"
            >
              Importar para Check-in de Hoje
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
