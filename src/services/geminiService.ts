import { GoogleGenAI } from "@google/genai";
import { CheckIn } from "../types";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateWeeklyReport(checkins: CheckIn[]) {
  if (!apiKey) {
    throw new Error("Gemini API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const dataSummary = checkins.map(c => ({
    date: c.date,
    health: c.health_score,
    burnout: c.burnout_score,
    sleep: c.sleep_hours,
    mood: c.mood,
    energy: c.energy,
    gratitude: c.gratitude,
    notes: c.notes
  }));

  const prompt = `
    Como um especialista em saúde e bem-estar, analise os dados de check-in da última semana de um usuário e forneça um relatório conciso e motivador.
    
    Dados da semana:
    ${JSON.stringify(dataSummary, null, 2)}
    
    Por favor, forneça:
    1. Um resumo geral do equilíbrio saúde/trabalho.
    2. Uma observação específica sobre padrões (ex: relação entre sono e humor).
    3. Uma recomendação prática para a próxima semana.
    4. Uma frase motivacional baseada nas gratidões do usuário.
    
    Responda em Português do Brasil. Use um tom profissional, porém acolhedor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating AI report:", error);
    return "Não foi possível gerar o relatório de IA no momento. Tente novamente mais tarde.";
  }
}
