import { User, CheckIn } from "../types";

// API DEMO - Funciona 100% no navegador sem backend
const DEMO_USERS_KEY = 'bioritmo_demo_users';
const DEMO_CHECKINS_KEY = 'bioritmo_demo_checkins';

// Garantir que usuário demo existe
const ensureDemoUser = () => {
  const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
  const hasDemo = users.find((u: any) => u.email === 'demo@sampaio.com');
  
  if (!hasDemo) {
    users.push({
      id: 1,
      full_name: 'Dr. Moacir Sampaio',
      email: 'demo@sampaio.com',
      password: 'demo123',
      is_premium: true,
      created_time: new Date().toISOString()
    });
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
    console.log('✅ Usuário demo criado');
  }
};

// Inicializar
ensureDemoUser();

export const api = {
  async signup(data: Partial<User>) {
    await new Promise(r => setTimeout(r, 500)); // Simular delay
    
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === data.email)) {
      throw new Error('Este email já está cadastrado.');
    }
    
    const newUser = {
      id: Date.now(),
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      is_premium: false,
      created_time: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
    
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async login(data: Partial<User>) {
    await new Promise(r => setTimeout(r, 500)); // Simular delay
    
    // Garantir que demo existe
    ensureDemoUser();
    
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    const user = users.find((u: any) => 
      u.email === data.email && u.password === data.password
    );
    
    if (!user) {
      throw new Error('Email ou senha incorretos.');
    }
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async updateProfile(data: Partial<User>) {
    await new Promise(r => setTimeout(r, 300));
    
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
    const index = users.findIndex((u: any) => u.id === data.id);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
    }
    
    return { success: true };
  },

  async saveCheckIn(data: CheckIn) {
    await new Promise(r => setTimeout(r, 300));
    
    const checkins = JSON.parse(localStorage.getItem(DEMO_CHECKINS_KEY) || '[]');
    checkins.push({
      ...data,
      id: Date.now(),
      created_time: new Date().toISOString()
    });
    localStorage.setItem(DEMO_CHECKINS_KEY, JSON.stringify(checkins));
    
    return { success: true };
  },

  async getCheckIns(userId: number) {
    await new Promise(r => setTimeout(r, 300));
    
    const checkins = JSON.parse(localStorage.getItem(DEMO_CHECKINS_KEY) || '[]');
    return checkins
      .filter((c: any) => c.user_id === userId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getTodayCheckIn(userId: number) {
    await new Promise(r => setTimeout(r, 200));
    
    const checkins = JSON.parse(localStorage.getItem(DEMO_CHECKINS_KEY) || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    return checkins.find((c: any) => c.user_id === userId && c.date === today) || null;
  }
};
