import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FLASH = 'gemini-2.5-flash';

export const generateAnswer = async (question: string, context?: string, imageBase64?: string): Promise<string> => {
  if (!apiKey) return "API Key is missing. Please check your configuration.";

  try {
    let contents: any = [];
    
    // Construct prompt
    const textPrompt = `
      You are an expert university tutor. 
      Question: "${question}"
      ${context ? `Context/Subject: ${context}` : ''}
      
      Provide a clear, academic-standard answer suitable for a university student. 
      Use Markdown formatting for readability (bolding key terms, bullet points for lists).
    `;

    if (imageBase64) {
      // Extract base64 data (remove data:image/png;base64, prefix if present)
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      // Simple mime type detection or default to jpeg
      const mimeType = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)?.[1] || 'image/jpeg';

      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: textPrompt }
        ]
      };
    } else {
      contents = textPrompt;
    }

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: contents,
    });

    return response.text || "No answer generated.";
  } catch (error) {
    console.error("Error generating answer:", error);
    return "Failed to generate answer. Please try again later.";
  }
};

export const elaborateNote = async (topic: string, currentContent: string): Promise<string> => {
  if (!apiKey) return currentContent;

  try {
    const prompt = `
      You are an academic assistant.
      Topic: "${topic}"
      Current Notes: "${currentContent}"
      
      Please expand on these notes. Add definitions, examples, and structure the content clearly using Markdown.
      Keep the tone educational and concise.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
    });

    return response.text || currentContent;
  } catch (error) {
    console.error("Error expanding notes:", error);
    return currentContent + "\n\n[Error: AI expansion failed]";
  }
};

export const summarizeNote = async (topic: string, currentContent: string): Promise<string> => {
  if (!apiKey) return currentContent;

  try {
    const prompt = `
      You are an academic assistant.
      Topic: "${topic}"
      Current Content: "${currentContent}"
      
      Please create a concise "Short Note" summary of this content. 
      Focus on key takeaways, formulas, or main concepts. 
      Use bullet points.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
    });

    return response.text || currentContent;
  } catch (error) {
    console.error("Error summarizing notes:", error);
    return currentContent;
  }
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  if (!apiKey) return [];

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        correctAnswer: { type: Type.STRING },
        explanation: { type: Type.STRING }
      },
      required: ["question", "options", "correctAnswer", "explanation"],
    }
  };

  try {
    const prompt = `Generate 5 multiple-choice questions for university students about: "${topic}". ensure options array has 4 items.`;

    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};
