import crypto from 'crypto';

// Simulação de banco em memória (temporário até resolver Turso)
const users = [];

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  const hashedPassword = hashPassword(password);

  const user = users.find(u => u.email === email && u.password === hashedPassword);

  if (!user) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  // Retornar sem a senha
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
}
