// Simulação de banco em memória (temporário até resolver Turso)
const checkins = [];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const today = new Date().toISOString().split('T')[0];

  const todayCheckin = checkins.find(c => c.user_id == userId && c.date === today);

  res.json(todayCheckin || null);
}
