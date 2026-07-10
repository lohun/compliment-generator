import { GoogleGenAI } from "@google/genai";
import {
  buildGenerationUserTurn,
  RESPONSE_SCHEMA,
} from "@/lib/gemini/prompts";
import { SYSTEM_INSTRUCTION } from "./prompts";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenAI({apiKey: apiKey});

/**
 * Returns a configured Gemini model with the theatrical compliment system
 * instruction pre-loaded. Called per-request (stateless).
 */
export async function getModel(input: string) {
  return await genAI.interactions.create({
    model: modelName,
    system_instruction: SYSTEM_INSTRUCTION,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: RESPONSE_SCHEMA
    },
    generation_config: {
      temperature: 1.2,
      thinking_level: "high",
    },
    input: input,
  });
}
