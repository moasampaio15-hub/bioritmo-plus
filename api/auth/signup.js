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

  const { full_name, email, password } = req.body;
  const hashedPassword = hashPassword(password);

  // Verificar se email já existe
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Este email já está cadastrado.' });
  }

  const newUser = {
    id: Date.now(),
    full_name,
    email,
    password: hashedPassword,
    is_premium: false,
    created_time: new Date().toISOString()
  };

  users.push(newUser);

  // Retornar sem a senha
  const { password: _, ...userWithoutPassword } = newUser;
  res.json(userWithoutPassword);
}
