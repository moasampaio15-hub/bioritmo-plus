// Versão DEMO - Autenticação com localStorage (sem Firebase)
// Isso permite testar o app sem configurar backend

import { User } from '../types';

const DEMO_USERS_KEY = 'bioritmo_demo_users';
const DEMO_CURRENT_USER_KEY = 'bioritmo_demo_current_user';

interface DemoUser extends User {
  password: string;
}

// Criar usuário demo
export const demoAuth = {
  signup: (data: { full_name: string; email: string; password: string }): User => {
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    
    // Verificar se email existe
    if (users.find((u: DemoUser) => u.email === data.email)) {
      throw new Error('Este email já está cadastrado.');
    }

    const newUser: DemoUser = {
      id: Date.now(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      is_premium: false,
      created_time: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
    
    // Logar automaticamente
    const { password, ...userWithoutPassword } = newUser;
    localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  },

  login: (email: string, password: string): User => {
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    const user = users.find((u: DemoUser) => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou senha incorretos.');
    }

    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(DEMO_CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  },

  logout: () => {
    localStorage.removeItem(DEMO_CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const saved = localStorage.getItem(DEMO_CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  // Criar usuário demo para testes
  createDemoUser: () => {
    const existingUsers = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    
    // Só cria se não existir
    if (existingUsers.length === 0) {
      const demoUsers = [
        {
          id: 1,
          full_name: 'Dr. Moacir Sampaio',
          email: 'demo@sampaio.com',
          password: 'demo123',
          is_premium: true,
          created_time: new Date().toISOString()
        }
      ];
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(demoUsers));
      console.log('✅ Usuário demo criado: demo@sampaio.com / demo123');
    }
  },

  // Verificar se usuário demo existe
  hasDemoUser: () => {
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    return users.some((u: DemoUser) => u.email === 'demo@sampaio.com');
  }
};

// Dados demo para check-ins
export const demoCheckins = {
  getAll: (userId: number) => {
    const key = `bioritmo_demo_checkins_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  save: (userId: number, checkin: any) => {
    const key = `bioritmo_demo_checkins_${userId}`;
    const checkins = JSON.parse(localStorage.getItem(key) || '[]');
    checkins.push({ ...checkin, id: Date.now() });
    localStorage.setItem(key, JSON.stringify(checkins));
    return { success: true };
  },

  getToday: (userId: number) => {
    const checkins = demoCheckins.getAll(userId);
    const today = new Date().toISOString().split('T')[0];
    return checkins.find((c: any) => c.date === today) || null;
  }
};
