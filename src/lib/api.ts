import { User, CheckIn } from "../types";

export const api = {
  async signup(data: Partial<User>) {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao cadastrar");
    }
    return response.json();
  },

  async login(data: Partial<User>) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Credenciais inválidas");
    }
    return response.json();
  },

  async updateProfile(data: Partial<User>) {
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async saveCheckIn(data: CheckIn) {
    const response = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getCheckIns(userId: number) {
    const response = await fetch(`/api/checkins/${userId}`);
    return response.json();
  },

  async getTodayCheckIn(userId: number) {
    const response = await fetch(`/api/checkins/today/${userId}`);
    return response.json();
  },
};
