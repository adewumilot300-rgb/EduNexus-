
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";
import { v4 as uuidv4 } from 'uuid';

// NOTE: In a real production app, API calls should proxy through a backend to hide the Key.
// For this client-side demo, we assume process.env.API_KEY is available or we warn user.

export const generateQuestions = async (topic: string, count: number, difficulty: string): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY missing for Gemini.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} multiple choice questions about "${topic}" at ${difficulty} difficulty level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 options"
              },
              correctOptionIndex: { 
                type: Type.INTEGER,
                description: "Index of correct option (0-3)"
              },
              subject: { type: Type.STRING, description: "The inferred subject (e.g. Math, Science)" }
            },
            required: ["questionText", "options", "correctOptionIndex", "subject"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");
    const optionLabels = ['A', 'B', 'C', 'D'];

    return rawData.map((item: any) => ({
      id: uuidv4(),
      text: item.questionText,
      options: item.options,
      correctAnswer: optionLabels[item.correctOptionIndex],
      type: QuestionType.MCQ,
      subject: item.subject,
      difficulty: difficulty === 'Easy' || difficulty === 'Medium' || difficulty === 'Hard' ? difficulty : 'Medium',
      createdAt: Date.now()
    }));

  } catch (error) {
    console.error("Failed to generate questions", error);
    throw error;
  }
};
