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
  FileCheck,
  BookOpen,
  Info,
  Sparkles,
  UserCheck,
  AlertOctagon,
} from "lucide-react";
import {
  ArticleDraft,
  MediumPolicyAudit,
  EditorialRiskLevel,
  PolicyEvidenceType,
} from "@/types/article";

interface TabPolicyAuditProps {
  draft: ArticleDraft;
  onUpdateDraft?: (updated: ArticleDraft) => void;
}

export function TabPolicyAudit({ draft, onUpdateDraft }: TabPolicyAuditProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState(draft.humanReviewNotes || "");
  const [isApproved, setIsApproved] = useState(draft.humanReviewStatus === "approved_by_human");
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [prePublicationNotice, setPrePublicationNotice] = useState<string | null>(null);

  const policyAudit: MediumPolicyAudit | undefined = draft.policyAudit;
  const overallRisk: EditorialRiskLevel = policyAudit?.overallRisk || "low";
  const issues = policyAudit?.issues || [];
  const improvements = policyAudit?.editorialImprovements || [];

  const handleReAudit = async () => {
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
          humanReviewStatus: data.policyAudit.overallRisk === "high" ? "pending_audit" : "ready_for_review",
        });
      }
    } catch (err) {
      console.error("Re-audit failed:", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const hasUnresolvedClaims = !!draft.claimVerificationSummary?.prePublicationWarningActive;
  const unresolvedClaimsCount = draft.claimVerificationSummary?.unresolvedUnsupportedCount || 0;

  const handleToggleHumanSignoff = () => {
    if (hasUnresolvedClaims && !isApproved) {
      setPrePublicationNotice(
        `Pre-Publication Requirement: Please review and accept or edit the ${unresolvedClaimsCount} flagged unsupported claims in the Claim Verification tab before granting Human Review sign-off.`
      );
      return;
    }
    setPrePublicationNotice(null);
    const nextApproved = !isApproved;
    setIsApproved(nextApproved);
    if (onUpdateDraft) {
      onUpdateDraft({
        ...draft,
        humanReviewStatus: nextApproved ? "approved_by_human" : hasUnresolvedClaims ? "requires_claim_review" : "ready_for_review",
        humanReviewApprovedAt: nextApproved ? new Date().toISOString() : undefined,
        humanReviewNotes: reviewNotes,
      });
    }
  };

  const handleSaveNotes = () => {
    if (onUpdateDraft) {
      onUpdateDraft({
        ...draft,
        humanReviewNotes: reviewNotes,
      });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredIssues =
    activeSeverityFilter === "all"
      ? issues
      : issues.filter((i) => i.riskSeverity === activeSeverityFilter);

  const getRiskBadge = (level: EditorialRiskLevel) => {
    switch (level) {
      case "high":
        return {
          label: "HIGH EDITORIAL RISK",
          classes: "bg-[#FDF2F2] text-[#C53929] border-[#F5C2C2]",
          icon: AlertOctagon,
        };
      case "moderate":
        return {
          label: "MODERATE EDITORIAL RISK",
          classes: "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]",
          icon: AlertTriangle,
        };
      case "low":
      default:
        return {
          label: "LOW EDITORIAL RISK",
          classes: "bg-[#EAF2ED] text-[#2E7D5B] border-[#C8DCD1]",
          icon: ShieldCheck,
        };
    }
  };

  const getRuleTypeBadge = (type: PolicyEvidenceType) => {
    switch (type) {
      case "explicit_rule":
        return {
          label: "Explicit Rule",
          classes: "bg-[#FDF2F2] text-[#C53929] border-[#F5C2C2]",
        };
      case "editorial_best_practice":
        return {
          label: "Editorial Best Practice",
          classes: "bg-[#EDF2F4] text-[#4A6572] border-[#D1D6DE]",
        };
      case "needs_manual_verification":
        return {
          label: "Needs Manual Verification",
          classes: "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]",
        };
      default:
        return {
          label: "Policy Interpretation",
          classes: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
        };
    }
  };

  const riskBadge = getRiskBadge(overallRisk);
  const RiskIcon = riskBadge.icon;

  return (
    <div className="space-y-6">
      {/* Top Header & Re-audit Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#426B5A]" />
            <h3 className="text-lg font-semibold text-[#20252D]">
              Medium Policy & Editorial Risk Audit
            </h3>
          </div>
          <p className="text-xs text-[#687180] mt-0.5">
            Evaluates draft against current official Medium Rules, Partner Program eligibility (May 1, 2024 update), and Boost quality criteria.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${riskBadge.classes} flex items-center gap-1.5`}
          >
            <RiskIcon className="w-3.5 h-3.5" />
            <span>{riskBadge.label}</span>
          </span>

          <button
            onClick={handleReAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED] rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Re-evaluate article against Medium rules"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#426B5A] ${isAuditing ? "animate-spin" : ""}`} />
            <span>{isAuditing ? "Auditing Rules..." : "Re-run Audit"}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Human Review & Anti-Evasion Disclaimer */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-[#426B5A] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
              <FileCheck className="w-4 h-4" />
              <span>EDITORIAL INTEGRITY NOTICE & MANDATORY HUMAN REVIEW</span>
            </div>
            <p className="text-xs text-[#333C48] leading-relaxed">
              {policyAudit?.riskSummary ||
                "Article adheres to official Medium platform rules. Run this audit before granting final human approval. Do not automatically publish."}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setShowDocsModal(!showDocsModal)}
              className="text-xs text-[#687180] hover:text-[#20252D] bg-[#FAFBFC] hover:bg-[#F0F3F5] border border-[#E6E9ED] px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#426B5A]" />
              <span>{showDocsModal ? "Hide Policy Docs" : "Official Policy Docs (4)"}</span>
            </button>
          </div>
        </div>

        {/* Anti-Bypass Disclaimer */}
        <div className="bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg p-3 text-[11px] text-[#687180] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#426B5A] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#20252D]">No False Guarantees:</strong>{" "}
            {policyAudit?.disclaimer ||
              "This audit does not provide a simplistic pass/fail score or guarantee of Boost distribution or Partner Program earnings. Articles are not rewritten to evade AI detection; the goal is improving originality, factuality, transparency, and reader value."}
          </p>
        </div>
      </div>

      {/* Official Documentation Reference Drawer */}
      {showDocsModal && policyAudit?.officialDocSources && (
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#426B5A]" />
              <h4 className="text-xs font-semibold text-[#20252D] uppercase tracking-wider">
                Official Medium Policy Documentation Verified
              </h4>
            </div>
            <span className="text-[10px] text-[#89919E]">Verified from help.medium.com & policy.medium.com</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {policyAudit.officialDocSources.map((doc, idx) => (
              <div
                key={idx}
                className="bg-[#FAFBFC] p-3.5 rounded-xl border border-[#E6E9ED] space-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#20252D] text-xs truncate" title={doc.title}>
                      {doc.title}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-white text-[#687180] border border-[#E6E9ED] shrink-0">
                      {doc.ruleType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#426B5A] font-mono">{doc.topic}</div>
                  <p className="text-[11px] text-[#4F5866] italic leading-relaxed">
                    &ldquo;{doc.excerpt}&rdquo;
                  </p>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="pt-2 text-[11px] text-[#426B5A] hover:underline inline-flex items-center gap-1 self-start font-medium"
                >
                  <span>Open Help Center Page</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Human Editorial Sign-Off Form */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 space-y-4 shadow-2xs">
        {prePublicationNotice && (
          <div className="bg-[#FEF7E8] border border-[#FFE0B2] rounded-lg p-3.5 flex items-start justify-between gap-3 text-xs text-[#825405]">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B47D18] shrink-0 mt-0.5" />
              <p>{prePublicationNotice}</p>
            </div>
            <button
              onClick={() => setPrePublicationNotice(null)}
              className="text-[#B47D18] hover:text-[#825405] text-xs font-semibold px-2 py-0.5 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#426B5A]" />
            <div>
              <h4 className="text-sm font-semibold text-[#20252D]">
                Editorial Review Status:{" "}
                <span className={isApproved ? "text-[#2E7D5B]" : hasUnresolvedClaims ? "text-[#B47D18]" : "text-[#426B5A]"}>
                  {isApproved ? "Approved by Human Author" : hasUnresolvedClaims ? "Requires Claim Review" : "Ready for Human Review"}
                </span>
              </h4>
              <p className="text-[11px] text-[#687180]">
                Mandatory safeguard: Articles cannot be auto-published without an author verifying claims and voice.
              </p>
              {hasUnresolvedClaims && !isApproved && (
                <p className="text-[11px] text-[#B47D18] font-medium pt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{unresolvedClaimsCount} material claims flagged in Claim Verification tab. Review them to unlock publication.</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleToggleHumanSignoff}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isApproved
                ? "bg-[#2E7D5B] hover:bg-[#236046] text-white"
                : "bg-white hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED]"
            }`}
          >
            {isApproved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Signed Off by Human</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-[#426B5A]" />
                <span>Sign Off for Human Publication</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-medium text-[#687180] flex items-center justify-between">
            <span>Author Editorial Review Notes & Corrections:</span>
            {draft.humanReviewApprovedAt && (
              <span className="text-[#89919E] font-mono text-[10px]">
                Signed: {new Date(draft.humanReviewApprovedAt).toLocaleString()}
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g., Reviewed pricing table; confirmed zero affiliate links; verified AI disclosure in paragraph 2."
              className="flex-1 bg-white border border-[#E6E9ED] rounded-lg px-3 py-2 text-xs text-[#20252D] placeholder-[#89919E] focus:outline-none focus:border-[#426B5A]"
            />
            <button
              onClick={handleSaveNotes}
              className="px-3.5 py-2 bg-[#FAFBFC] hover:bg-[#F0F3F5] text-[#20252D] text-xs rounded-lg font-medium border border-[#E6E9ED] cursor-pointer"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>

      {/* Policy Issues Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#426B5A]" />
            <h4 className="text-sm font-semibold text-[#20252D]">
              Policy Audit Issues Identified ({issues.length})
            </h4>
          </div>

          {/* Severity Filter Buttons */}
          <div className="flex flex-wrap gap-1 text-[11px]">
            {[
              { id: "all", label: "All Severity" },
              { id: "high", label: "High Risk" },
              { id: "medium", label: "Medium Risk" },
              { id: "low", label: "Low Risk" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveSeverityFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeSeverityFilter === f.id
                    ? "bg-[#EAF2ED] text-[#426B5A] font-semibold border border-[#C8DCD1]"
                    : "text-[#687180] hover:text-[#20252D] bg-[#FAFBFC] border border-[#E6E9ED]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-6 text-center space-y-2 shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-[#2E7D5B] mx-auto" />
            <div className="text-sm font-semibold text-[#20252D]">
              No High or Moderate Policy Violations Found
            </div>
            <p className="text-xs text-[#687180] max-w-md mx-auto">
              The article adheres to official Medium platform rules regarding AI disclosure, affiliate policies, original research, and non-sensational headlines.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const ruleBadge = getRuleTypeBadge(issue.ruleType);

              return (
                <div
                  key={issue.id}
                  className="bg-white border border-[#E6E9ED] rounded-xl p-4 sm:p-5 space-y-3 hover:border-[#D1D6DE] transition-colors shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            issue.riskSeverity === "high"
                              ? "bg-[#FDF2F2] text-[#C53929] border border-[#F5C2C2]"
                              : issue.riskSeverity === "medium"
                              ? "bg-[#FEF7E8] text-[#B47D18] border border-[#FFE0B2]"
                              : "bg-[#EDF2F4] text-[#4A6572] border border-[#D1D6DE]"
                          }`}
                        >
                          {issue.riskSeverity.toUpperCase()} SEVERITY
                        </span>
                        <span className="text-xs font-semibold text-[#20252D]">
                          {issue.categoryLabel}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${ruleBadge.classes}`}>
                          {ruleBadge.label}
                        </span>
                      </div>
                    </div>

                    <a
                      href={issue.policySourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAFBFC] hover:bg-[#F0F3F5] text-[#426B5A] border border-[#E6E9ED] rounded-lg text-xs font-medium shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      <span>Official Medium Rule</span>
                      <ExternalLink className="w-3 h-3 text-[#89919E]" />
                    </a>
                  </div>

                  {/* Exact Affected Article Passage */}
                  <div className="bg-[#FAFBFC] p-3 rounded-lg border border-[#E6E9ED] space-y-1">
                    <div className="text-[10px] uppercase font-mono text-[#89919E] flex items-center justify-between">
                      <span>Affected Article Passage:</span>
                      <button
                        onClick={() => copyToClipboard(issue.affectedPassage, issue.id)}
                        className="text-[#687180] hover:text-[#20252D] inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === issue.id ? <Check className="w-3 h-3 text-[#2E7D5B]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === issue.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#333C48] font-mono italic leading-relaxed">
                      &ldquo;{issue.affectedPassage}&rdquo;
                    </p>
                  </div>

                  {/* Why Problem & Recommended Correction */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FEF7E8]/50 p-3 rounded-lg border border-[#FFE0B2] space-y-1">
                      <div className="font-semibold text-[#825405]">Why It May Be a Problem:</div>
                      <p className="text-[#687180] leading-relaxed">{issue.whyProblem}</p>
                    </div>

                    <div className="bg-[#EAF2ED]/50 p-3 rounded-lg border border-[#C8DCD1] space-y-1">
                      <div className="font-semibold text-[#2E7D5B]">Recommended Editorial Correction:</div>
                      <p className="text-[#20252D] leading-relaxed">{issue.recommendedCorrection}</p>
                    </div>
                  </div>

                  {/* Supporting Policy Quote */}
                  <div className="text-[11px] text-[#89919E] border-t border-[#E6E9ED] pt-2 flex items-start gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#89919E] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#687180]">Supporting Policy Passage:</strong> &ldquo;{issue.policySupportingPassage}&rdquo;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Editorial Improvements (Non-Violation Recommendations) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#426B5A]" />
          <h4 className="text-sm font-semibold text-[#20252D]">
            Recommended Editorial Improvements ({improvements.length})
          </h4>
        </div>
        <p className="text-xs text-[#687180]">
          These items are not official policy violations, but editorial best practices to maximize reader retention and Medium Boost eligibility.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {improvements.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E6E9ED] rounded-xl p-4 space-y-2 hover:border-[#D1D6DE] transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#426B5A] uppercase tracking-wider font-mono">
                  {item.category}
                </span>
                <span className="text-[10px] text-[#687180] bg-[#FAFBFC] px-2 py-0.5 rounded-full border border-[#E6E9ED]">
                  Best Practice
                </span>
              </div>

              <div className="text-xs font-semibold text-[#20252D] leading-snug">
                {item.suggestion}
              </div>

              <div className="text-xs text-[#687180] space-y-1">
                <div>
                  <strong className="text-[#20252D]">Expected Benefit:</strong> {item.benefit}
                </div>
                <div>
                  <strong className="text-[#20252D]">Editorial Rationale:</strong> {item.rationale}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
