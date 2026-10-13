import { GoogleGenAI } from "@google/genai";

// Server-side Gemini initialization with required telemetry header
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});
