import { NextRequest, NextResponse } from "next/server";
import { callAIModel, AIProviderConfig } from "@/lib/ai-provider";
import { RephraseRequest, RephraseResponse } from "@/types/article";

export async function POST(req: NextRequest) {
  try {
    const body: RephraseRequest & { providerConfig?: AIProviderConfig } = await req.json();
    const { text, style = "conversational", topic, providerConfig } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a sentence or paragraph to rephrase." },
        { status: 400 }
      );
    }

    const styleDescriptions: Record<string, string> = {
      conversational: "Natural, everyday B1-B2 conversational English that sounds like a smart friend talking at a coffee shop.",
      punchy: "Short, direct, rhythmic, with maximum punch and zero filler words.",
      humorous: "Witty, slightly self-deprecating, wry, and relatable without being silly.",
      authoritative: "Clear, grounded, experienced practitioner voice backed by conviction.",
      reddit_candid: "Unvarnished, raw street-level honesty like a top upvoted retrospective comment on Reddit."
    };

    const targetStyle = styleDescriptions[style] || styleDescriptions.conversational;

    const systemPrompt = `You are a master essayist and writing editor for Medium publications.
Your job is to rewrite the user's sentence or paragraph according to the requested style: ${targetStyle}.

CRITICAL ANTI-AI BAN LIST:
You are strictly forbidden from using any of these robotic words or phrases:
"delve", "unlock", "game-changer", "fast-paced world", "testament", "beacon", "in conclusion", "tapestry", "realm", "spearhead", "revolutionize", "seamlessly", "furthermore", "moreover", "vital", "paramount", "in the digital age", "landscape", "navigate".

OUTPUT FORMAT:
Respond ONLY with a valid JSON object:
{
  "rephrased": "The best rewritten version",
  "variations": [
    "Alternative variation 1",
    "Alternative variation 2"
  ]
}`;

    const userPrompt = `ORIGINAL TEXT:
"${text.trim()}"

${topic ? `ARTICLE CONTEXT / TOPIC: "${topic}"` : ""}
STYLE GOAL: ${style}`;

    const { rawText } = await callAIModel({
      systemPrompt,
      userPrompt,
      config: providerConfig,
    });

    let clean = rawText.trim();
    if (clean.startsWith("```json")) clean = clean.slice(7);
    if (clean.startsWith("```")) clean = clean.slice(3);
    if (clean.endsWith("```")) clean = clean.slice(0, -3);
    clean = clean.trim();

    let parsed: any;
    try {
      parsed = JSON.parse(clean);
    } catch {
      parsed = {
        rephrased: clean.replace(/[{}"\\]/g, "").trim(),
        variations: []
      };
    }

    return NextResponse.json({
      success: true,
      rephrased: parsed.rephrased || text,
      variations: Array.isArray(parsed.variations) ? parsed.variations : []
    });
  } catch (error: unknown) {
    console.error("Rephrase API error:", error);
    const msg = error instanceof Error ? error.message : "Failed to rephrase sentence.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
