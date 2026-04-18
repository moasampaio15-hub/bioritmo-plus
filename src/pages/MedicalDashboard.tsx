import { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, Calendar, FileText, Activity, Heart, Brain, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastCheckin: string;
  healthScore: number;
  trend: 'up' | 'down' | 'stable';
  alerts: string[];
  avatar?: string;
}

export default function MedicalDashboard() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'Maria Silva',
      age: 45,
      lastCheckin: '2026-04-18',
      healthScore: 87,
      trend: 'up',
      alerts: ['Sono irregular detectado']
    },
    {
      id: '2',
      name: 'João Santos',
      age: 52,
      lastCheckin: '2026-04-17',
      healthScore: 72,
      trend: 'down',
      alerts: ['Nível de estresse elevado', 'Baixa hidratação']
    },
    {
      id: '3',
      name: 'Ana Costa',
      age: 38,
      lastCheckin: '2026-04-18',
      healthScore: 94,
      trend: 'stable',
      alerts: []
    },
    {
      id: '4',
      name: 'Carlos Lima',
      age: 61,
      lastCheckin: '2026-04-16',
      healthScore: 68,
      trend: 'down',
      alerts: ['Pressão arterial elevada', 'Sono insuficiente']
    }
  ]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filter, setFilter] = useState<'all' | 'alerts' | 'recent'>('all');

  const stats = {
    totalPatients: patients.length,
    avgHealthScore: Math.round(patients.reduce((acc, p) => acc + p.healthScore, 0) / patients.length),
    patientsWithAlerts: patients.filter(p => p.alerts.length > 0).length,
    activeToday: patients.filter(p => p.lastCheckin === '2026-04-18').length
  };

  const filteredPatients = patients.filter(p => {
    if (filter === 'alerts') return p.alerts.length > 0;
    if (filter === 'recent') return p.lastCheckin === '2026-04-18';
    return true;
  });

  const chartData = [
    { name: 'Seg', score: 75, patients: 12 },
    { name: 'Ter', score: 78, patients: 15 },
    { name: 'Qua', score: 82, patients: 18 },
    { name: 'Qui', score: 80, patients: 16 },
    { name: 'Sex', score: 85, patients: 20 },
    { name: 'Sáb', score: 83, patients: 14 },
    { name: 'Dom', score: 87, patients: 22 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Painel Médico</h1>
          <p className="text-slate-500">Acompanhe seus pacientes em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-sky-50 text-sky-700 rounded-xl text-sm font-bold">
            Dr. Moacir Sampaio
          </span>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{stats.totalPatients}</p>
              <p className="text-sm text-slate-500">Pacientes ativos</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{stats.avgHealthScore}</p>
              <p className="text-sm text-slate-500">Score médio</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{stats.patientsWithAlerts}</p>
              <p className="text-sm text-slate-500">Precisam atenção</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{stats.activeToday}</p>
              <p className="text-sm text-slate-500">Ativos hoje</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gráfico de tendências */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Evolução da Saúde dos Pacientes</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de pacientes */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Pacientes</h2>
          <div className="flex gap-2">
            {(['all', 'alerts', 'recent'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' && 'Todos'}
                {f === 'alerts' && 'Com Alertas'}
                {f === 'recent' && 'Ativos Hoje'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedPatient(patient)}
              className="p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{patient.name}</h3>
                    <p className="text-sm text-slate-500">{patient.age} anos • Último check-in: {patient.lastCheckin}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {patient.alerts.length > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-bold">{patient.alerts.length} alertas</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      patient.healthScore >= 80 ? 'bg-emerald-500' :
                      patient.healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <span className="font-bold text-slate-900">{patient.healthScore}</span>
                  </div>

                  <TrendingUp className={`w-5 h-5 ${
                    patient.trend === 'up' ? 'text-emerald-500' :
                    patient.trend === 'down' ? 'text-rose-500' : 'text-slate-400'
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
