import { CheckIn } from "../types";

export function calculateHealthScore(data: Partial<CheckIn>): number {
  let score = 50; // Base score

  // Sleep (0-12h, 0-10 quality)
  if (data.sleep_hours) {
    if (data.sleep_hours >= 7 && data.sleep_hours <= 9) score += 10;
    else if (data.sleep_hours < 6 || data.sleep_hours > 10) score -= 5;
  }
  if (data.sleep_quality) score += (data.sleep_quality - 5);

  // Mood (1-5)
  if (data.mood) score += (data.mood - 3) * 4;

  // Energy (0-10)
  if (data.energy) score += (data.energy - 5);

  // Pain (0-10) - Lower is better
  if (data.pain !== undefined) score -= (data.pain - 2);

  // Tranquility (0-10) - Higher is better (less stress)
  if (data.stress_level !== undefined) score += (data.stress_level - 5);

  // Hydration (0-12)
  if (data.water) score += (data.water - 6);

  // Steps (0-20000+)
  if (data.steps_count !== undefined) {
    // Give points based on steps, assuming 10k is a good goal
    if (data.steps_count >= 10000) score += 10;
    else if (data.steps_count >= 7000) score += 5;
    else if (data.steps_count < 3000) score -= 5;
  }

  // Habits
  if (data.exercise_today) score += 10;
  if (data.meditation_today) score += 5;
  if (data.social_connection_today) score += 5;
  if (data.alcohol_today) score -= 10;
  if (data.smoking_today) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateBurnoutScore(recentCheckins: CheckIn[]): number {
  if (recentCheckins.length === 0) return 0;

  let riskPoints = 0;
  const days = recentCheckins.length;

  recentCheckins.forEach(c => {
    if (c.mood <= 2) riskPoints += 10;
    if (c.energy <= 3) riskPoints += 10;
    if (c.stress_level <= 3) riskPoints += 15;
    if (c.sleep_quality <= 4) riskPoints += 10;
    if (c.pain >= 6) riskPoints += 5;
    if (!c.social_connection_today) riskPoints += 5;
    if (!c.exercise_today) riskPoints += 5;
  });

  const maxPoints = days * 60;
  const score = (riskPoints / maxPoints) * 100;

  return Math.round(score);
}

export function getHealthStatusLabel(score: number): string {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Regular";
  if (score >= 30) return "Atenção";
  return "Crítico";
}

export function getBurnoutStatusLabel(score: number): string {
  if (score <= 24) return "Baixo risco";
  if (score <= 49) return "Atenção";
  if (score <= 74) return "Risco moderado";
  return "Alto risco";
}
