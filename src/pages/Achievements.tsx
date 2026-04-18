import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import { api } from "../lib/api";
import { CheckIn } from "../types";
import { calculateAchievements, Achievement } from "../lib/achievements";
import { motion } from "motion/react";
import { Trophy, Lock, CheckCircle2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";

export default function Achievements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getCheckIns(user.id).then(data => {
        const calculated = calculateAchievements(data);
        setAchievements(calculated);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div></div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-display tracking-tight">Conquistas</h2>
          <p className="text-slate-500 text-sm font-medium">Sua jornada em medalhas.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={clsx(
                "glass-card p-6 flex items-center gap-5 relative overflow-hidden",
                achievement.isUnlocked ? "border-sky-200 dark:border-sky-900/30" : "opacity-70"
              )}
            >
              <div className={clsx(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                achievement.isUnlocked ? "premium-gradient" : "bg-slate-100 dark:bg-slate-800"
              )}>
                {achievement.isUnlocked ? (
                  <Icon className="w-8 h-8 text-white" />
                ) : (
                  <Lock className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-slate-900 dark:text-white leading-tight">{achievement.title}</h3>
                  {achievement.isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-500 font-medium">{achievement.description}</p>
                
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">Progresso</span>
                    <span className="text-sky-600">{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      className="h-full premium-gradient"
                    />
                  </div>
                </div>
              </div>

              {achievement.isUnlocked && (
                <div className="absolute -top-2 -right-2 opacity-10">
                  <Trophy className="w-20 h-20 text-sky-600 rotate-12" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
