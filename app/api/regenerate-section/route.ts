import { NextRequest, NextResponse } from "next/server";
import { callAIModel, AIProviderConfig } from "@/lib/ai-provider";
import { RegenerateSectionRequest, RegenerateSectionResponse } from "@/types/article";

export async function POST(req: NextRequest) {
  try {
    const body: RegenerateSectionRequest & { providerConfig?: AIProviderConfig } = await req.json();
    const {
      sectionTitle,
      currentContent,
      articleTopic,
      promptInstruction,
      tone = "Conversational & Candid",
      providerConfig,
    } = body;

    if (!sectionTitle || typeof sectionTitle !== "string") {
      return NextResponse.json(
        { success: false, error: "Section title is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an elite Medium essayist and research journalist.
Your task is to completely rewrite or expand a specific H2 section of an in-progress Medium article.

RULES:
1. Maintain plain conversational B1-B2 English and short punchy paragraphs (1-3 sentences maximum).
2. Follow this specific user request for this section: "${promptInstruction || "Make it more engaging, grounded, and practical."}".
3. Tone: ${tone}.
4. STRICT BAN LIST: Zero robotic clichés: NO "delve", "unlock", "game-changer", "fast-paced world", "testament", "beacon", "in conclusion", "tapestry", "realm", "spearhead", "revolutionize", "seamlessly", "furthermore", "moreover", "vital", "paramount", "in the digital age", "landscape", "navigate".
5. OUTPUT: Return ONLY the replacement markdown for this section, including the header (e.g. ## ${sectionTitle.replace(/^#+\s*/, "")}) followed by the rewritten paragraphs, lists, or tables.`;

    const userPrompt = `ARTICLE TOPIC: "${articleTopic || "General"}"
SECTION TITLE: "${sectionTitle}"
CURRENT SECTION TEXT:
${currentContent || "(Empty section)"}

CUSTOM INSTRUCTIONS FOR REGENERATION:
"${promptInstruction || "Rewrite with deeper community examples, realistic friction, and street-level honesty."}"`;

    const { rawText } = await callAIModel({
      systemPrompt,
      userPrompt,
      config: providerConfig,
    });

    const regeneratedMarkdown = rawText?.trim() || currentContent;

    return NextResponse.json({
      success: true,
      regeneratedMarkdown,
    });
  } catch (error: unknown) {
    console.error("Regenerate section error:", error);
    const msg = error instanceof Error ? error.message : "Failed to regenerate section.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
