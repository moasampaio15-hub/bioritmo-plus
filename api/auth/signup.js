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

  const { full_name, email, password } = req.body;
  const hashedPassword = hashPassword(password);

  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      args: [full_name, email, hashedPassword],
    });
    res.json({ id: result.lastInsertRowid, full_name, email, is_premium: false });
  } catch (e) {
    res.status(400).json({ error: 'Este email já está cadastrado.' });
  }
}
