
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS, MASTER_PROMPT } from "../constants";
import { SkateNewsItem, GroundingChunk } from "../types";

export const fetchSkateHubData = async (): Promise<{ data: SkateNewsItem[], sources: GroundingChunk[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: MASTER_PROMPT,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              region: { type: Type.STRING, enum: ['BRAZIL', 'EUROPE', 'USA', 'GLOBAL'] },
              category: { type: Type.STRING, enum: ['industry', 'culture', 'video_parts', 'event_2025_recap', 'event_2026_schedule', 'brand_history'] },
              date: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              url: { type: Type.STRING },
              is_hero: { type: Type.BOOLEAN },
              youtube_id: { type: Type.STRING },
              image_url: { type: Type.STRING }
            },
            required: ['id', 'region', 'category', 'title', 'summary', 'url', 'is_hero', 'content', 'date']
          }
        }
      }
    });

    let text = response.text || '[]';
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    try {
      const result = JSON.parse(text);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { data: result, sources: groundingChunks };
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      throw new Error("Critical Sync Error: Response body corrupted.");
    }
  } catch (error) {
    console.error("Gemini Scan Failed:", error);
    throw error;
  }
};
