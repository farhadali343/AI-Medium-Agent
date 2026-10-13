"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  History,
  Check,
  RotateCcw,
  BookOpen,
  Eye,
  User,
  Sliders,
  Scale,
  ShieldCheck,
  X,
  Columns,
  ArrowLeftRight,
} from "lucide-react";
import {
  ArticleDraft,
  ArticleVersionItem,
  EditorialCriterion,
  EditorialReviewEngineReport,
  EditorialSuggestionItem,
  EditorialToneStyle,
} from "@/types/article";
import {
  EDITORIAL_CRITERIA_CONFIG,
  applyEditorialRevision,
  performEditorialQualityReview,
} from "@/lib/editorial-reviewer";

interface TabEditorialReviewProps {
  draft: ArticleDraft;
  onUpdateDraft?: (updated: ArticleDraft) => void;
}

export function TabEditorialReview({ draft, onUpdateDraft }: TabEditorialReviewProps) {
  const [selectedTone, setSelectedTone] = useState<EditorialToneStyle>(
    (draft.editorialReviewReport?.toneSelected as EditorialToneStyle) || "conversational_practical"
  );
  const [userExperienceNotes, setUserExperienceNotes] = useState(
    draft.editorialReviewReport?.userSuppliedExperiences || ""
  );
  const [isReviewing, setIsReviewing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted">("all");
  const [activeDiffVersionId, setActiveDiffVersionId] = useState<string | null>(null);
  const [showExperienceBox, setShowExperienceBox] = useState(selectedTone === "first_person_essay");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [confirmingRevertId, setConfirmingRevertId] = useState<string | null>(null);
  const [comparingVersion, setComparingVersion] = useState<ArticleVersionItem | null>(null);

  const report: EditorialReviewEngineReport = useMemo(() => {
    if (draft.editorialReviewReport) {
      return draft.editorialReviewReport;
    }
    return performEditorialQualityReview({
      contentMarkdown: draft.contentMarkdown,
      selectedTitle: draft.selectedTitle,
      selectedSubtitle: draft.selectedSubtitle,
      tone: selectedTone,
      userSuppliedExperiences: userExperienceNotes,
      sources: draft.sources,
      factCheck: draft.factCheck,
      reviewedAt: draft.createdAt || "2026-10-12T00:00:00.000Z",
    });
  }, [
    draft.editorialReviewReport,
    draft.contentMarkdown,
    draft.selectedTitle,
    draft.selectedSubtitle,
    selectedTone,
    userExperienceNotes,
    draft.sources,
    draft.factCheck,
    draft.createdAt,
  ]);

  const versionHistory: ArticleVersionItem[] = draft.versionHistory || [
    {
      versionId: "ver_initial",
      timestamp: draft.createdAt,
      label: "Original Generated Draft",
      contentMarkdown: draft.originalContentMarkdown || draft.contentMarkdown,
      selectedTitle: draft.selectedTitle,
      selectedSubtitle: draft.selectedSubtitle,
      changeSummary: "Initial research-backed generation snapshot.",
      wordCount: draft.wordCount,
    },
  ];

  const suggestions = report.suggestions || [];
  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const acceptedSuggestions = suggestions.filter((s) => s.status === "accepted");

  const displayedSuggestions = suggestions.filter((s) => {
    if (filterStatus === "pending") return s.status === "pending";
    if (filterStatus === "accepted") return s.status === "accepted";
    return true;
  });

  const handleRunReview = async () => {
    setIsReviewing(true);
    setActionNotice(null);
    try {
      const res = await fetch("/api/editorial-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_review",
          contentMarkdown: draft.contentMarkdown,
          selectedTitle: draft.selectedTitle,
          selectedSubtitle: draft.selectedSubtitle,
          tone: selectedTone,
          userSuppliedExperiences: userExperienceNotes,
          draft,
        }),
      });
      const data = await res.json();
      if (data.success && data.report && onUpdateDraft) {
        onUpdateDraft({
          ...draft,
          editorialReviewReport: data.report,
          originalContentMarkdown: draft.originalContentMarkdown || draft.contentMarkdown,
        });
      }
    } catch (err) {
      console.error("Editorial review failed:", err);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: EditorialSuggestionItem) => {
    if (!onUpdateDraft) return;

    const revision = applyEditorialRevision(
      draft.contentMarkdown,
      suggestion.targetPassage,
      suggestion.suggestedImprovement
    );

    if (!revision.success) {
      setActionNotice("Notice: Target passage could not be automatically replaced. You can edit the text directly in the Full Article tab.");
      return;
    }

    const versionIndex = versionHistory.length + 1;
    const newVersion: ArticleVersionItem = {
      versionId: `ver_edit_${versionIndex}_${suggestion.id}`,
      timestamp: draft.updatedAt || draft.createdAt || "2026-10-12T01:00:00.000Z",
      label: `Accepted Edit: ${suggestion.criterionLabel}`,
      contentMarkdown: revision.updatedMarkdown,
      selectedTitle: draft.selectedTitle,
      selectedSubtitle: draft.selectedSubtitle,
      changeSummary: `Applied edit for ${suggestion.criterionLabel}`,
      wordCount: revision.updatedMarkdown.split(/\s+/).filter(Boolean).length,
    };

    const updatedSuggestions = suggestions.map((s) =>
      s.id === suggestion.id
        ? {
            ...s,
            status: "accepted" as const,
            acceptedAt: draft.updatedAt || draft.createdAt || "2026-10-12T01:00:00.000Z",
            appliedContentDiff: {
              originalText: suggestion.targetPassage,
              newText: suggestion.suggestedImprovement,
            },
          }
        : s
    );

    const updatedReport: EditorialReviewEngineReport = {
      ...report,
      suggestions: updatedSuggestions,
    };

    setActionNotice(`Applied edit for "${suggestion.criterionLabel}". Saved new snapshot to version history.`);

    onUpdateDraft({
      ...draft,
      contentMarkdown: revision.updatedMarkdown,
      wordCount: newVersion.wordCount,
      editorialReviewReport: updatedReport,
      versionHistory: [...versionHistory, newVersion],
      originalContentMarkdown: draft.originalContentMarkdown || draft.contentMarkdown,
    });
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    if (!onUpdateDraft) return;
    const updatedSuggestions = suggestions.map((s) =>
      s.id === suggestionId ? { ...s, status: "dismissed" as const } : s
    );
    onUpdateDraft({
      ...draft,
      editorialReviewReport: { ...report, suggestions: updatedSuggestions },
    });
  };

  const handleExecuteRevert = (version: ArticleVersionItem) => {
    if (!onUpdateDraft) return;
    const versionIndex = versionHistory.length + 1;
    const rollbackVersion: ArticleVersionItem = {
      versionId: `ver_rollback_${versionIndex}`,
      timestamp: draft.updatedAt || draft.createdAt || "2026-10-12T01:00:00.000Z",
      label: `Restored to ${version.label}`,
      contentMarkdown: version.contentMarkdown,
      selectedTitle: version.selectedTitle,
      selectedSubtitle: version.selectedSubtitle,
      changeSummary: `Rollback to snapshot ${version.versionId}`,
      wordCount: version.wordCount,
    };

    setConfirmingRevertId(null);
    setActionNotice(`Successfully restored draft content to snapshot: "${version.label}".`);

    onUpdateDraft({
      ...draft,
      contentMarkdown: version.contentMarkdown,
      wordCount: version.wordCount,
      versionHistory: [...versionHistory, rollbackVersion],
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Review Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#426B5A]" />
            <h3 className="text-lg font-semibold text-[#20252D]">
              Professional Editorial Review Engine
            </h3>
          </div>
          <p className="text-xs text-[#687180] mt-0.5">
            Writing-quality critique assessing depth, sentence cadence, attribution rigor, and practical value without artificial AI-bypass gimmicks.
          </p>
        </div>

        <button
          onClick={handleRunReview}
          disabled={isReviewing}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#426B5A] hover:bg-[#345545] text-white font-medium rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReviewing ? "animate-spin" : ""}`} />
          <span>{isReviewing ? "Evaluating Craft..." : "Run Editorial Review"}</span>
        </button>
      </div>

      {/* Tone Selection & Author Experience Calibration */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-semibold text-[#20252D] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#426B5A]" />
            <span>Select Editorial Tone & Voice Model</span>
          </div>
          <span className="text-[11px] text-[#89919E]">
            Calibrates critique standards to your intended publication style
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {[
            {
              id: "conversational_practical",
              label: "Conversational & Practical",
              desc: "Unvarnished peer-to-peer advice; punchy cadence, zero corporate jargon.",
            },
            {
              id: "analytical",
              label: "Analytical & Investigative",
              desc: "Rigorous thesis breakdown with hypothesis testing and statistical bounds.",
            },
            {
              id: "first_person_essay",
              label: "First-Person Essay",
              desc: "Personal narrative grounded strictly in author-supplied experiences.",
            },
            {
              id: "technical_explainer",
              label: "Technical Explainer",
              desc: "Precise architectural mechanisms, APIs, and operational blueprints.",
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTone(t.id as EditorialToneStyle);
                setShowExperienceBox(t.id === "first_person_essay");
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                selectedTone === t.id
                  ? "bg-[#EAF2ED]/60 border-[#426B5A] text-[#20252D]"
                  : "bg-white border-[#E6E9ED] text-[#687180] hover:text-[#20252D] hover:border-[#D1D6DE]"
              }`}
            >
              <div className="font-semibold text-xs flex items-center justify-between text-[#20252D]">
                <span>{t.label}</span>
                {selectedTone === t.id && <Check className="w-3.5 h-3.5 text-[#426B5A]" />}
              </div>
              <p className="text-[11px] text-[#687180] leading-snug">{t.desc}</p>
            </button>
          ))}
        </div>

        {/* User-Supplied Experiences Box (Strict Anti-Fabrication Safeguard) */}
        {showExperienceBox && (
          <div className="bg-[#FAFBFC] p-4 rounded-xl border border-[#E6E9ED] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#20252D] font-semibold">
              <span className="flex items-center gap-1.5 text-[#B47D18]">
                <User className="w-3.5 h-3.5" />
                <span>Author Lived Experiences & Case Studies (Anti-Fabrication Guard)</span>
              </span>
              <span className="text-[10px] text-[#89919E]">Strictly no fabricated personal anecdotes</span>
            </div>
            <p className="text-[11px] text-[#687180] leading-relaxed">
              To prevent artificial autobiographical hallucinations, the engine will only incorporate personal narratives based directly on what you share below:
            </p>
            <textarea
              value={userExperienceNotes}
              onChange={(e) => setUserExperienceNotes(e.target.value)}
              placeholder="e.g., 'I tested cold outreach across 35 B2B agency leads; our open rate was 44% but response was 4% until we personalized the first two sentences.'"
              rows={3}
              className="w-full bg-white border border-[#E6E9ED] rounded-lg p-2.5 text-xs text-[#20252D] placeholder-[#89919E] focus:outline-none focus:border-[#426B5A]"
            />
          </div>
        )}
      </div>

      {/* FINAL EDITORIAL REPORT: TOP THREE MOST IMPORTANT IMPROVEMENTS REMAINING */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E9ED] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#426B5A]" />
            <div>
              <h4 className="text-sm font-semibold text-[#20252D] uppercase tracking-wider font-mono">
                Final Editorial Report — Top 3 Remaining Priorities
              </h4>
              <p className="text-xs text-[#687180]">
                Identifies the highest-leverage substantive revisions to elevate the article to publication grade.
              </p>
            </div>
          </div>
          <div className="text-[10px] text-[#426B5A] bg-[#EAF2ED] border border-[#C8DCD1] px-2.5 py-1 rounded-full font-medium self-start sm:self-auto">
            Substance &gt; Arbitrary AI Percentages
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {report.topThreePriorities.map((item) => (
            <div
              key={item.rank}
              className="bg-[#FAFBFC] p-4 rounded-xl border border-[#E6E9ED] space-y-2.5 flex flex-col justify-between hover:border-[#D1D6DE] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2ED] text-[#426B5A] border border-[#C8DCD1]">
                    PRIORITY #{item.rank}
                  </span>
                  <span className="text-[10px] text-[#89919E] uppercase font-mono">Highest Leverage</span>
                </div>

                <div className="font-semibold text-[#20252D] text-xs leading-snug">
                  {item.area}
                </div>

                <div className="space-y-1 text-[#4F5866] text-[11px] leading-relaxed">
                  <div>
                    <strong className="text-[#B47D18]">Editorial Diagnosis:</strong> {item.diagnosis}
                  </div>
                  <div>
                    <strong className="text-[#2E7D5B]">Action:</strong> {item.recommendedAction}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-[#89919E] border-t border-[#E6E9ED] pt-2 font-mono">
                Impact: {item.editorialImpact}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#FAFBFC] p-3 rounded-xl border border-[#E6E9ED] text-xs text-[#687180] flex items-start gap-2">
          <Scale className="w-4 h-4 text-[#426B5A] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-[#20252D]">Writing-Quality Philosophy:</strong> {report.overallEditorialAssessment}
          </p>
        </div>
      </div>

      {/* 11-DIMENSION QUALITY SCORECARD */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#426B5A]" />
            <h4 className="text-xs font-semibold text-[#20252D] uppercase tracking-wider font-mono">
              11-Dimension Writing Quality Scorecard
            </h4>
          </div>
          <span className="text-[10px] text-[#89919E]">Evaluated across all criteria</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {Object.entries(EDITORIAL_CRITERIA_CONFIG).map(([key, config]) => {
            const evalItem = report.scorecard[key as EditorialCriterion];
            const rating = evalItem?.rating || "strong";

            return (
              <div
                key={key}
                className="bg-[#FAFBFC] p-3 rounded-xl border border-[#E6E9ED] space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-[#20252D] text-xs truncate">
                      {config.label}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase font-mono ${
                        rating === "strong"
                          ? "bg-[#EAF2ED] text-[#2E7D5B] border border-[#C8DCD1]"
                          : rating === "adequate"
                          ? "bg-[#EDF2F4] text-[#4A6572] border border-[#D1D6DE]"
                          : "bg-[#FEF7E8] text-[#B47D18] border border-[#FFE0B2]"
                      }`}
                    >
                      {rating.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#687180] leading-snug pt-1">
                    {evalItem?.feedback || config.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE SUGGESTED EDITS QUEUE */}
      <div className="space-y-3.5">
        {actionNotice && (
          <div className="bg-[#EAF2ED] border border-[#C8DCD1] rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-[#2E7D5B] shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-[#687180] hover:text-[#20252D] cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6E9ED] pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#426B5A]" />
            <h4 className="text-sm font-semibold text-[#20252D]">
              Granular Suggested Edits ({suggestions.length})
            </h4>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                filterStatus === "all" ? "bg-white text-[#20252D] font-semibold shadow-xs border border-[#E6E9ED]" : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              All ({suggestions.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                filterStatus === "pending" ? "bg-[#FEF7E8] text-[#B47D18] font-semibold border border-[#FFE0B2]" : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              Pending ({pendingSuggestions.length})
            </button>
            <button
              onClick={() => setFilterStatus("accepted")}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                filterStatus === "accepted" ? "bg-[#EAF2ED] text-[#2E7D5B] font-semibold border border-[#C8DCD1]" : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              Accepted ({acceptedSuggestions.length})
            </button>
          </div>
        </div>

        {displayedSuggestions.length === 0 ? (
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-6 text-center text-xs text-[#687180] space-y-1 shadow-2xs">
            <CheckCircle2 className="w-6 h-6 text-[#2E7D5B] mx-auto mb-2" />
            <div className="font-semibold text-[#20252D]">No suggestions in this filter view</div>
            <p>All identified writing quality adjustments have been reviewed or none were found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedSuggestions.map((item) => {
              const isAccepted = item.status === "accepted";
              const isDismissed = item.status === "dismissed";

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4 sm:p-5 space-y-3 transition-colors shadow-2xs ${
                    isAccepted
                      ? "border-[#C8DCD1] bg-[#FAFCFB]"
                      : isDismissed
                      ? "border-[#E6E9ED] opacity-60"
                      : "border-[#E6E9ED] hover:border-[#D1D6DE]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono bg-[#F0F3F5] text-[#20252D]">
                        {item.criterionLabel}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-md uppercase ${
                          item.severity === "high"
                            ? "bg-[#FDF2F2] text-[#C53929] border border-[#F5C2C2]"
                            : "bg-[#FEF7E8] text-[#B47D18] border border-[#FFE0B2]"
                        }`}
                      >
                        {item.severity} Impact
                      </span>
                      {isAccepted && (
                        <span className="text-[10px] font-medium text-[#2E7D5B] bg-[#EAF2ED] border border-[#C8DCD1] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Applied to Article</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {!isAccepted && !isDismissed && (
                        <>
                          <button
                            onClick={() => handleDismissSuggestion(item.id)}
                            className="px-2.5 py-1 text-[#687180] hover:text-[#20252D] bg-[#FAFBFC] hover:bg-[#F0F3F5] border border-[#E6E9ED] rounded-lg text-xs cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleAcceptSuggestion(item)}
                            className="px-3 py-1 bg-[#426B5A] hover:bg-[#345545] text-white font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Accept Edit</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Target Passage */}
                  <div className="bg-[#FAFBFC] p-3 rounded-xl border border-[#E6E9ED] space-y-1 text-xs">
                    <div className="text-[10px] uppercase font-mono text-[#89919E]">
                      Target Passage in Article:
                    </div>
                    <p className="text-[#333C48] font-mono italic leading-relaxed text-[11px]">
                      &ldquo;{item.targetPassage}&rdquo;
                    </p>
                  </div>

                  {/* Diagnosis & Suggested Rewrite */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FEF7E8]/50 p-3 rounded-xl border border-[#FFE0B2] space-y-1">
                      <div className="font-semibold text-[#825405]">Writing Issue / Diagnosis:</div>
                      <p className="text-[#687180] leading-relaxed text-[11px]">
                        {item.problemExplanation}
                      </p>
                    </div>

                    <div className="bg-[#EAF2ED]/50 p-3 rounded-xl border border-[#C8DCD1] space-y-1">
                      <div className="font-semibold text-[#2E7D5B]">Concrete Proposed Improvement:</div>
                      <p className="text-[#20252D] leading-relaxed text-[11px] font-mono">
                        {item.suggestedImprovement}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VERSION HISTORY & DIFF TRACKER */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#426B5A]" />
            <h4 className="text-xs font-semibold text-[#20252D] uppercase tracking-wider font-mono">
              Draft Version History & Reversion Snapshots ({versionHistory.length})
            </h4>
          </div>
          <span className="text-[10px] text-[#89919E]">Original draft is permanently preserved</span>
        </div>

        <div className="space-y-2.5">
          {versionHistory.map((ver, idx) => {
            const isLatest = idx === versionHistory.length - 1;
            const isDiffOpen = activeDiffVersionId === ver.versionId;

            return (
              <div
                key={ver.versionId}
                className="bg-[#FAFBFC] p-3.5 rounded-xl border border-[#E6E9ED] space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#20252D]">{ver.label}</span>
                      {isLatest && (
                        <span className="text-[9px] px-2 py-0.2 rounded-full bg-[#EAF2ED] text-[#2E7D5B] border border-[#C8DCD1] font-mono font-medium">
                          CURRENT ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#89919E] flex items-center gap-2 font-mono">
                      <span>{new Date(ver.timestamp).toLocaleString()}</span>
                      <span>·</span>
                      <span>{ver.wordCount} words</span>
                      <span>·</span>
                      <span>{ver.changeSummary}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveDiffVersionId(isDiffOpen ? null : ver.versionId)}
                      className="px-2.5 py-1 text-[#687180] hover:text-[#20252D] bg-white border border-[#E6E9ED] rounded-lg text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isDiffOpen ? "Hide Snapshot" : "Inspect Snapshot"}</span>
                    </button>

                    {!isLatest && (
                      <button
                        onClick={() =>
                          setComparingVersion(
                            comparingVersion?.versionId === ver.versionId ? null : ver
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer flex items-center gap-1 border transition-colors ${
                          comparingVersion?.versionId === ver.versionId
                            ? "bg-[#EAF2ED] text-[#426B5A] border-[#C8DCD1] font-medium"
                            : "bg-white text-[#687180] hover:text-[#20252D] border-[#E6E9ED]"
                        }`}
                      >
                        <Columns className="w-3 h-3 text-[#426B5A]" />
                        <span>
                          {comparingVersion?.versionId === ver.versionId
                            ? "Hide Diff"
                            : "Compare with Active"}
                        </span>
                      </button>
                    )}

                    {!isLatest && (
                      confirmingRevertId === ver.versionId ? (
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-[#FFE0B2]">
                          <span className="text-[10px] text-[#B47D18]">Restore snapshot?</span>
                          <button
                            onClick={() => handleExecuteRevert(ver)}
                            className="px-2 py-0.5 bg-[#B47D18] hover:bg-[#825405] text-white font-medium rounded text-[11px] cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmingRevertId(null)}
                            className="px-1.5 py-0.5 text-[#687180] hover:text-[#20252D] text-[11px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingRevertId(ver.versionId)}
                          className="px-3 py-1 bg-white hover:bg-[#FAFBFC] text-[#20252D] border border-[#E6E9ED] rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-[#B47D18]" />
                          <span>Restore This Version</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Expanded Snapshot Viewer */}
                {isDiffOpen && (
                  <div className="pt-2 border-t border-[#E6E9ED] space-y-1">
                    <div className="text-[10px] uppercase font-mono text-[#89919E]">
                      Content Preview ({ver.label}):
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#E6E9ED] text-[11px] text-[#20252D] font-mono max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                      {ver.contentMarkdown.slice(0, 1000)}...
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dedicated Version Comparison (Side-by-Side Diff) */}
        {comparingVersion && (
          <div className="bg-[#FAFBFC] p-4 sm:p-5 rounded-xl border border-[#C8DCD1] space-y-4 animate-fade-in mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E9ED]">
              <div>
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-[#426B5A]" />
                  <h4 className="text-sm font-bold text-[#20252D]">
                    Version Comparison: <span className="text-[#426B5A]">{comparingVersion.label}</span> vs Current Active Draft
                  </h4>
                </div>
                <div className="text-[11px] text-[#687180] mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                  <span>Snapshot: {new Date(comparingVersion.timestamp).toLocaleTimeString()} ({comparingVersion.wordCount} words)</span>
                  <span>·</span>
                  <span>Active: {draft.wordCount} words ({draft.wordCount - comparingVersion.wordCount >= 0 ? `+${draft.wordCount - comparingVersion.wordCount}` : `${draft.wordCount - comparingVersion.wordCount}`} words delta)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecuteRevert(comparingVersion)}
                  className="px-3 py-1.5 bg-[#B47D18] hover:bg-[#825405] text-white font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Snapshot</span>
                </button>
                <button
                  onClick={() => setComparingVersion(null)}
                  className="px-2.5 py-1.5 text-[#687180] hover:text-[#20252D] bg-white border border-[#E6E9ED] rounded-lg text-xs cursor-pointer"
                >
                  Close Diff
                </button>
              </div>
            </div>

            {/* Side-by-Side Dual Column View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left Column: Snapshot Version */}
              <div className="bg-white rounded-xl p-4 border border-[#E6E9ED] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E6E9ED] pb-2">
                  <span className="font-semibold text-[#4A6572] font-mono text-[11px]">
                    [SNAPSHOT] {comparingVersion.label}
                  </span>
                  <span className="text-[10px] text-[#89919E] font-mono">{comparingVersion.wordCount} words</span>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-[#20252D] text-sm">{comparingVersion.selectedTitle}</div>
                  <div className="text-xs text-[#687180] italic">{comparingVersion.selectedSubtitle}</div>
                </div>
                <div className="text-[#333C48] font-mono text-[11px] max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed p-2.5 bg-[#FAFBFC] rounded-lg border border-[#E6E9ED]">
                  {comparingVersion.contentMarkdown}
                </div>
              </div>

              {/* Right Column: Current Active Draft */}
              <div className="bg-white rounded-xl p-4 border border-[#C8DCD1] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E6E9ED] pb-2">
                  <span className="font-semibold text-[#2E7D5B] font-mono text-[11px]">
                    [CURRENT ACTIVE] With Applied Edits
                  </span>
                  <span className="text-[10px] text-[#89919E] font-mono">{draft.wordCount} words</span>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-[#20252D] text-sm">{draft.selectedTitle}</div>
                  <div className="text-xs text-[#687180] italic">{draft.selectedSubtitle}</div>
                </div>
                <div className="text-[#333C48] font-mono text-[11px] max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed p-2.5 bg-[#FAFBFC] rounded-lg border border-[#E6E9ED]">
                  {draft.contentMarkdown}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
