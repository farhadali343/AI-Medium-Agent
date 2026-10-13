"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  Info,
  Scale,
  Sparkles,
  UserCheck,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  ArticleDraft,
  MediumPolicyAudit,
  PolicyEvidenceType,
} from "@/types/article";

interface TabPolicyAuditProps {
  draft: ArticleDraft;
  onUpdateDraft?: (updated: ArticleDraft) => void;
}

export function TabPolicyAudit({ draft, onUpdateDraft }: TabPolicyAuditProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [reviewerNotes, setReviewerNotes] = useState(draft.humanReviewNotes || "");
  const [isSigningOff, setIsSigningOff] = useState(false);

  const audit: MediumPolicyAudit | undefined = draft.policyAudit;

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: draft.topic,
          selectedTitle: draft.selectedTitle,
          selectedSubtitle: draft.selectedSubtitle,
          contentMarkdown: draft.contentMarkdown,
          tags: draft.tags,
          sources: draft.sources,
          factCheck: draft.factCheck,
          aiDisclosure: draft.aiDisclosure,
          titleOptions: draft.titleOptions,
        }),
      });

      const data = await res.json();
      if (data.success && data.policyAudit && onUpdateDraft) {
        onUpdateDraft({
          ...draft,
          policyAudit: data.policyAudit,
        });
      }
    } catch (err) {
      console.error("Failed to rerun policy audit:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleHumanSignOff = () => {
    if (!onUpdateDraft) return;
    const now = new Date().toLocaleString();
    const isApproved = draft.humanReviewStatus === "approved_by_human";
    const nextStatus = isApproved ? "ready_for_review" : "approved_by_human";

    onUpdateDraft({
      ...draft,
      humanReviewStatus: nextStatus,
      humanReviewApprovedAt: nextStatus === "approved_by_human" ? now : undefined,
      humanReviewNotes: reviewerNotes,
    });
    setIsSigningOff(false);
  };

  const issues = audit?.issues || [];
  const filteredIssues = issues.filter((issue) => {
    if (severityFilter === "all") return true;
    return issue.riskSeverity === severityFilter;
  });

  const getRuleBadge = (type: PolicyEvidenceType) => {
    switch (type) {
      case "explicit_rule":
        return {
          label: "Explicit Rule",
          classes: "bg-rose-950/60 text-rose-300 border-rose-500/40",
        };
      case "editorial_best_practice":
        return {
          label: "Editorial Best Practice",
          classes: "bg-blue-950/60 text-blue-300 border-blue-500/40",
        };
      case "uncertain_interpretation":
        return {
          label: "Uncertain Interpretation",
          classes: "bg-purple-950/60 text-purple-300 border-purple-500/40",
        };
      case "needs_manual_verification":
        return {
          label: "Needs Manual Verification",
          classes: "bg-amber-950/60 text-amber-300 border-amber-500/40",
        };
      default:
        return {
          label: "Policy Guideline",
          classes: "bg-zinc-800 text-zinc-300 border-zinc-700",
        };
    }
  };

  const getSeverityBadge = (sev: "high" | "medium" | "low") => {
    switch (sev) {
      case "high":
        return {
          label: "High Severity",
          classes: "bg-rose-950/80 text-rose-300 border-rose-500/50",
        };
      case "medium":
        return {
          label: "Medium Severity",
          classes: "bg-amber-950/80 text-amber-300 border-amber-500/50",
        };
      case "low":
        return {
          label: "Low Severity",
          classes: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
        };
    }
  };

  const overallRisk = audit?.overallRisk || "low";
  const isHumanApproved = draft.humanReviewStatus === "approved_by_human";

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {overallRisk === "high" ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : overallRisk === "moderate" ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-lg font-semibold text-zinc-100">
              Medium Policy & Editorial Risk Audit
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Evaluates content against official Medium Help Center rules, Partner Program monetization policies (May 1, 2024 update), and Boost quality criteria.
          </p>
        </div>

        <button
          onClick={handleReRunAudit}
          disabled={isAuditing}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          title="Re-run policy audit on current article content"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isAuditing ? "animate-spin" : ""}`} />
          <span>{isAuditing ? "Auditing Policies..." : "Re-run Audit"}</span>
        </button>
      </div>

      {/* Editorial Risk Overview Banner */}
      <div
        className={`rounded-2xl p-5 border transition-all ${
          overallRisk === "high"
            ? "bg-rose-950/30 border-rose-500/40 text-rose-100"
            : overallRisk === "moderate"
            ? "bg-amber-950/30 border-amber-500/40 text-amber-100"
            : "bg-emerald-950/30 border-emerald-500/40 text-emerald-100"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                  overallRisk === "high"
                    ? "bg-rose-900/60 border-rose-400 text-rose-200"
                    : overallRisk === "moderate"
                    ? "bg-amber-900/60 border-amber-400 text-amber-200"
                    : "bg-emerald-900/60 border-emerald-400 text-emerald-200"
                }`}
              >
                Overall Risk: {overallRisk.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-400">
                {issues.length} policy issue{issues.length === 1 ? "" : "s"} identified across 10 official categories
              </span>
            </div>

            <p className="text-sm font-medium text-zinc-200 leading-relaxed">
              {audit?.riskSummary || "Article meets standard Medium guidelines."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="bg-zinc-900/80 px-3 py-2 rounded-xl border border-zinc-800 text-center">
              <div className="text-zinc-400 text-[11px]">High Severity</div>
              <div className="text-base font-bold text-rose-400 font-mono">
                {issues.filter((i) => i.riskSeverity === "high").length}
              </div>
            </div>
            <div className="bg-zinc-900/80 px-3 py-2 rounded-xl border border-zinc-800 text-center">
              <div className="text-zinc-400 text-[11px]">Moderate</div>
              <div className="text-base font-bold text-amber-400 font-mono">
                {issues.filter((i) => i.riskSeverity === "medium").length}
              </div>
            </div>
            <div className="bg-zinc-900/80 px-3 py-2 rounded-xl border border-zinc-800 text-center">
              <div className="text-zinc-400 text-[11px]">Improvements</div>
              <div className="text-base font-bold text-blue-400 font-mono">
                {audit?.editorialImprovements?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Editorial Notice */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-zinc-300">Editorial Integrity Notice:</strong> This audit is a rigorous policy risk assessment, not a guarantee of Medium distribution, Boost curation, or Partner Program paywall approval.
          </p>
        </div>
      </div>

      {/* Human Editorial Sign-Off Card */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isHumanApproved
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-400"
              }`}
            >
              {isHumanApproved ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Medium Policy Gating
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isHumanApproved
                      ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                      : "bg-amber-950 border-amber-500 text-amber-300"
                  }`}
                >
                  {isHumanApproved ? "Human Review Approved" : "Ready for Human Review (Pending)"}
                </span>
              </div>
              <h4 className="text-base font-semibold text-zinc-100 mt-0.5">
                {isHumanApproved
                  ? "Article Approved by Human Author"
                  : "Mandatory Human Editorial Sign-Off"}
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {isHumanApproved
                  ? `Sign-off completed${draft.humanReviewApprovedAt ? ` on ${draft.humanReviewApprovedAt}` : ""}. Article is verified and ready for manual publication into Medium's editor.`
                  : "Autonomous publishing is strictly prohibited by Medium policies. Before distributing, the human writer must review factual statements and sign off."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={() => setIsSigningOff(!isSigningOff)}
              className="px-3.5 py-2 text-xs font-medium text-zinc-300 bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
            >
              {isSigningOff ? "Cancel" : isHumanApproved ? "Edit Notes" : "Review & Sign Off"}
            </button>

            <button
              onClick={handleHumanSignOff}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer ${
                isHumanApproved
                  ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700"
                  : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20"
              }`}
            >
              {isHumanApproved ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Revoke Approval</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                  <span>Confirm Human Sign-Off</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isSigningOff && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
            <label className="block text-xs font-medium text-zinc-300">
              Reviewer Checklist & Editorial Notes:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 mb-2">
              <label className="flex items-center gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-emerald-500" />
                <span>Verified factual numbers against primary sources</span>
              </label>
              <label className="flex items-center gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-emerald-500" />
                <span>Checked AI disclosure appears in first 2 paragraphs</span>
              </label>
            </div>
            <textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Add optional notes: e.g., 'Checked MicroConf links and verified founder timelines.'"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 min-h-[70px]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleHumanSignOff}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save & Sign Off
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy Issues Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-zinc-200">
              Policy-Related Issues Found ({issues.length})
            </h4>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            {(["all", "high", "medium", "low"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {sev === "all" ? "All" : sev}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <div className="text-sm font-medium text-zinc-200">No Policy Issues Found in this Filter</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const ruleBadge = getRuleBadge(issue.ruleType);
              const sevBadge = getSeverityBadge(issue.riskSeverity);

              return (
                <div
                  key={issue.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700/80 transition-colors space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${sevBadge.classes}`}>
                        {sevBadge.label}
                      </span>
                      <span className="text-xs font-semibold text-zinc-200">
                        {issue.categoryLabel}
                      </span>
                    </div>

                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${ruleBadge.classes}`}>
                      {ruleBadge.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      Exact Affected Article Passage:
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 text-xs font-mono text-zinc-300 leading-relaxed break-words">
                      {issue.affectedPassage}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3.5 space-y-1">
                      <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Why It May Be a Problem</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{issue.whyProblem}</p>
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 space-y-1 relative">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Recommended Correction</span>
                        </div>
                        <button
                          onClick={() => handleCopyText(issue.id, issue.recommendedCorrection)}
                          className="text-[10px] text-zinc-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === issue.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Fix</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-zinc-300 leading-relaxed pr-6">{issue.recommendedCorrection}</p>
                    </div>
                  </div>

                  {issue.policySourceUrl && (
                    <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2 max-w-2xl">
                        <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-zinc-400 italic text-[11px] leading-relaxed">
                          &ldquo;{issue.policySupportingPassage}&rdquo;
                        </div>
                      </div>

                      <a
                        href={issue.policySourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-emerald-400 hover:text-emerald-300 text-xs shrink-0 transition-colors"
                      >
                        <span>View Policy Docs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editorial Improvements */}
      {audit?.editorialImprovements && audit.editorialImprovements.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-zinc-200">
              Editorial Improvements for Medium Boost (Not Policy Violations)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {audit.editorialImprovements.map((imp) => (
              <div
                key={imp.id}
                className="bg-zinc-950/70 border border-zinc-850 rounded-xl p-4 space-y-2"
              >
                <div className="text-[11px] font-semibold text-emerald-400 font-mono uppercase tracking-wider">
                  {imp.category}
                </div>
                <div className="text-xs font-semibold text-zinc-200">{imp.suggestion}</div>
                <div className="text-xs text-zinc-400 leading-relaxed">{imp.benefit}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
