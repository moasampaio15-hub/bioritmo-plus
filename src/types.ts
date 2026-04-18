export interface User {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  is_premium?: boolean;
  sex?: string;
  age?: number;
  height?: number;
  weight?: number;
  goals?: string;
  conditions?: string;
  activity_level?: string;
  daily_steps_goal?: number;
  daily_exercise_minutes_goal?: number;
  stripe_customer_id?: string;
}

export interface CheckIn {
  id?: number;
  user_id: number;
  date: string;
  created_time?: string;
  sleep_hours: number;
  sleep_quality: number;
  mood: number;
  energy: number;
  pain: number;
  stress_level: number;
  water: number;
  steps_count: number;
  exercise_today: boolean;
  steps_goal_reached: boolean;
  alcohol_today: boolean;
  smoking_today: boolean;
  meditation_today: boolean;
  social_connection_today: boolean;
  weight: number;
  blood_pressure: string;
  glucose: number;
  notes: string;
  tomorrow_goals: string;
  gratitude: string;
  health_score: number;
  burnout_score: number;
}
