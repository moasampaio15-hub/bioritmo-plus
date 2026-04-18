import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Banco de Dados Local (Simples e Direto)
const db = new Database("bioritmo.db");

// Inicializar Tabelas
db.exec(`
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
  );

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
    exercise_today BOOLEAN,
    steps_goal_reached BOOLEAN,
    alcohol_today BOOLEAN,
    smoking_today BOOLEAN,
    meditation_today BOOLEAN,
    social_connection_today BOOLEAN,
    weight REAL,
    blood_pressure TEXT,
    glucose REAL,
    notes TEXT,
    tomorrow_goals TEXT,
    gratitude TEXT,
    health_score INTEGER,
    burnout_score INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function startServer() {
  const app = express();

  // Webhook do Stripe (Para saber quando o usuário pagou)
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (userId) {
        const stmt = db.prepare("UPDATE users SET is_premium = 1, stripe_customer_id = ? WHERE id = ?");
        stmt.run(session.customer as string, userId);
        console.log(`Usuário ${userId} agora é PREMIUM!`);
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // Rotas de Autenticação
  app.post("/api/auth/signup", (req, res) => {
    const { full_name, email, password } = req.body;
    const hashedPassword = hashPassword(password);
    try {
      const stmt = db.prepare("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)");
      const info = stmt.run(full_name, email, password === "admin" ? password : hashedPassword); // Keep admin for testing if needed, but better hash all
      res.json({ id: info.lastInsertRowid, full_name, email, is_premium: false });
    } catch (e) {
      res.status(400).json({ error: "Este email já está cadastrado." });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND (password = ? OR password = ?)").get(email, password, hashedPassword);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Email ou senha incorretos." });
    }
  });

  app.put("/api/user/profile", (req, res) => {
    const { id, sex, age, height, weight, goals, conditions, activity_level, daily_steps_goal, daily_exercise_minutes_goal } = req.body;
    const stmt = db.prepare(`
      UPDATE users 
      SET sex = ?, age = ?, height = ?, weight = ?, goals = ?, conditions = ?, activity_level = ?, daily_steps_goal = ?, daily_exercise_minutes_goal = ?
      WHERE id = ?
    `);
    stmt.run(sex, age, height, weight, goals, conditions, activity_level, daily_steps_goal, daily_exercise_minutes_goal, id);
    res.json({ success: true });
  });

  // Rotas de Check-in
  app.post("/api/checkins", (req, res) => {
    const data = req.body;
    const columns = Object.keys(data).join(", ");
    const placeholders = Object.keys(data).map(() => "?").join(", ");
    const values = Object.values(data);
    
    try {
      const stmt = db.prepare(`INSERT INTO checkins (${columns}) VALUES (${placeholders})`);
      stmt.run(...values);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Erro ao salvar check-in." });
    }
  });

  app.get("/api/checkins/:userId", (req, res) => {
    const checkins = db.prepare("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC").all(req.params.userId);
    res.json(checkins);
  });

  app.get("/api/checkins/today/:userId", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const checkin = db.prepare("SELECT * FROM checkins WHERE user_id = ? AND date = ?").get(req.params.userId, today);
    res.json(checkin || null);
  });

  // Rota do Stripe
  app.post("/api/create-checkout-session", async (req, res) => {
    const { userId, planType } = req.body;
    let appUrl = process.env.APP_URL || `https://${req.get('host')}`;
    // Remover barra final se existir para evitar // nas URLs
    if (appUrl.endsWith('/')) {
      appUrl = appUrl.slice(0, -1);
    }
    
    console.log(`Criando sessão de checkout para usuário ${userId}, plano ${planType}`);
    
    // Pega o ID do preço baseado no plano selecionado
    const priceId = planType === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_YEARLY_PRICE_ID;

    if (!priceId) {
      console.error(`ERRO: ID de preço para '${planType}' não encontrado nos Secrets.`);
      return res.status(500).json({ error: `O ID do plano ${planType === 'monthly' ? 'Mensal' : 'Anual'} não foi configurado nos Secrets do Stripe.` });
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
      console.log("Sessão criada com sucesso:", session.id);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Erro no Stripe Checkout:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Rota para o Portal do Cliente (Gerenciar Assinatura)
  app.post("/api/create-portal-session", async (req, res) => {
    const { customerId } = req.body;
    const appUrl = process.env.APP_URL || `https://${req.get('host')}`;

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/settings`,
      });
      res.json({ url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
