// Banco de dados local usando localStorage
// Fallback temporário até resolver o Turso

const DB_KEY = 'bioritmo_local_db';

interface LocalDB {
  users: any[];
  checkins: any[];
}

function getDB(): LocalDB {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return { users: [], checkins: [] };
}

function saveDB(db: LocalDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export const localDb = {
  // Users
  createUser: (user: any) => {
    const db = getDB();
    const existing = db.users.find(u => u.email === user.email);
    if (existing) {
      throw new Error('Este email já está cadastrado.');
    }
    const newUser = { ...user, id: Date.now(), is_premium: false };
    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  login: (email: string, password: string) => {
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Email ou senha incorretos.');
    }
    return user;
  },

  // Checkins
  saveCheckIn: (checkin: any) => {
    const db = getDB();
    db.checkins.push({ ...checkin, id: Date.now() });
    saveDB(db);
    return { success: true };
  },

  getCheckIns: (userId: number) => {
    const db = getDB();
    return db.checkins
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getTodayCheckIn: (userId: number) => {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];
    return db.checkins.find(c => c.user_id === userId && c.date === today) || null;
  },
};
