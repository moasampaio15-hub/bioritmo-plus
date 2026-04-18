import { createClient } from '@libsql/client';

export default async function handler(req, res) {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    return res.status(500).json({ error: 'Configuração do banco de dados incompleta' });
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  if (req.method === 'POST') {
    const data = req.body;
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    try {
      await db.execute({
        sql: `INSERT INTO checkins (${columns}) VALUES (${placeholders})`,
        args: values,
      });
      res.json({ success: true });
    } catch (e) {
      console.error('Erro ao salvar check-in:', e);
      res.status(500).json({ error: 'Erro ao salvar check-in.' });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;
    try {
      const result = await db.execute({
        sql: 'SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC',
        args: [userId],
      });
      res.json(result.rows);
    } catch (e) {
      console.error('Erro ao buscar check-ins:', e);
      res.status(500).json({ error: 'Erro ao buscar check-ins.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
