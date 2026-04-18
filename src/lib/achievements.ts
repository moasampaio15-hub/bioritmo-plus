import { CheckIn } from "../types";
import { Flame, Droplets, Moon, Heart, Trophy, Zap } from "lucide-react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function calculateAchievements(checkins: CheckIn[]): Achievement[] {
  const achievements: Achievement[] = [
    {
      id: "streak_7",
      title: "Guerreiro Semanal",
      description: "Mantenha um streak de 7 dias.",
      icon: Flame,
      color: "text-orange-500",
      isUnlocked: false,
      progress: 0,
      maxProgress: 7,
    },
    {
      id: "water_7",
      title: "Hidratado Real",
      description: "Bata a meta de água por 7 dias seguidos.",
      icon: Droplets,
      color: "text-blue-500",
      isUnlocked: false,
      progress: 0,
      maxProgress: 7,
    },
    {
      id: "sleep_7",
      title: "Mestre do Sono",
      description: "Durma mais de 7h por 7 dias seguidos.",
      icon: Moon,
      color: "text-indigo-500",
      isUnlocked: false,
      progress: 0,
      maxProgress: 7,
    },
    {
      id: "gratitude_5",
      title: "Coração Grato",
      description: "Escreva no diário de gratidão por 5 dias.",
      icon: Heart,
      color: "text-rose-500",
      isUnlocked: false,
      progress: 0,
      maxProgress: 5,
    },
  ];

  // Logic to calculate progress
  // (Simplified for demo purposes)
  const streak = calculateCurrentStreak(checkins);
  achievements[0].progress = Math.min(streak, 7);
  achievements[0].isUnlocked = streak >= 7;

  const waterDays = checkins.filter(c => c.water >= 8).length;
  achievements[1].progress = Math.min(waterDays, 7);
  achievements[1].isUnlocked = waterDays >= 7;

  const sleepDays = checkins.filter(c => c.sleep_hours >= 7).length;
  achievements[2].progress = Math.min(sleepDays, 7);
  achievements[2].isUnlocked = sleepDays >= 7;

  const gratitudeDays = checkins.filter(c => c.gratitude && c.gratitude.length > 0).length;
  achievements[3].progress = Math.min(gratitudeDays, 5);
  achievements[3].isUnlocked = gratitudeDays >= 5;

  return achievements;
}

function calculateCurrentStreak(checkins: CheckIn[]): number {
  if (checkins.length === 0) return 0;
  // This is a simplified version of the streak logic
  return checkins.length; 
}
