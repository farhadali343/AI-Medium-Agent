import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  applyEditorialRevision,
  createVersionSnapshot,
  performEditorialQualityReview,
  EDITORIAL_CRITERIA_CONFIG,
} from "@/lib/editorial-reviewer";
import {
  ArticleDraft,
  ArticleVersionItem,
  EditorialCriterion,
  EditorialReviewEngineReport,
  EditorialSuggestionItem,
  EditorialToneStyle,
  FactCheckItem,
  SourceItem,
} from "@/types/article";

async function runGeminiEditorialReview(params: {
  contentMarkdown: string;
  selectedTitle: string;
  selectedSubtitle: string;
  tone: EditorialToneStyle;
  userSuppliedExperiences: string;
  sources: SourceItem[];
  factCheck: FactCheckItem[];
}): Promise<EditorialReviewEngineReport | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are a master professional magazine editor and writing craft director (e.g. for Medium Boost curators, The Atlantic, Wired).
Your task is to conduct an uncompromising, professional WRITING-QUALITY review of this article draft.

CRITICAL BOUNDARIES:
- This is a substantive writing craft review, NOT an AI detector or an AI-detection evasion tool.
- NEVER claim to detect AI authorship or calculate arbitrary "humanization percentage" or AI detection scores.
- NEVER add deliberate grammatical mistakes.
- NEVER fabricate personal stories or lived experience.
- NEVER automatically insert phrases such as "I learned", "in my experience", or "I tested" without explicit evidence provided by the author below.
- NEVER rewrite solely to bypass AI detectors.
- NEVER force all articles into the same rigid structure or tone.
- NEVER replace a flagged phrase with another cliché.
- Prioritize substance, depth, and original thinking over surface fluff.

ARTICLE SPECIFICATIONS:
Title: ${params.selectedTitle}
Subtitle: ${params.selectedSubtitle}
Selected Editorial Tone: ${params.tone}
Author-Supplied Lived Experience (Strict Anti-Fabrication Safeguard): ${
      params.userSuppliedExperiences
        ? `"${params.userSuppliedExperiences}"`
        : "None provided. Do NOT invent or embellish any first-person anecdotes."
    }

EVALUATE EACH OF THE FOLLOWING 11 DIMENSIONS:
1. Specificity and depth: Concrete numbers, price floors, operational detail vs vague generalities.
2. Original analysis: Unique frameworks, contrarian observations vs generic topic summary.
3. Clarity for the intended reader: B1-B2 plain English rhythm, jargon explained, crisp pacing.
4. Natural sentence and paragraph variation: Cadence mixing punchy short lines with development, generous whitespace.
5. Repetition and unnecessary filler: Throat-clearing padding ("in today's world", "it is important to remember"), tautologies.
6. Evidence quality and correct attribution: Specific primary datasets, named studies, dates vs lazy "studies show".
7. Practical usefulness: Actionable blueprints, decision criteria, survival checklists.
8. Logical flow and transitions: Seamless bridging between sections, narrative progression.
9. Balance, nuance, and honest limitations: Candid risks, failure modes, who should skip this approach.
10. Title accuracy and opening strength: Title honesty, opening drops straight into friction without preamble.
11. Conclusion value-add: Forward-looking perspective and next steps rather than a regurgitated summary.

For each issue in suggestions:
- targetPassage MUST be an exact verbatim sentence or short paragraph currently in the article markdown.
- problemExplanation: Clear diagnosis explaining the writing flaw.
- suggestedImprovement: A concrete, actionable rewrite that directly solves the flaw in the selected tone.

FINAL EDITORIAL REPORT:
Identify the THREE most important improvements remaining (topThreePriorities, ranked 1 to 3), detailing area, diagnosis, recommendedAction, and editorialImpact.

FULL ARTICLE MARKDOWN:
${params.contentMarkdown}

OUTPUT FORMAT: Return strictly valid JSON:
{
  "overallEditorialAssessment": "string",
  "scorecard": {
    "specificity_depth": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "original_analysis": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "clarity_readability": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "sentence_paragraph_variation": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "repetition_filler": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "evidence_attribution": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "practical_usefulness": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "logical_flow_transitions": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "balance_nuance_limitations": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "title_opening_strength": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" },
    "conclusion_value_add": { "rating": "strong" | "adequate" | "needs_work", "feedback": "string" }
  },
  "topThreePriorities": [
    {
      "rank": 1,
      "area": "string",
      "diagnosis": "string",
      "recommendedAction": "string",
      "editorialImpact": "string"
    },
    {
      "rank": 2,
      "area": "string",
      "diagnosis": "string",
      "recommendedAction": "string",
      "editorialImpact": "string"
    },
    {
      "rank": 3,
      "area": "string",
      "diagnosis": "string",
      "recommendedAction": "string",
      "editorialImpact": "string"
    }
  ],
  "suggestions": [
    {
      "criterion": "specificity_depth",
      "severity": "high" | "medium" | "low",
      "targetPassage": "exact sentence or paragraph present in the article markdown",
      "problemExplanation": "string",
      "suggestedImprovement": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.25,
      },
    });

    if (!response.text) return null;
    const parsed = JSON.parse(response.text);

    // Validate that suggestions actually exist in markdown so one-click replacement works
    const validatedSuggestions: EditorialSuggestionItem[] = [];
    const rawSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

    rawSuggestions.forEach((s: any, idx: number) => {
      const target = (s.targetPassage || "").trim();
      if (!target) return;

      let matchedPassage = target;
      if (!params.contentMarkdown.includes(target)) {
        const lines = params.contentMarkdown.split("\n").map((l) => l.trim()).filter(Boolean);
        const found = lines.find((l) => l.includes(target) || target.includes(l));
        if (found && found.length > 15) {
          matchedPassage = found;
        } else {
          return; // Skip hallucinated passages
        }
      }

      const critKey = (s.criterion as EditorialCriterion) || "clarity_readability";
      const config = EDITORIAL_CRITERIA_CONFIG[critKey] || { label: "Clarity & Readability" };

      validatedSuggestions.push({
        id: `sug-ai-${idx + 1}-${Date.now()}`,
        criterion: critKey,
        criterionLabel: config.label,
        severity: s.severity === "high" || s.severity === "medium" || s.severity === "low" ? s.severity : "medium",
        targetPassage: matchedPassage,
        problemExplanation: s.problemExplanation || "Writing craft improvement identified.",
        suggestedImprovement: s.suggestedImprovement || matchedPassage,
        status: "pending",
      });
    });

    const baseline = performEditorialQualityReview({
      contentMarkdown: params.contentMarkdown,
      selectedTitle: params.selectedTitle,
      selectedSubtitle: params.selectedSubtitle,
      tone: params.tone,
      userSuppliedExperiences: params.userSuppliedExperiences,
      sources: params.sources,
      factCheck: params.factCheck,
      reviewedAt: new Date().toISOString(),
    });

    const finalSuggestions =
      validatedSuggestions.length >= 2
        ? validatedSuggestions
        : [...validatedSuggestions, ...baseline.suggestions];

    return {
      reviewedAt: new Date().toISOString(),
      toneSelected: params.tone,
      overallEditorialAssessment: parsed.overallEditorialAssessment || baseline.overallEditorialAssessment,
      scorecard: {
        ...baseline.scorecard,
        ...(parsed.scorecard || {}),
      },
      topThreePriorities:
        Array.isArray(parsed.topThreePriorities) && parsed.topThreePriorities.length === 3
          ? parsed.topThreePriorities
          : baseline.topThreePriorities,
      suggestions: finalSuggestions,
      userSuppliedExperiences: params.userSuppliedExperiences,
    };
  } catch (err) {
    console.warn("Gemini editorial review fallback triggered:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "run_review",
      contentMarkdown = "",
      selectedTitle = "",
      selectedSubtitle = "",
      tone = "conversational_practical",
      userSuppliedExperiences = "",
      suggestionId,
      targetPassage,
      replacementText,
      versionIdToRestore,
      versionHistory = [],
      draft,
    } = body;

    // Action 1: Accept an individual suggestion and save version history
    if (action === "accept_suggestion" && targetPassage && replacementText) {
      const currentMarkdown = draft?.contentMarkdown || contentMarkdown;
      const revision = applyEditorialRevision(currentMarkdown, targetPassage, replacementText);

      if (!revision.success) {
        return NextResponse.json(
          { success: false, error: revision.changeSummary },
          { status: 400 }
        );
      }

      const versionIndex = versionHistory.length + 1;
      const previousVersionSnapshot: ArticleVersionItem = {
        versionId: `ver_prev_${versionIndex}`,
        timestamp: new Date().toISOString(),
        label: `Snapshot before edit`,
        contentMarkdown: currentMarkdown,
        selectedTitle: draft?.selectedTitle || selectedTitle,
        selectedSubtitle: draft?.selectedSubtitle || selectedSubtitle,
        changeSummary: `Preserved before applying: "${targetPassage.slice(0, 30)}..."`,
        wordCount: currentMarkdown.split(/\s+/).filter(Boolean).length,
      };

      const newVersionSnapshot: ArticleVersionItem = {
        versionId: `ver_edit_${versionIndex + 1}`,
        timestamp: new Date().toISOString(),
        label: `Applied Editorial Edit`,
        contentMarkdown: revision.updatedMarkdown,
        selectedTitle: draft?.selectedTitle || selectedTitle,
        selectedSubtitle: draft?.selectedSubtitle || selectedSubtitle,
        changeSummary: revision.changeSummary,
        wordCount: revision.updatedMarkdown.split(/\s+/).filter(Boolean).length,
      };

      const updatedHistory: ArticleVersionItem[] = [
        ...versionHistory,
        previousVersionSnapshot,
        newVersionSnapshot,
      ];

      return NextResponse.json({
        success: true,
        updatedMarkdown: revision.updatedMarkdown,
        appliedSuggestionId: suggestionId,
        newVersion: newVersionSnapshot,
        versionHistory: updatedHistory,
      });
    }

    // Action 2: Revert to a previous version from versionHistory
    if (action === "revert_version" && versionIdToRestore) {
      const targetVersion = (versionHistory as ArticleVersionItem[]).find(
        (v) => v.versionId === versionIdToRestore
      );

      if (!targetVersion) {
        return NextResponse.json(
          { success: false, error: "Requested version not found in history." },
          { status: 404 }
        );
      }

      const versionIndex = versionHistory.length + 1;
      const reversionSnapshot: ArticleVersionItem = {
        versionId: `ver_rollback_${versionIndex}`,
        timestamp: new Date().toISOString(),
        label: `Restored: ${targetVersion.label}`,
        contentMarkdown: targetVersion.contentMarkdown,
        selectedTitle: targetVersion.selectedTitle,
        selectedSubtitle: targetVersion.selectedSubtitle,
        changeSummary: `Restored content from ${new Date(targetVersion.timestamp).toLocaleTimeString()}`,
        wordCount: targetVersion.wordCount,
      };

      return NextResponse.json({
        success: true,
        restoredMarkdown: targetVersion.contentMarkdown,
        restoredTitle: targetVersion.selectedTitle,
        restoredSubtitle: targetVersion.selectedSubtitle,
        newVersion: reversionSnapshot,
        versionHistory: [...versionHistory, reversionSnapshot],
      });
    }

    // Action 3: Run comprehensive editorial review (Gemini AI with deterministic fallback)
    const effectiveMarkdown = draft?.contentMarkdown || contentMarkdown;
    const effectiveTitle = draft?.selectedTitle || selectedTitle;
    const effectiveSubtitle = draft?.selectedSubtitle || selectedSubtitle;
    const effectiveTone = (tone as EditorialToneStyle) || "conversational_practical";

    let report: EditorialReviewEngineReport | null = null;

    if (process.env.GEMINI_API_KEY) {
      report = await runGeminiEditorialReview({
        contentMarkdown: effectiveMarkdown,
        selectedTitle: effectiveTitle,
        selectedSubtitle: effectiveSubtitle,
        tone: effectiveTone,
        userSuppliedExperiences: userSuppliedExperiences || "",
        sources: draft?.sources || [],
        factCheck: draft?.factCheck || [],
      });
    }

    if (!report) {
      report = performEditorialQualityReview({
        contentMarkdown: effectiveMarkdown,
        selectedTitle: effectiveTitle,
        selectedSubtitle: effectiveSubtitle,
        tone: effectiveTone,
        userSuppliedExperiences,
        sources: draft?.sources || [],
        factCheck: draft?.factCheck || [],
        reviewedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: unknown) {
    console.error("Editorial review engine error:", error);
    const msg = error instanceof Error ? error.message : "Failed to run editorial review.";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
