
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS, MASTER_PROMPT } from "../constants";
import { SkateNewsItem, GroundingChunk } from "../types";

export const fetchSkateHubData = async (): Promise<{ data: SkateNewsItem[], sources: GroundingChunk[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Upgraded to Pro for better stability with complex JSON
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
              category: { type: Type.STRING, enum: ['industry', 'culture', 'video_parts', 'event_2025_recap', 'event_2026_schedule', 'brand_history'] },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              url: { type: Type.STRING },
              is_hero: { type: Type.BOOLEAN },
              youtube_id: { type: Type.STRING },
              image_url: { type: Type.STRING }
            },
            required: ['category', 'title', 'summary', 'url', 'is_hero', 'content']
          }
        }
      }
    });

    const text = response.text || '[]';
    let result: SkateNewsItem[] = [];
    
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error. Attempting to repair truncated response...", parseError);
      // Simple repair: if it's truncated, try to close the array
      if (text.trim().startsWith('[') && !text.trim().endsWith(']')) {
        try {
          const repairedText = text.substring(0, text.lastIndexOf('}')) + '}]';
          result = JSON.parse(repairedText);
        } catch (retryError) {
          throw new Error("Critical Failure: Gemini returned malformed and unrepairable data.");
        }
      } else {
        throw parseError;
      }
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { data: result, sources: groundingChunks };
  } catch (error) {
    console.error("Gemini Scan Failed:", error);
    throw error;
  }
};
