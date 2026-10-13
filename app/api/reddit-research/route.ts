import { NextRequest, NextResponse } from "next/server";
import { performRedditResearch } from "@/lib/reddit-researcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, subreddits, audience, focusKeywords } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid topic to research on Reddit." },
        { status: 400 }
      );
    }

    const subList = Array.isArray(subreddits)
      ? subreddits
      : typeof subreddits === "string"
      ? subreddits.split(/[, ]+/).filter(Boolean)
      : [];

    const result = await performRedditResearch({
      topic: topic.trim(),
      subreddits: subList,
      audience,
      focusKeywords,
    });

    return NextResponse.json({
      success: true,
      redditResearch: result,
    });
  } catch (error: unknown) {
    console.error("Reddit research route error:", error);
    const msg = error instanceof Error ? error.message : "Failed to perform Reddit research.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
