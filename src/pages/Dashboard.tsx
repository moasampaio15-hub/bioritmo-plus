import { useAuth } from '../App';
import { Activity, Moon, Heart, Zap, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { icon: Moon, label: 'Média de Sono', value: '7.2h', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { icon: Heart, label: 'Média de Humor', value: '4.1/5', color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: Zap, label: 'Média de Energia', value: '7.8/10', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Activity, label: 'Health Score', value: '85', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 p-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Acompanhe sua evolução</p>
        </div>
        {user && (
          <div className="text-right">
            <p className="text-sm text-slate-500">Bem-vindo,</p>
            <p className="font-bold text-slate-900">{user.full_name}</p>
          </div>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Weekly Progress */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Progresso da Semana</h2>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Check-ins', value: 5, total: 7, color: 'bg-sky-500' },
            { label: 'Metas de Sono', value: 4, total: 7, color: 'bg-indigo-500' },
            { label: 'Exercícios', value: 3, total: 5, color: 'bg-emerald-500' },
          ].map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">{item.label}</span>
                <span className="font-bold text-slate-900">{item.value}/{item.total}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all`}
                  style={{ width: `${(item.value / item.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-5 rounded-2xl border border-sky-200">
        <h3 className="font-bold text-sky-900 mb-2">💡 Dica do dia</h3>
        <p className="text-sm text-sky-700">
          Você está indo bem! Mantenha a consistência nos check-ins para 
          identificar padrões e melhorar sua saúde.
        </p>
      </div>
    </div>
  );
}
