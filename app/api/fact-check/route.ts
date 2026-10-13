import { NextRequest, NextResponse } from "next/server";
import { auditArticleClaims, calculateClaimVerificationSummary } from "@/lib/claim-verifier";
import { FactCheckItem, SourceItem } from "@/types/article";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      contentMarkdown = "",
      claims = [],
      sources = [],
      action,
      claimId,
      userReviewStatus,
      userEditedText,
      userReviewNote,
    } = body;

    // Action 1: Handle individual claim user review update
    if (action === "update_review" && claimId) {
      const updatedClaims: FactCheckItem[] = (claims as FactCheckItem[]).map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            userReviewStatus: userReviewStatus || "accepted",
            userEditedText: userEditedText !== undefined ? userEditedText : c.userEditedText,
            userReviewNote: userReviewNote !== undefined ? userReviewNote : c.userReviewNote,
          };
        }
        return c;
      });

      const summary = calculateClaimVerificationSummary(updatedClaims);
      return NextResponse.json({
        success: true,
        claims: updatedClaims,
        summary,
      });
    }

    // Action 2: Audit all material claims
    const { claims: auditedClaims, summary } = auditArticleClaims(
      contentMarkdown,
      claims as FactCheckItem[],
      sources as SourceItem[]
    );

    return NextResponse.json({
      success: true,
      claims: auditedClaims,
      summary,
    });
  } catch (error: unknown) {
    console.error("Fact-check claim verification error:", error);
    const msg = error instanceof Error ? error.message : "Failed to verify claims.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
