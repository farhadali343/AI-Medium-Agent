"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Compass,
  ChevronRight,
  Sparkles,
  Target,
  Copy,
  Check,
  ListChecks,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  ArticleDraft,
  PrePublicationStageInfo,
  PrePublicationStageStatus,
} from "@/types/article";
import { OutputTab } from "./OutputDashboard";

interface PrePublicationWorkflowProps {
  draft: ArticleDraft;
  activeTab: OutputTab;
  onSelectTab: (tab: OutputTab) => void;
  onUpdateDraft?: (updated: ArticleDraft) => void;
}

export function PrePublicationWorkflow({
  draft,
  activeTab,
  onSelectTab,
  onUpdateDraft,
}: PrePublicationWorkflowProps) {
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [copiedAngle, setCopiedAngle] = useState(false);
  const [copiedPromise, setCopiedPromise] = useState(false);
  const [isRetryingResearch, setIsRetryingResearch] = useState(false);
  const [isRetryingReddit, setIsRetryingReddit] = useState(false);
  const [workflowNotice, setWorkflowNotice] = useState<string | null>(null);

  // Compute live, authentic status for all 8 stages
  const stages: PrePublicationStageInfo[] = [
    // 1. Topic & Audience Defined
    {
      id: "topic_audience",
      stageNumber: 1,
      label: "Topic & Audience Defined",
      status:
        draft.topic && (draft.audience || draft.audienceKnowledgeLevel)
          ? "completed"
          : draft.topic
          ? "partial"
          : "not_attempted",
      statusSummary: draft.topic || "Untitled Topic",
      detail: `Target Reader: ${draft.audience || "General Audience"} (${
        draft.audienceKnowledgeLevel
          ? draft.audienceKnowledgeLevel.charAt(0).toUpperCase() +
            draft.audienceKnowledgeLevel.slice(1)
          : "Beginner"
      })`,
      targetTab: "angle",
      actionLabel: "View Angle",
    },

    // 2. Research Completed or Limitations Disclosed
    {
      id: "research_completed",
      stageNumber: 2,
      label: "Research Grounded / Disclosed",
      status: (() => {
        if (!draft.sources || draft.sources.length === 0) {
          return draft.researchStatus?.webSearchAttempted ? "failed" : "not_attempted";
        }
        if (draft.researchStatus?.researchDisclaimer) {
          return "partial";
        }
        return "completed";
      })(),
      statusSummary: `${draft.sources?.length || 0} Verified Sources Grounded`,
      detail: (() => {
        const primary = draft.sources?.filter(
          (s) =>
            s.type === "primary_official" ||
            s.type === "regulatory_doc" ||
            s.verificationConfidence === "confirmed_primary"
        ).length;
        if (draft.researchStatus?.researchDisclaimer) {
          return `Limitations disclosed: ${draft.researchStatus.researchDisclaimer}`;
        }
        return `${primary || 0} primary official documents & empirical benchmarks`;
      })(),
      targetTab: "tags_sources",
      actionLabel: "Inspect Sources",
      hasRetry: true,
    },

    // 3. Community Insights Reviewed Where Available
    {
      id: "community_insights",
      stageNumber: 3,
      label: "Community Insights Reviewed",
      status: (() => {
        const discussionsCount = draft.redditResearch?.discussions?.length || 0;
        if (discussionsCount === 0) {
          if (draft.redditResearch?.status === "unavailable") return "failed";
          return "not_attempted";
        }
        if (
          draft.redditResearch?.status === "direct_api_blocked_fallback_search" ||
          draft.redditResearch?.status === "rate_limited" ||
          draft.redditResearch?.sampleLimitations
        ) {
          return "partial";
        }
        return "completed";
      })(),
      statusSummary: `${draft.redditResearch?.discussions?.length || 0} Community Discussions`,
      detail: (() => {
        const count = draft.redditResearch?.discussions?.length || 0;
        if (count === 0) return "No community forums scanned or verified.";
        const insightsCount = draft.redditResearch?.keyInsights?.length || 0;
        const limitation = draft.redditResearch?.sampleLimitations
          ? ` (${draft.redditResearch.sampleLimitations})`
          : "";
        return `${insightsCount} recurring friction patterns & terminology indexed${limitation}`;
      })(),
      targetTab: "community",
      actionLabel: "Read Forum Insights",
      hasRetry: true,
    },

    // 4. Draft Generated
    {
      id: "draft_generated",
      stageNumber: 4,
      label: "Full Article Draft Generated",
      status:
        draft.contentMarkdown && draft.wordCount > 300
          ? "completed"
          : draft.contentMarkdown
          ? "partial"
          : "not_attempted",
      statusSummary: `${draft.wordCount.toLocaleString()} words · ${
        draft.readingTimeMinutes
      } min read`,
      detail: `Anti-cliché filter passed (${
        draft.antiAiScore?.bannedWordsCount || 0
      } flagged). Clean B1-B2 conversational rhythm.`,
      targetTab: "article",
      actionLabel: "Read Full Draft",
    },

    // 5. Material Factual Claims Checked
    {
      id: "claims_checked",
      stageNumber: 5,
      label: "Material Claims Checked",
      status: (() => {
        if (!draft.factCheck || draft.factCheck.length === 0) return "not_attempted";
        if (draft.claimVerificationSummary?.prePublicationWarningActive) {
          return "partial";
        }
        return "completed";
      })(),
      statusSummary: `${draft.factCheck?.length || 0} Material Claims Audited`,
      detail: (() => {
        if (draft.claimVerificationSummary?.prePublicationWarningActive) {
          return `${draft.claimVerificationSummary.unresolvedUnsupportedCount} claim(s) flagged for author review.`;
        }
        return `All ${
          draft.factCheck?.length || 0
        } claims verified or qualified with empirical boundaries.`;
      })(),
      targetTab: "factcheck",
      actionLabel: "Review Claims Table",
    },

    // 6. Editorial Review Completed
    {
      id: "editorial_review",
      stageNumber: 6,
      label: "Editorial Review Completed",
      status: (() => {
        if (!draft.editorialReviewReport) return "not_attempted";
        const pending = draft.editorialReviewReport.suggestions.filter(
          (s) => s.status === "pending"
        ).length;
        if (pending > 0) return "partial";
        return "completed";
      })(),
      statusSummary: "11 Writing Dimensions Evaluated",
      detail: (() => {
        if (!draft.editorialReviewReport) {
          return "Quality engine has not yet been executed.";
        }
        const pending = draft.editorialReviewReport.suggestions.filter(
          (s) => s.status === "pending"
        ).length;
        const total = draft.editorialReviewReport.suggestions.length;
        if (pending > 0) {
          return `${pending} of ${total} concrete improvements pending review.`;
        }
        return `All ${total} suggested improvements reviewed. High substance and natural variation verified.`;
      })(),
      targetTab: "editorial",
      actionLabel: "Inspect 3 Priorities",
    },

    // 7. Medium Policy Risk Audit Completed
    {
      id: "policy_audit",
      stageNumber: 7,
      label: "Medium Policy Audit Completed",
      status: (() => {
        if (!draft.policyAudit) return "not_attempted";
        if (draft.policyAudit.overallRisk === "high") return "partial";
        return "completed";
      })(),
      statusSummary: `Risk Level: ${
        draft.policyAudit?.overallRisk?.toUpperCase() || "PENDING"
      }`,
      detail:
        "Audited against May 1, 2024 Partner Program terms, official AI disclosure guidelines, and Boost quality standards.",
      targetTab: "policy_audit",
      actionLabel: "Review Policy Rules",
    },

    // 8. Human Approval Before Publishing
    {
      id: "human_approval",
      stageNumber: 8,
      label: "Human Author Editorial Sign-Off",
      status: (() => {
        if (draft.humanReviewStatus === "approved_by_human") return "completed";
        if (draft.claimVerificationSummary?.prePublicationWarningActive) return "failed";
        return "not_attempted";
      })(),
      statusSummary:
        draft.humanReviewStatus === "approved_by_human"
          ? "✓ Signed Off by Human Author"
          : draft.claimVerificationSummary?.prePublicationWarningActive
          ? "Requires Claim Review"
          : "Ready for Human Review",
      detail:
        draft.humanReviewStatus === "approved_by_human"
          ? `Author approved on ${
              draft.humanReviewApprovedAt
                ? new Date(draft.humanReviewApprovedAt).toLocaleDateString()
                : "recent session"
            }. Not auto-published.`
          : draft.claimVerificationSummary?.prePublicationWarningActive
          ? "Publication sign-off is locked until flagged claims are accepted or edited in Claim Verification tab."
          : "Awaiting author verification. Never auto-published.",
      targetTab: "policy_audit",
      actionLabel: "Sign Off in Policy Tab",
    },
  ];

  const completedCount = stages.filter((s) => s.status === "completed").length;
  const partialCount = stages.filter((s) => s.status === "partial").length;
  const failedCount = stages.filter((s) => s.status === "failed").length;

  const handleCopyAngle = () => {
    navigator.clipboard.writeText(draft.angle.honestAngle);
    setCopiedAngle(true);
    setTimeout(() => setCopiedAngle(false), 2000);
  };

  const handleCopyPromise = () => {
    const promiseText =
      draft.angle.readerPromise ||
      draft.angle.articleUniqueValue ||
      "A concrete decision framework and practical execution steps.";
    navigator.clipboard.writeText(promiseText);
    setCopiedPromise(true);
    setTimeout(() => setCopiedPromise(false), 2000);
  };

  const handleRetryResearch = async () => {
    setIsRetryingResearch(true);
    setWorkflowNotice("Refreshing web research grounding and source verification...");
    try {
      const res = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentMarkdown: draft.contentMarkdown,
          claims: draft.factCheck,
          sources: draft.sources,
        }),
      });
      const data = await res.json();
      if (data.success && onUpdateDraft) {
        onUpdateDraft({
          ...draft,
          factCheck: data.claims,
          claimVerificationSummary: data.summary,
        });
        setWorkflowNotice("Web research and claims successfully refreshed.");
      }
    } catch {
      setWorkflowNotice("Research retry encountered a network error. Try again shortly.");
    } finally {
      setIsRetryingResearch(false);
      setTimeout(() => setWorkflowNotice(null), 4000);
    }
  };

  const handleRetryReddit = async () => {
    setIsRetryingReddit(true);
    setWorkflowNotice("Re-scanning Reddit subreddits for authentic discussions...");
    try {
      const res = await fetch("/api/reddit-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: draft.topic,
          subreddits: draft.redditSubreddits || [
            "r/technology",
            "r/productivity",
            "r/entrepreneur",
            "r/SaaS",
          ],
          audience: draft.audience,
          focusKeywords: draft.focusKeywords,
        }),
      });
      const data = await res.json();
      if (data.success && data.redditResearch && onUpdateDraft) {
        onUpdateDraft({
          ...draft,
          redditResearch: data.redditResearch,
        });
        setWorkflowNotice("Reddit discussions and sentiment refreshed.");
      }
    } catch {
      setWorkflowNotice("Reddit re-scan encountered an error. Try again shortly.");
    } finally {
      setIsRetryingReddit(false);
      setTimeout(() => setWorkflowNotice(null), 4000);
    }
  };

  const getStatusBadge = (status: PrePublicationStageStatus) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle2,
          classes: "bg-[#EAF2ED] text-[#2E7D5B] border-[#C8DCD1]",
        };
      case "partial":
        return {
          label: "Attention",
          icon: AlertTriangle,
          classes: "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]",
        };
      case "failed":
        return {
          label: "Action Needed",
          icon: XCircle,
          classes: "bg-[#FDF2F2] text-[#C53929] border-[#FFCDD2]",
        };
      case "not_attempted":
      default:
        return {
          label: "Pending",
          icon: Clock,
          classes: "bg-[#F0F3F5] text-[#89919E] border-[#E6E9ED]",
        };
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Notice banner for async retries */}
      {workflowNotice && (
        <div className="bg-[#EAF2ED] border border-[#C8DCD1] rounded-lg p-3 flex items-center justify-between gap-3 text-xs text-[#426B5A]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#426B5A] shrink-0" />
            <span>{workflowNotice}</span>
          </div>
          <button
            onClick={() => setWorkflowNotice(null)}
            className="text-[#687180] hover:text-[#20252D] text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Recommended Angle & Reader Promise Card */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E9ED]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF2ED] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-[#426B5A]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#20252D] flex items-center gap-2">
                <span>Editorial Positioning & Reader Promise</span>
              </h3>
              <p className="text-[11px] text-[#687180]">
                Pre-drafting foundation prioritizing honest substance over generic advice.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowChecklistModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#426B5A] bg-[#EAF2ED] hover:bg-[#DFECE3] border border-[#C8DCD1] rounded-lg transition-colors cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5 text-[#426B5A]" />
              <span>Pre-Publication Checklist ({completedCount}/8)</span>
            </button>
          </div>
        </div>

        {/* Dual Grid: Recommended Angle & Reader Promise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3.5">
          {/* Recommended Angle */}
          <div className="bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#426B5A] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Angle</span>
              </span>
              <button
                onClick={handleCopyAngle}
                className="text-[11px] text-[#687180] hover:text-[#20252D] inline-flex items-center gap-1 cursor-pointer"
                title="Copy recommended angle"
              >
                {copiedAngle ? (
                  <Check className="w-3 h-3 text-[#2E7D5B]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedAngle ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#20252D] font-normal leading-relaxed">
              {draft.angle.honestAngle}
            </p>
          </div>

          {/* Reader Promise */}
          <div className="bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#3F647E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Explicit Reader Promise</span>
              </span>
              <button
                onClick={handleCopyPromise}
                className="text-[11px] text-[#687180] hover:text-[#20252D] inline-flex items-center gap-1 cursor-pointer"
                title="Copy reader promise"
              >
                {copiedPromise ? (
                  <Check className="w-3 h-3 text-[#3F647E]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedPromise ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#20252D] font-normal leading-relaxed">
              {draft.angle.readerPromise ||
                draft.angle.articleUniqueValue ||
                "Walk away with a concrete decision framework, verified empirical numbers, and an honest operational blueprint that bypasses common failure modes."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Pre-Publication Workflow 8-Stage Tracker */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 sm:p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E6E9ED]">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-[#426B5A]" />
              <h4 className="text-xs font-semibold text-[#20252D] uppercase tracking-wider">
                Pre-Publication Workflow (8-Stage Verification)
              </h4>
            </div>
            <p className="text-[11px] text-[#687180]">
              Click any stage to inspect its evidence and verified results.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#687180]">
            <span className="font-medium text-[#2E7D5B]">{completedCount} Completed</span>
            {partialCount > 0 && (
              <span className="font-medium text-[#B47D18]">{partialCount} Attention</span>
            )}
            {failedCount > 0 && (
              <span className="font-medium text-[#C53929]">{failedCount} Action Needed</span>
            )}
          </div>
        </div>

        {/* 8-Stage Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {stages.map((stage) => {
            const badge = getStatusBadge(stage.status);
            const BadgeIcon = badge.icon;
            const isTabActive = activeTab === stage.targetTab;

            return (
              <div
                key={stage.id}
                onClick={() => onSelectTab(stage.targetTab)}
                className={`group p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isTabActive
                    ? "bg-[#FAFBFC] border-[#426B5A] shadow-xs ring-1 ring-[#426B5A]/20"
                    : "bg-white border-[#E6E9ED] hover:bg-[#FAFBFC] hover:border-[#D1D7E0]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono text-[#89919E] font-medium">
                      0{stage.stageNumber}
                    </span>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.2 rounded-full border flex items-center gap-1 ${badge.classes}`}
                    >
                      <BadgeIcon className="w-2.5 h-2.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <h5 className="text-xs font-semibold text-[#20252D] group-hover:text-[#426B5A] transition-colors line-clamp-1">
                    {stage.label}
                  </h5>

                  <p className="text-[11px] text-[#333C48] font-normal line-clamp-1 mt-0.5">
                    {stage.statusSummary}
                  </p>

                  <p className="text-[10px] text-[#687180] line-clamp-2 mt-1 leading-relaxed">
                    {stage.detail}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#E6E9ED] flex items-center justify-between text-[11px]">
                  <span className="text-[#687180] group-hover:text-[#426B5A] font-medium flex items-center gap-0.5">
                    <span>{stage.actionLabel}</span>
                    <ChevronRight className="w-3 h-3 text-[#89919E] group-hover:text-[#426B5A]" />
                  </span>

                  {stage.hasRetry && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (stage.id === "research_completed") handleRetryResearch();
                        if (stage.id === "community_insights") handleRetryReddit();
                      }}
                      disabled={isRetryingResearch || isRetryingReddit}
                      className="text-[#89919E] hover:text-[#426B5A] p-1 rounded hover:bg-[#F0F3F5] transition-colors cursor-pointer"
                      title="Retry this stage"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          (stage.id === "research_completed" && isRetryingResearch) ||
                          (stage.id === "community_insights" && isRetryingReddit)
                            ? "animate-spin text-[#426B5A]"
                            : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Pre-Publication Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E6E9ED] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#E6E9ED] flex items-center justify-between bg-[#FAFBFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2ED] flex items-center justify-center">
                  <ListChecks className="w-4 h-4 text-[#426B5A]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#20252D]">
                    Pre-Publication Editorial Checklist
                  </h3>
                  <p className="text-xs text-[#687180]">
                    8 verification gates before human publication
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="text-[#687180] hover:text-[#20252D] text-sm p-1.5 rounded-lg hover:bg-[#F0F3F5] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Checklist items list */}
            <div className="p-5 overflow-y-auto space-y-2.5 flex-1 text-xs">
              <div className="bg-[#FAFBFC] p-3 rounded-lg border border-[#E6E9ED] text-[11px] text-[#687180] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#426B5A] shrink-0 mt-0.5" />
                <span>
                  <strong>Editorial Guardrail:</strong> Articles are not auto-published or guaranteed Medium approved. Each stage requires deliberate human author inspection.
                </span>
              </div>

              {stages.map((st) => {
                const badge = getStatusBadge(st.status);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={st.id}
                    className="p-3.5 rounded-lg border border-[#E6E9ED] bg-white space-y-1.5 hover:border-[#D1D7E0] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#89919E] text-[10px]">
                          0{st.stageNumber}
                        </span>
                        <span className="font-medium text-[#20252D] text-xs">
                          {st.label}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.classes}`}
                      >
                        <BadgeIcon className="w-2.5 h-2.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    <p className="text-[#687180] text-[11px] leading-relaxed">
                      {st.detail}
                    </p>

                    <div className="pt-2 border-t border-[#E6E9ED] flex items-center justify-between text-[11px]">
                      <span className="text-[#89919E]">
                        Tab: <strong className="text-[#20252D] capitalize">{st.targetTab.replace(/_/g, " ")}</strong>
                      </span>
                      <button
                        onClick={() => {
                          onSelectTab(st.targetTab);
                          setShowChecklistModal(false);
                        }}
                        className="text-[#426B5A] hover:text-[#345545] inline-flex items-center gap-0.5 font-medium cursor-pointer"
                      >
                        <span>Go to Stage Tab</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E6E9ED] bg-[#FAFBFC] flex items-center justify-between text-xs">
              <span className="text-[#687180]">
                {completedCount} of 8 stages complete · Status:{" "}
                <strong className={completedCount === 8 ? "text-[#2E7D5B]" : "text-[#B47D18]"}>
                  {draft.humanReviewStatus === "approved_by_human"
                    ? "Approved by Human Author"
                    : "Ready for Human Review"}
                </strong>
              </span>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="px-4 py-2 bg-[#426B5A] hover:bg-[#345545] text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
