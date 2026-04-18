// Simulação de banco em memória (temporário até resolver Turso)
const checkins = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;

    const newCheckin = {
      ...data,
      id: Date.now(),
      created_time: new Date().toISOString()
    };

    checkins.push(newCheckin);
    res.json({ success: true });

  } else if (req.method === 'GET') {
    const { userId } = req.query;
    const userCheckins = checkins
      .filter(c => c.user_id == userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(userCheckins);

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
