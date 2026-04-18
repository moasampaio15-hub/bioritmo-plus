import { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Target, Flame, Heart, Brain, Moon, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  color: string;
}

export function GamificationPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-checkin',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro check-in',
      icon: Star,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'week-streak',
      title: 'Semana de Foco',
      description: '7 dias de check-ins consecutivos',
      icon: Flame,
      unlocked: false,
      progress: 5,
      maxProgress: 7,
      color: 'from-orange-400 to-red-500'
    },
    {
      id: 'sleep-master',
      title: 'Mestre do Sono',
      description: '10 noites com 8+ horas de sono',
      icon: Moon,
      unlocked: false,
      progress: 3,
      maxProgress: 10,
      color: 'from-indigo-400 to-purple-500'
    },
    {
      id: 'hydration-hero',
      title: 'Hidratação Perfeita',
      description: 'Beba 8 copos de água por 5 dias',
      icon: Activity,
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      id: 'mindfulness-master',
      title: 'Mente Zen',
      description: 'Medite por 10 dias seguidos',
      icon: Brain,
      unlocked: false,
      progress: 4,
      maxProgress: 10,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'health-champion',
      title: 'Campeão da Saúde',
      description: 'Score de saúde acima de 90 por 7 dias',
      icon: Trophy,
      unlocked: false,
      progress: 2,
      maxProgress: 7,
      color: 'from-amber-400 to-yellow-500'
    }
  ]);

  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(1250);
  const [nextLevelXp, setNextLevelXp] = useState(2000);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Header com nível e XP */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-white">{level}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nível</p>
              <p className="text-xl font-black text-slate-900">Health Warrior</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-sky-600">{xp} <span className="text-sm text-slate-400">/ {nextLevelXp} XP</span></p>
            <p className="text-xs font-bold text-slate-400">{nextLevelXp - xp} XP para o próximo nível</p>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(xp / nextLevelXp) * 100}%` }}
            className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full"
          />
        </div>
      </div>

      {/* Streak atual */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">5</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dias seguidos</p>
          </div>
        </div>
        
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{unlockedCount}/{totalCount}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conquistas</p>
          </div>
        </div>
      </div>

      {/* Lista de conquistas */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-slate-900">Conquistas</h3>
        
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
          
          return (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-4 flex items-center gap-4 ${
                achievement.unlocked ? 'border-2 border-yellow-400' : ''
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg ${
                !achievement.unlocked && 'opacity-50 grayscale'
              }`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{achievement.title}</h4>
                  {achievement.unlocked && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">
                      DESBLOQUEADO
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{achievement.description}</p>
                
                {/* Progresso */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className={`h-full rounded-full bg-gradient-to-r ${achievement.color}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dica motivacional */}
      <div className="glass-card p-5 bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-sky-600 mt-0.5" />
          <div>
            <p className="font-bold text-sky-900">Dica do dia</p>
            <p className="text-sm text-sky-700">
              Você está a apenas 2 dias de desbloquear a conquista "Semana de Foco"! 
              Mantenha a consistência nos seus check-ins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
