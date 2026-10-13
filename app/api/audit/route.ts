import { NextRequest, NextResponse } from "next/server";
import { auditMediumArticlePolicy } from "@/lib/medium-policy-auditor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic = "",
      selectedTitle = "",
      selectedSubtitle = "",
      contentMarkdown = "",
      tags = [],
      sources = [],
      factCheck = [],
      aiDisclosure = "",
      titleOptions = [],
    } = body;

    if (!contentMarkdown || typeof contentMarkdown !== "string") {
      return NextResponse.json(
        { success: false, error: "Content markdown is required for policy audit." },
        { status: 400 }
      );
    }

    const auditResult = auditMediumArticlePolicy({
      topic,
      selectedTitle: selectedTitle || topic || "Article Draft",
      selectedSubtitle: selectedSubtitle || "",
      contentMarkdown,
      tags: Array.isArray(tags) ? tags : [],
      sources: Array.isArray(sources) ? sources : [],
      factCheck: Array.isArray(factCheck) ? factCheck : [],
      aiDisclosure: aiDisclosure || "",
      titleOptions: Array.isArray(titleOptions) ? titleOptions : [],
    });

    return NextResponse.json({
      success: true,
      policyAudit: auditResult,
    });
  } catch (error: unknown) {
    console.error("Policy audit error:", error);
    const msg = error instanceof Error ? error.message : "Failed to audit article policy.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
