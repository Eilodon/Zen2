import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../shared/lib/db";
import { ZenResponse } from "../entities/store";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a Digital Zen Master. 
Context provided is the user's recent history. 
Input is the user's current thought. 
Analyze the "realm" of the user's state (Anxiety, Joy, Stillness, Confusion, Anger). 
Provide advice in Vietnamese (inspired by Thich Nhat Hanh - gentle, mindful, interbeing).
Determine an action_intent:
- 'PLAY_BINAURAL' if the user is stressed, anxious, or needs grounding.
- 'SET_TIMER' if the user needs focus or mentions working/studying.
- 'NONE' otherwise.
Generate a 'thought_trace' explaining your analysis in 1 short sentence.

Output STRICT JSON.
`;

export const analyzeInput = async (text: string): Promise<ZenResponse> => {
  try {
    const history = await db.getLast5Moods();
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: `History Context:\n${history}` },
          { text: `User Input: ${text}` }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thought_trace: { type: Type.STRING },
            realm: { type: Type.STRING },
            advice: { type: Type.STRING },
            action_intent: { type: Type.STRING, enum: ['SET_TIMER', 'PLAY_BINAURAL', 'NONE'] }
          },
          required: ['thought_trace', 'realm', 'advice', 'action_intent']
        }
      }
    });

    const result = JSON.parse(response.text || '{}') as ZenResponse;
    
    // Persist to DB asynchronously
    db.moods.add({
      timestamp: Date.now(),
      input: text,
      realm: result.realm,
      advice: result.advice
    });

    return result;
  } catch (error) {
    console.error("Gemini Brain Error:", error);
    return {
      thought_trace: "Connection to the present moment interrupted.",
      realm: "Unknown",
      advice: "Hãy thở sâu. Kết nối mạng của bạn có vẻ không ổn định, nhưng tâm bạn vẫn có thể tĩnh lặng.",
      action_intent: 'NONE'
    };
  }
};