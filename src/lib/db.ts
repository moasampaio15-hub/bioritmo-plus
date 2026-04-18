import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórios");
}

export const db = createClient({
  url,
  authToken,
});

// Inicializar tabelas
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      is_premium BOOLEAN DEFAULT 0,
      sex TEXT,
      age INTEGER,
      height REAL,
      weight REAL,
      goals TEXT,
      conditions TEXT,
      activity_level TEXT,
      daily_steps_goal INTEGER DEFAULT 10000,
      daily_exercise_minutes_goal INTEGER DEFAULT 30,
      stripe_customer_id TEXT,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      date TEXT,
      sleep_hours REAL,
      sleep_quality INTEGER,
      mood INTEGER,
      energy INTEGER,
      pain INTEGER,
      stress_level INTEGER,
      water INTEGER,
      steps_count INTEGER DEFAULT 0,
      exercise_today BOOLEAN DEFAULT 0,
      steps_goal_reached BOOLEAN DEFAULT 0,
      alcohol_today BOOLEAN DEFAULT 0,
      smoking_today BOOLEAN DEFAULT 0,
      meditation_today BOOLEAN DEFAULT 0,
      social_connection_today BOOLEAN DEFAULT 0,
      weight REAL,
      blood_pressure TEXT,
      glucose REAL,
      notes TEXT,
      tomorrow_goals TEXT,
      gratitude TEXT,
      health_score INTEGER,
      burnout_score INTEGER,
      created_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
