import { GoogleGenAI } from "@google/genai";
import { CheckIn } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getHealthInsights(checkins: CheckIn[]) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analise os seguintes check-ins de saúde dos últimos dias e forneça insights personalizados em Português (Brasil).
    Check-ins: ${JSON.stringify(checkins.slice(0, 7))}

    Sua resposta deve ser um resumo amigável, identificando tendências preocupantes (como burnout, falta de sono ou estresse alto) e fornecendo sugestões de estilo de vida não diagnósticas.
    
    IMPORTANTE:
    - Não diagnostique doenças.
    - Não prescreva medicamentos.
    - Não substitua cuidados médicos.
    - Inclua sempre o aviso: "Esta análise é informativa e não substitui avaliação médica."
    - Use um tom profissional, moderno e encorajador.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar insights no momento. Continue registrando seus dados.";
  }
}

export async function getWeeklyReportInterpretation(checkins: CheckIn[]) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Gere uma interpretação para um relatório semanal de saúde baseado nestes dados:
    ${JSON.stringify(checkins.slice(0, 7))}

    Forneça:
    1. Um resumo da semana.
    2. Sugestões de melhoria de hábitos.
    3. Top 3 recomendações para a próxima semana.

    Idioma: Português (Brasil).
    Mantenha o tom profissional e preventivo.
    Inclua o disclaimer médico.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Resumo semanal indisponível.";
  }
}
