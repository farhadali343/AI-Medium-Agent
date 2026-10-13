"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  AlertOctagon,
  Clock,
  Sparkles,
  RefreshCw,
  Edit3,
  Check,
  Scale,
  Calendar,
  MapPin,
  Quote,
} from "lucide-react";
import {
  ArticleDraft,
  FactCheckItem,
  ClaimVerificationSummary,
} from "@/types/article";
import { calculateClaimVerificationSummary } from "@/lib/claim-verifier";

interface TabFactCheckProps {
  draft: ArticleDraft;
  onUpdateDraft?: (updated: ArticleDraft) => void;
}

export function TabFactCheck({ draft, onUpdateDraft }: TabFactCheckProps) {
  const [viewMode, setViewMode] = useState<"top5" | "all">("top5");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRechecking, setIsRechecking] = useState(false);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const [userNote, setUserNote] = useState<string>("");

  const claims = draft.factCheck || [];
  const summary: ClaimVerificationSummary =
    draft.claimVerificationSummary || calculateClaimVerificationSummary(claims);

  // Filter claims based on top5 vs all and status filter
  const displayedClaims = claims.filter((claim, idx) => {
    if (viewMode === "top5" && idx >= 5 && !claim.isTopFivePriority) {
      return false;
    }
    if (statusFilter === "all") return true;
    if (statusFilter === "needs_attention") {
      return (
        claim.status === "contradicted" ||
        claim.status === "unverified" ||
        claim.status === "outdated" ||
        claim.status === "partially_supported"
      );
    }
    return claim.status === statusFilter;
  });

  const handleRecheckClaims = async () => {
    setIsRechecking(true);
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
      if (data.success && data.claims && onUpdateDraft) {
        onUpdateDraft({
          ...draft,
          factCheck: data.claims,
          claimVerificationSummary: data.summary,
          humanReviewStatus: data.summary.prePublicationWarningActive
            ? "requires_claim_review"
            : draft.humanReviewStatus === "requires_claim_review"
            ? "ready_for_review"
            : draft.humanReviewStatus,
        });
      }
    } catch (err) {
      console.error("Failed to recheck claims:", err);
    } finally {
      setIsRechecking(false);
    }
  };

  const handleAcceptClaim = (claimId: string) => {
    if (!onUpdateDraft) return;
    const updatedClaims = claims.map((c) =>
      c.id === claimId
        ? {
            ...c,
            userReviewStatus: "accepted" as const,
            userReviewNote: "Author reviewed evidence and confirmed scope qualification.",
          }
        : c
    );

    const newSummary = calculateClaimVerificationSummary(updatedClaims);
    onUpdateDraft({
      ...draft,
      factCheck: updatedClaims,
      claimVerificationSummary: newSummary,
      humanReviewStatus: newSummary.prePublicationWarningActive
        ? "requires_claim_review"
        : draft.humanReviewStatus === "requires_claim_review"
        ? "ready_for_review"
        : draft.humanReviewStatus,
    });
  };

  const handleApplyCorrection = (claimId: string, correctionText: string) => {
    if (!onUpdateDraft) return;
    const updatedClaims = claims.map((c) =>
      c.id === claimId
        ? {
            ...c,
            claim: correctionText,
            status: "verified" as const,
            statusExplanation: "Author accepted suggested empirical qualification.",
            userReviewStatus: "edited" as const,
          }
        : c
    );

    const targetClaim = claims.find((c) => c.id === claimId);
    let updatedMarkdown = draft.contentMarkdown;
    if (targetClaim && updatedMarkdown.includes(targetClaim.claim)) {
      updatedMarkdown = updatedMarkdown.replace(targetClaim.claim, correctionText);
    }

    const newSummary = calculateClaimVerificationSummary(updatedClaims);
    onUpdateDraft({
      ...draft,
      contentMarkdown: updatedMarkdown,
      factCheck: updatedClaims,
      claimVerificationSummary: newSummary,
      humanReviewStatus: newSummary.prePublicationWarningActive
        ? "requires_claim_review"
        : draft.humanReviewStatus === "requires_claim_review"
        ? "ready_for_review"
        : draft.humanReviewStatus,
    });
  };

  const handleStartEdit = (claim: FactCheckItem) => {
    setEditingClaimId(claim.id);
    setEditedText(claim.claim);
    setUserNote(claim.userReviewNote || "");
  };

  const handleSaveEdit = (claimId: string) => {
    if (!onUpdateDraft || !editedText.trim()) return;

    const originalClaim = claims.find((c) => c.id === claimId);
    let updatedMarkdown = draft.contentMarkdown;
    if (originalClaim && updatedMarkdown.includes(originalClaim.claim)) {
      updatedMarkdown = updatedMarkdown.replace(originalClaim.claim, editedText.trim());
    }

    const updatedClaims = claims.map((c) => {
      if (c.id === claimId) {
        return {
          ...c,
          claim: editedText.trim(),
          status: "verified" as const,
          statusExplanation: "Wording refined by author to reflect accurate scope.",
          userReviewStatus: "edited" as const,
          userReviewNote: userNote.trim() || "Author custom qualification.",
        };
      }
      return c;
    });

    const newSummary = calculateClaimVerificationSummary(updatedClaims);
    onUpdateDraft({
      ...draft,
      contentMarkdown: updatedMarkdown,
      factCheck: updatedClaims,
      claimVerificationSummary: newSummary,
      humanReviewStatus: newSummary.prePublicationWarningActive
        ? "requires_claim_review"
        : draft.humanReviewStatus === "requires_claim_review"
        ? "ready_for_review"
        : draft.humanReviewStatus,
    });
    setEditingClaimId(null);
  };

  const getStatusBadge = (status: FactCheckItem["status"]) => {
    switch (status) {
      case "verified":
      case "verified_primary":
      case "policy_safe":
        return {
          label: "Verified",
          description: "Direct evidence supports specific claim",
          classes: "bg-[#EAF2ED] text-[#2E7D5B] border-[#C8DCD1]",
          icon: CheckCircle2,
        };
      case "partially_supported":
      case "qualified_estimate":
      case "empirical_range":
        return {
          label: "Partially Supported",
          description: "Evidence supports only part of wording",
          classes: "bg-[#EDF2F4] text-[#4A6572] border-[#D1D6DE]",
          icon: HelpCircle,
        };
      case "contradicted":
        return {
          label: "Contradicted",
          description: "Reliable evidence conflicts with claim",
          classes: "bg-[#FDF2F2] text-[#C53929] border-[#F5C2C2]",
          icon: AlertOctagon,
        };
      case "unverified":
      case "requires_human_review":
        return {
          label: "Unverified",
          description: "Adequate evidence was not found",
          classes: "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]",
          icon: AlertTriangle,
        };
      case "outdated":
        return {
          label: "Outdated",
          description: "Previously valid information no longer applies",
          classes: "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]",
          icon: Clock,
        };
      case "opinion_recommendation":
        return {
          label: "Opinion / Recommendation",
          description: "Not a factual claim requiring proof",
          classes: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
          icon: Quote,
        };
      default:
        return {
          label: "Verified",
          description: "Direct evidence supports claim",
          classes: "bg-[#EAF2ED] text-[#2E7D5B] border-[#C8DCD1]",
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Recheck Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#426B5A]" />
            <h3 className="text-lg font-semibold text-[#20252D]">
              Claim-Level Verification System
            </h3>
          </div>
          <p className="text-xs text-[#687180] mt-0.5">
            Extracts every material statistic, date, policy rule, quote, and recommendation to verify exact source passages.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Top 5 vs All View Toggle */}
          <div className="flex items-center bg-[#F0F3F5] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode("top5")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer font-medium ${
                viewMode === "top5"
                  ? "bg-white text-[#20252D] shadow-xs font-semibold"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              Top 5 Material Claims
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer font-medium ${
                viewMode === "all"
                  ? "bg-white text-[#20252D] shadow-xs font-semibold"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              All Claims ({claims.length})
            </button>
          </div>

          <button
            onClick={handleRecheckClaims}
            disabled={isRechecking}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED] rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Re-audit claims against verified source passages"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#426B5A] ${isRechecking ? "animate-spin" : ""}`} />
            <span>{isRechecking ? "Verifying..." : "Re-audit Claims"}</span>
          </button>
        </div>
      </div>

      {/* Pre-Publication Warning Banner */}
      {summary.prePublicationWarningActive ? (
        <div className="bg-[#FEF7E8] border border-[#FFE0B2] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-[#B47D18] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#825405] flex items-center gap-2">
                <span>Pre-Publication Warning: Material Unsupported or Disputed Claims Detected</span>
                <span className="text-[10px] bg-white border border-[#FFE0B2] px-2 py-0.5 rounded-full text-[#B47D18] font-mono">
                  {summary.unresolvedUnsupportedCount} ACTION REQUIRED
                </span>
              </h4>
              <p className="text-xs text-[#687180] leading-relaxed">
                This article contains material statements that lack full empirical verification, rely on outdated benchmarks, or conflict with reliable sources.
                Medium editorial policy and Boost guidelines penalize unverified absolute claims.
                <strong className="text-[#825405]"> Review each flagged claim below to accept qualifications or apply corrections before granting &ldquo;Ready for Human Review&rdquo; status.</strong>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#EAF2ED] border border-[#C8DCD1] rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
            <span className="text-[#2E7D5B] font-medium">
              Pre-Publication Claim Audit Cleared: All material claims have been either directly verified against primary sources or reviewed and accepted with empirical qualifications.
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#2E7D5B] bg-white px-2.5 py-1 rounded-full border border-[#C8DCD1] shrink-0 font-semibold">
            AUDIT PASSED
          </span>
        </div>
      )}

      {/* Anti-Complacency Rule Notice */}
      <div className="bg-[#FAFBFC] border border-[#E6E9ED] rounded-xl p-3.5 text-xs text-[#687180] flex items-start gap-2.5">
        <Scale className="w-4 h-4 text-[#426B5A] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#20252D]">Anti-Complacency Rule:</strong>{" "}
          {summary.auditDisclaimer}
        </p>
      </div>

      {/* Claims Breakdown Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="bg-white border border-[#E6E9ED] p-3 rounded-xl space-y-0.5 shadow-2xs">
          <div className="text-[10px] text-[#89919E] uppercase font-mono">Total Audited</div>
          <div className="text-xl font-bold font-mono text-[#20252D]">{summary.totalAudited}</div>
          <div className="text-[10px] text-[#687180]">Material assertions</div>
        </div>

        <div className="bg-white border border-[#E6E9ED] p-3 rounded-xl space-y-0.5 shadow-2xs">
          <div className="text-[10px] text-[#2E7D5B] uppercase font-mono">Verified</div>
          <div className="text-xl font-bold font-mono text-[#2E7D5B]">{summary.verifiedCount}</div>
          <div className="text-[10px] text-[#687180]">Direct evidence</div>
        </div>

        <div className="bg-white border border-[#E6E9ED] p-3 rounded-xl space-y-0.5 shadow-2xs">
          <div className="text-[10px] text-[#4A6572] uppercase font-mono">Partially Supported</div>
          <div className="text-xl font-bold font-mono text-[#4A6572]">{summary.partiallySupportedCount}</div>
          <div className="text-[10px] text-[#687180]">Scope qualified</div>
        </div>

        <div className="bg-white border border-[#E6E9ED] p-3 rounded-xl space-y-0.5 shadow-2xs">
          <div className="text-[10px] text-[#C53929] uppercase font-mono">Contradicted</div>
          <div className="text-xl font-bold font-mono text-[#C53929]">{summary.contradictedCount}</div>
          <div className="text-[10px] text-[#687180]">Disputed by facts</div>
        </div>

        <div className="bg-white border border-[#E6E9ED] p-3 rounded-xl space-y-0.5 shadow-2xs">
          <div className="text-[10px] text-[#B47D18] uppercase font-mono">Unverified</div>
          <div className="text-xl font-bold font-mono text-[#B47D18]">{summary.unverifiedCount}</div>
          <div className="text-[10px] text-[#687180]">Missing proof</div>
        </div>

        <div className="bg-white border border-[#E6E9ED] p-3 rounded-xl space-y-0.5 shadow-2xs">
          <div className="text-[10px] text-[#7E22CE] uppercase font-mono">Opinions / Recs</div>
          <div className="text-xl font-bold font-mono text-[#7E22CE]">{summary.opinionCount}</div>
          <div className="text-[10px] text-[#687180]">Honest advice</div>
        </div>
      </div>

      {/* Status Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E6E9ED]">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#89919E]" />
          <span className="text-xs font-semibold text-[#20252D]">
            {viewMode === "top5" ? "Displaying Top 5 Material Claims" : `Displaying All ${claims.length} Material Claims`}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 text-[11px]">
          {[
            { id: "all", label: "All Statuses" },
            { id: "needs_attention", label: `Needs Review (${summary.unresolvedUnsupportedCount})` },
            { id: "verified", label: "Verified" },
            { id: "partially_supported", label: "Partially Supported" },
            { id: "contradicted", label: "Contradicted" },
            { id: "unverified", label: "Unverified" },
            { id: "opinion_recommendation", label: "Opinion / Rec" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? "bg-[#EAF2ED] text-[#426B5A] font-semibold border border-[#C8DCD1]"
                  : "text-[#687180] hover:text-[#20252D] bg-[#FAFBFC] border border-[#E6E9ED]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Cards Grid */}
      <div className="space-y-3.5">
        {displayedClaims.map((item, idx) => {
          const badge = getStatusBadge(item.status);
          const BadgeIcon = badge.icon;
          const isNeedsAction =
            (item.status === "contradicted" ||
              item.status === "unverified" ||
              item.status === "outdated" ||
              item.status === "partially_supported") &&
            item.userReviewStatus !== "accepted" &&
            item.userReviewStatus !== "edited";

          const isEditingThis = editingClaimId === item.id;

          return (
            <div
              key={item.id || idx}
              className={`bg-white border rounded-xl p-4 sm:p-5 space-y-3.5 transition-all shadow-2xs ${
                isNeedsAction
                  ? "border-[#FFE0B2] bg-[#FFFCF7]"
                  : "border-[#E6E9ED] hover:border-[#D1D6DE]"
              }`}
            >
              {/* Claim Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[#89919E] text-xs font-bold">
                      #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.classes}`}
                      title={badge.description}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label.toUpperCase()}</span>
                    </span>

                    <span className="text-[10px] font-mono uppercase bg-[#FAFBFC] text-[#687180] border border-[#E6E9ED] px-2 py-0.5 rounded-md">
                      {item.claimTypeLabel || item.claimType.replace(/_/g, " ")}
                    </span>

                    {item.isPrimarySource && (
                      <span className="text-[10px] font-mono text-[#2E7D5B] bg-[#EAF2ED] border border-[#C8DCD1] px-2 py-0.5 rounded-md font-medium">
                        Primary Source
                      </span>
                    )}

                    {item.isAbsoluteOrSuperlative && (
                      <span className="text-[10px] font-mono text-[#C53929] bg-[#FDF2F2] border border-[#F5C2C2] px-2 py-0.5 rounded-md font-medium">
                        Absolute Language Detected
                      </span>
                    )}

                    {item.userReviewStatus === "accepted" && (
                      <span className="text-[10px] font-medium text-[#2E7D5B] bg-[#EAF2ED] border border-[#C8DCD1] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Accepted by Author</span>
                      </span>
                    )}

                    {item.userReviewStatus === "edited" && (
                      <span className="text-[10px] font-medium text-[#426B5A] bg-[#EDF2F4] border border-[#D1D6DE] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>Edited by Author</span>
                      </span>
                    )}
                  </div>

                  {/* Exact Claim Text */}
                  {isEditingThis ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full bg-white border border-[#426B5A] rounded-xl p-3 text-xs sm:text-sm text-[#20252D] focus:outline-none"
                        rows={2}
                      />
                      <input
                        type="text"
                        value={userNote}
                        onChange={(e) => setUserNote(e.target.value)}
                        placeholder="Author review note (e.g., Qualified for B2B contracts only)"
                        className="w-full bg-white border border-[#E6E9ED] rounded-xl p-2 text-xs text-[#20252D] placeholder-[#89919E] focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1.5 bg-[#426B5A] hover:bg-[#345545] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Edited Claim</span>
                        </button>
                        <button
                          onClick={() => setEditingClaimId(null)}
                          className="px-3 py-1.5 bg-[#F0F3F5] hover:bg-[#E6E9ED] text-[#20252D] text-xs rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm font-semibold text-[#20252D] leading-snug pt-0.5">
                      &ldquo;{item.claim}&rdquo;
                    </div>
                  )}

                  {/* Article Location */}
                  <div className="text-[11px] text-[#687180] flex items-center gap-1.5 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#89919E] shrink-0" />
                    <span>
                      <strong className="text-[#20252D]">Article Location:</strong> {item.articleLocation}
                    </span>
                  </div>
                </div>

                {/* Source Link */}
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#F0F3F5] text-[#426B5A] hover:text-[#345545] border border-[#E6E9ED] rounded-lg text-xs font-medium shrink-0 self-start sm:self-auto transition-colors"
                >
                  <span className="truncate max-w-[160px]">{item.sourceName || "Source"}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              {/* Specific Source Supporting Passage */}
              <div className="bg-[#FAFBFC] p-3.5 rounded-xl border border-[#E6E9ED] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[10px] uppercase font-mono text-[#687180]">
                  <span className="flex items-center gap-1.5 text-[#426B5A] font-semibold">
                    <Quote className="w-3 h-3" />
                    <span>Specific Cited Source Passage</span>
                  </span>
                  {item.verificationDate && (
                    <span className="flex items-center gap-1 text-[#89919E]">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>Verified: {item.verificationDate}</span>
                    </span>
                  )}
                </div>
                <p className="text-[#333C48] leading-relaxed font-mono italic text-[11px]">
                  &ldquo;{item.sourcePassage}&rdquo;
                </p>
              </div>

              {/* Status Explanation & Contradiction / Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAFBFC] p-3 rounded-xl border border-[#E6E9ED] space-y-1">
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#89919E]">
                    Verification Audit Note
                  </span>
                  <p className="text-[#4F5866] leading-relaxed">{item.statusExplanation}</p>
                </div>

                {item.conditionsOrExceptions && (
                  <div className="bg-[#EDF2F4] p-3 rounded-xl border border-[#D1D6DE] space-y-1">
                    <span className="text-[10px] uppercase font-mono font-semibold text-[#4A6572]">
                      Relevant Conditions & Exceptions
                    </span>
                    <p className="text-[#333C48] leading-relaxed">{item.conditionsOrExceptions}</p>
                  </div>
                )}

                {item.isContradiction && item.contradictionDetails && (
                  <div className="bg-[#FDF2F2] p-3 rounded-xl border border-[#F5C2C2] space-y-1 md:col-span-2">
                    <span className="text-[10px] uppercase font-mono font-semibold text-[#C53929]">
                      Source Contradiction Detected
                    </span>
                    <p className="text-[#A82A1C] leading-relaxed">{item.contradictionDetails}</p>
                  </div>
                )}
              </div>

              {/* Actionable Suggested Correction (if any) */}
              {item.suggestedCorrection && (
                <div className="bg-[#FEF7E8] border border-[#FFE0B2] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#825405] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended Editorial Correction</span>
                    </div>
                    <p className="text-[#687180] leading-relaxed italic">
                      &ldquo;{item.suggestedCorrection}&rdquo;
                    </p>
                  </div>

                  <button
                    onClick={() => handleApplyCorrection(item.id, item.suggestedCorrection!)}
                    className="px-3 py-1.5 bg-[#B47D18] hover:bg-[#825405] text-white rounded-lg font-medium text-xs shrink-0 self-start sm:self-auto cursor-pointer transition-colors shadow-2xs"
                  >
                    Apply Correction
                  </button>
                </div>
              )}

              {/* User Review Actions Toolbar */}
              <div className="pt-2 border-t border-[#E6E9ED] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-[#687180]">
                  {item.userReviewStatus === "accepted" ? (
                    <span className="text-[#2E7D5B] font-medium">✓ Author reviewed and accepted</span>
                  ) : item.userReviewStatus === "edited" ? (
                    <span className="text-[#426B5A] font-medium">✓ Author edited wording</span>
                  ) : (
                    <span className="text-[#B47D18]">⚠️ Pending author review before final publication</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="px-2.5 py-1 text-[#20252D] bg-[#FAFBFC] hover:bg-[#F0F3F5] border border-[#E6E9ED] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-[#687180]" />
                    <span>Edit Claim</span>
                  </button>

                  {item.userReviewStatus !== "accepted" && (
                    <button
                      onClick={() => handleAcceptClaim(item.id)}
                      className="px-3 py-1 bg-white hover:bg-[#EAF2ED] text-[#20252D] hover:text-[#426B5A] border border-[#E6E9ED] hover:border-[#C8DCD1] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3 text-[#2E7D5B]" />
                      <span>Accept Limitation</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
