import { createClient } from '@libsql/client';
import crypto from 'crypto';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  const hashedPassword = hashPassword(password);

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? AND password = ?',
      args: [email, hashedPassword],
    });
    const user = result.rows[0];
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Email ou senha incorretos.' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Erro no login.' });
  }
}
