import { CheckIn } from "../types";

export function calculateStreak(checkins: CheckIn[]): number {
  if (!checkins || checkins.length === 0) return 0;

  // Sort by date descending
  const sorted = [...checkins].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check if the most recent checkin is today or yesterday
  const lastCheckinDate = new Date(sorted[0].date);
  lastCheckinDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((currentDate.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return 0; // Streak broken

  streak = 1;
  let prevDate = lastCheckinDate;

  for (let i = 1; i < sorted.length; i++) {
    const checkinDate = new Date(sorted[i].date);
    checkinDate.setHours(0, 0, 0, 0);

    const diff = Math.floor((prevDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      streak++;
      prevDate = checkinDate;
    } else if (diff === 0) {
      continue; // Same day, ignore
    } else {
      break; // Gap found
    }
  }

  return streak;
}
