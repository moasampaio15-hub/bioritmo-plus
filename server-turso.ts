import express from "express";
import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Turso
const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  console.error("ERRO: TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórios");
  process.exit(1);
}

const db = createClient({
  url: dbUrl,
  authToken: authToken,
});

// Inicializar tabelas
async function initDb() {
  try {
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
    
    console.log("✅ Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error);
  }
}

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

// Helpers
function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Iniciar servidor
async function startServer() {
  await initDb();
  
  const app = express();
  app.use(express.json());

  // Rotas de Autenticação
  app.post("/api/auth/signup", async (req, res) => {
    const { full_name, email, password } = req.body;
    const hashedPassword = hashPassword(password);
    try {
      const result = await db.execute({
        sql: "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
        args: [full_name, email, password === "admin" ? password : hashedPassword],
      });
      res.json({ id: result.lastInsertRowid, full_name, email, is_premium: false });
    } catch (e: any) {
      res.status(400).json({ error: "Este email já está cadastrado." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    try {
      const result = await db.execute({
        sql: "SELECT * FROM users WHERE email = ? AND (password = ? OR password = ?)",
        args: [email, password, hashedPassword],
      });
      const user = result.rows[0];
      if (user) {
        res.json(user);
      } else {
        res.status(401).json({ error: "Email ou senha incorretos." });
      }
    } catch (e) {
      res.status(500).json({ error: "Erro no login." });
    }
  });

  app.put("/api/user/profile", async (req, res) => {
    const { id, sex, age, height, weight, goals, conditions, activity_level, daily_steps_goal, daily_exercise_minutes_goal } = req.body;
    try {
      await db.execute({
        sql: `UPDATE users 
              SET sex = ?, age = ?, height = ?, weight = ?, goals = ?, conditions = ?, activity_level = ?, daily_steps_goal = ?, daily_exercise_minutes_goal = ?
              WHERE id = ?`,
        args: [sex, age, height, weight, goals, conditions, activity_level, daily_steps_goal, daily_exercise_minutes_goal, id],
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
  });

  // Rotas de Check-in
  app.post("/api/checkins", async (req, res) => {
    const data = req.body;
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data).map(() => "?").join(", ");
    const values = Object.values(data);
    
    try {
      await db.execute({
        sql: `INSERT INTO checkins (${columns}) VALUES (${placeholders})`,
        args: values,
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: "Erro ao salvar check-in." });
    }
  });

  app.get("/api/checkins/:userId", async (req, res) => {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC",
        args: [req.params.userId],
      });
      res.json(result.rows);
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar check-ins." });
    }
  });

  app.get("/api/checkins/today/:userId", async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const result = await db.execute({
        sql: "SELECT * FROM checkins WHERE user_id = ? AND date = ?",
        args: [req.params.userId, today],
      });
      res.json(result.rows[0] || null);
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar check-in de hoje." });
    }
  });

  // Rota do Stripe
  app.post("/api/create-checkout-session", async (req, res) => {
    const { userId, planType } = req.body;
    let appUrl = process.env.APP_URL || `https://${req.get('host')}`;
    if (appUrl.endsWith('/')) {
      appUrl = appUrl.slice(0, -1);
    }
    
    const priceId = planType === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_YEARLY_PRICE_ID;

    if (!priceId) {
      return res.status(500).json({ error: `ID do plano não configurado.` });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: `${appUrl}/?success=true`,
        cancel_url: `${appUrl}/subscription`,
        client_reference_id: userId.toString(),
      });
      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook do Stripe
  app.post("/api/stripe-webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret || "");
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      
      if (userId) {
        await db.execute({
          sql: "UPDATE users SET is_premium = 1 WHERE id = ?",
          args: [userId],
        });
      }
    }

    res.json({ received: true });
  });

  // Servir arquivos estáticos
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

startServer();
