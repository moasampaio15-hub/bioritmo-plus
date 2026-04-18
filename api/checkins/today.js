import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM checkins WHERE user_id = ? AND date = ?',
      args: [userId, today],
    });
    res.json(result.rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao buscar check-in de hoje.' });
  }
}
