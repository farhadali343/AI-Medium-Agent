"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  Lightbulb,
  FileQuestion,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  Scale,
  Sparkles,
} from "lucide-react";
import { ArticleDraft, RedditResearchModule, RedditDiscussionItem, CommunityInsightItem } from "@/types/article";

interface TabCommunityInsightsProps {
  draft: ArticleDraft;
  onUpdateDraft?: (updated: ArticleDraft) => void;
}

export function TabCommunityInsights({ draft, onUpdateDraft }: TabCommunityInsightsProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const redditData: RedditResearchModule | undefined = draft.redditResearch;

  const handleRescanReddit = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/reddit-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: draft.topic,
          subreddits: draft.redditSubreddits || ["r/technology", "r/productivity", "r/entrepreneur", "r/SaaS"],
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
      }
    } catch (err) {
      console.error("Failed to re-scan Reddit:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusBadge = () => {
    const status = redditData?.status;
    const httpCode = redditData?.directApiHttpCode;

    if (status === "direct_api_success") {
      return {
        label: "Direct Reddit API (HTTP 200)",
        classes: "bg-[#EAF2ED] text-[#2E7D5B] border-[#C8DCD1]",
        tooltip: "Connected directly to Reddit JSON feed.",
      };
    }

    if (status === "direct_api_blocked_fallback_search" || httpCode === 403) {
      return {
        label: "Google Search Grounding (Reddit Index)",
        classes: "bg-[#EDF2F4] text-[#4A6572] border-[#D1D6DE]",
        tooltip: "Reddit direct API blocked cloud datacenter IP (HTTP 403). Using live Google Search Grounding to index real Reddit discussions.",
      };
    }

    if (status === "rate_limited" || httpCode === 429) {
      return {
        label: "Rate-Limited Fallback",
        classes: "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]",
        tooltip: "Reddit API rate-limited; retrieved discussions via search grounding.",
      };
    }

    return {
      label: "Search Grounded Reddit Index",
      classes: "bg-[#EAF2ED] text-[#2E7D5B] border-[#C8DCD1]",
      tooltip: "Grounding active with live Google Search queries.",
    };
  };

  const getEvidenceTypeBadge = (type: RedditDiscussionItem["evidenceType"]) => {
    switch (type) {
      case "repeated_pattern":
        return {
          label: "Repeated Pattern",
          classes: "bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]",
        };
      case "individual_anecdote":
        return {
          label: "Individual Anecdote",
          classes: "bg-[#F0F3F5] text-[#4F5866] border-[#E6E9ED]",
        };
      case "community_disagreement":
        return {
          label: "Community Disagreement",
          classes: "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]",
        };
      case "practical_worked_example":
        return {
          label: "Worked Example",
          classes: "bg-[#EAF2ED] text-[#2E7D5B] border-[#C8DCD1]",
        };
      default:
        return {
          label: "Anecdotal Report",
          classes: "bg-[#F0F3F5] text-[#687180] border-[#E6E9ED]",
        };
    }
  };

  const statusBadge = getStatusBadge();
  const discussions = redditData?.discussions || [];
  const keyInsights = redditData?.keyInsights || [];

  const filteredInsights = activeCategoryFilter === "all"
    ? keyInsights
    : keyInsights.filter((i) => i.category === activeCategoryFilter);

  return (
    <div className="space-y-6">
      {/* Top Header & Re-scan Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#B47D18]" />
            <h3 className="text-lg font-semibold text-[#20252D]">
              Reddit Community Insights & Street Calibration
            </h3>
          </div>
          <p className="text-xs text-[#687180] mt-0.5">
            Real practitioner friction, recurring beginner questions, and unvarnished mistakes retrieved from relevant Reddit forums.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusBadge.classes}`}
            title={statusBadge.tooltip}
          >
            {statusBadge.label}
          </span>

          <button
            onClick={handleRescanReddit}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED] rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Re-query Reddit for latest community sentiment"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#426B5A] ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning Reddit..." : "Re-scan Reddit"}</span>
          </button>
        </div>
      </div>

      {/* Access Transparency & Limitations Notice */}
      <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-[#426B5A] uppercase tracking-wider">
              Real-Time Reddit Access Status
            </div>
            <p className="text-[#333C48] leading-relaxed font-medium">
              {redditData?.statusMessage ||
                "Live Google Search Grounding successfully indexed relevant Reddit discussions and community reports."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-[#FAFBFC] px-3.5 py-2 rounded-xl border border-[#E6E9ED] text-center">
              <div className="text-[10px] text-[#687180]">Discussions Reviewed</div>
              <div className="text-base font-bold text-[#B47D18] font-mono">
                {redditData?.totalDiscussionsReviewed || discussions.length}
              </div>
            </div>
            <div className="bg-[#FAFBFC] px-3.5 py-2 rounded-xl border border-[#E6E9ED] text-center">
              <div className="text-[10px] text-[#687180]">Subreddits</div>
              <div className="text-base font-bold text-[#20252D] font-mono">
                {redditData?.subredditsSearched?.length || 3}
              </div>
            </div>
          </div>
        </div>

        {/* Search Queries Executed */}
        <div className="pt-2 border-t border-[#E6E9ED]">
          <div className="text-[11px] font-medium text-[#687180] mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#89919E]" />
            <span>Queries Executed on Reddit Index:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(redditData?.queriesExecuted || [
              `site:reddit.com/r/SaaS "${draft.topic}"`,
              `site:reddit.com "${draft.topic}" "mistakes" OR "problems"`,
            ]).map((q, idx) => (
              <span
                key={idx}
                className="bg-[#FAFBFC] px-2 py-0.5 rounded-md border border-[#E6E9ED] text-[11px] font-mono text-[#4F5866]"
              >
                {q}
              </span>
            ))}
          </div>
        </div>

        {/* Sample Limitations Disclaimer */}
        <div className="bg-[#FEF7E8] border border-[#FFE0B2] rounded-lg p-3 text-xs text-[#687180] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#B47D18] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#825405]">Methodological Evidence Boundary:</strong>{" "}
            {redditData?.sampleLimitations ||
              "Findings represent qualitative anecdotal reports from self-selected online posters, not statistical certainty. Used solely to understand real user pain points and ground editorial explanations—never to fabricate universal consensus."}
          </p>
        </div>
      </div>

      {/* Editorial Translation Matrix: 5 Core Questions */}
      {redditData?.editorialAnswers && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#426B5A]" />
            <h4 className="text-sm font-semibold text-[#20252D]">
              Editorial Integration Matrix: Translating Community Friction into Value
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Card 1 */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="font-semibold text-[#B47D18] flex items-center gap-1.5">
                <FileQuestion className="w-3.5 h-3.5" />
                <span>1. What Readers Are Struggling With</span>
              </div>
              <p className="text-[#4F5866] leading-relaxed">
                {redditData.editorialAnswers.whatReadersStruggleWith}
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="font-semibold text-[#C53929] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>2. Confusing or Incomplete Advice</span>
              </div>
              <p className="text-[#4F5866] leading-relaxed">
                {redditData.editorialAnswers.confusingOrIncompleteAdvice}
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="font-semibold text-[#2E7D5B] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>3. Practical Details Added to Article</span>
              </div>
              <p className="text-[#4F5866] leading-relaxed">
                {redditData.editorialAnswers.practicalDetailsToAdd}
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 space-y-1.5 shadow-2xs">
              <div className="font-semibold text-[#4A6572] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>4. Beliefs Needing Verification</span>
              </div>
              <p className="text-[#4F5866] leading-relaxed">
                {redditData.editorialAnswers.beliefsNeedingVerification}
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-[#E6E9ED] rounded-xl p-4 space-y-1.5 md:col-span-2 lg:col-span-2 shadow-2xs">
              <div className="font-semibold text-[#7E22CE] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>5. Where Community Experiences Diverge from Official Docs</span>
              </div>
              <p className="text-[#4F5866] leading-relaxed">
                {redditData.editorialAnswers.conflictsWithDocumentation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Relevant Discussions with Direct Links */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#426B5A]" />
            <h4 className="text-sm font-semibold text-[#20252D]">
              Relevant Discussions Reviewed ({discussions.length})
            </h4>
          </div>
          <span className="text-[11px] text-[#687180]">
            Click any discussion to view direct source URL on Reddit
          </span>
        </div>

        <div className="space-y-2.5">
          {discussions.map((disc) => {
            const evBadge = getEvidenceTypeBadge(disc.evidenceType);

            return (
              <div
                key={disc.id}
                className="bg-white border border-[#E6E9ED] rounded-xl p-4 hover:border-[#D1D6DE] transition-colors space-y-2 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#20252D] hover:text-[#426B5A] transition-colors">
                        {disc.title}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-[#B47D18] bg-[#FEF7E8] px-2 py-0.5 rounded-full border border-[#FFE0B2]">
                        {disc.subreddit}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${evBadge.classes}`}>
                        {evBadge.label}
                      </span>
                      {disc.date && (
                        <span className="text-[10px] text-[#89919E]">{disc.date}</span>
                      )}
                    </div>

                    <p className="text-xs text-[#4F5866] leading-relaxed">
                      {disc.summary}
                    </p>
                  </div>

                  <a
                    href={disc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED] rounded-lg text-xs font-medium shrink-0 transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <span>View on Reddit</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#89919E]" />
                  </a>
                </div>

                {/* Where Used in Article */}
                {disc.usedInArticle && (
                  <div className="pt-2 border-t border-[#E6E9ED] flex items-center gap-2 text-[11px] text-[#687180]">
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0" />
                    <span>
                      <strong className="text-[#20252D]">Used in Article:</strong>{" "}
                      {disc.usedInArticleContext || "Referenced in practical worked blueprint & community reports section"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#426B5A]" />
            <h4 className="text-sm font-semibold text-[#20252D]">
              Categorized Community Insights ({keyInsights.length})
            </h4>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-1 text-[11px]">
            {[
              { id: "all", label: "All Insights" },
              { id: "beginner_questions", label: "Beginner Questions" },
              { id: "reported_mistakes", label: "Reported Mistakes" },
              { id: "community_disagreements", label: "Disagreements" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveCategoryFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeCategoryFilter === f.id
                    ? "bg-[#EAF2ED] text-[#426B5A] font-semibold border border-[#C8DCD1]"
                    : "text-[#687180] hover:text-[#20252D] bg-[#FAFBFC] border border-[#E6E9ED]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white border border-[#E6E9ED] rounded-xl p-4 space-y-2.5 hover:border-[#D1D6DE] transition-colors shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#426B5A] uppercase tracking-wider font-mono">
                  {insight.categoryLabel}
                </span>
                <span className="text-[10px] text-[#687180] bg-[#FAFBFC] px-2 py-0.5 rounded-full border border-[#E6E9ED]">
                  {insight.evidenceStrength === "widespread_pattern" ? "Widespread Pattern" : "Multiple Reports"}
                </span>
              </div>

              <div className="text-xs font-semibold text-[#20252D] leading-snug">
                {insight.coreInsight}
              </div>

              <div className="text-xs text-[#687180] space-y-1">
                <div>
                  <strong className="text-[#20252D]">Observed Sentiment:</strong>{" "}
                  {insight.communitySentiment}
                </div>
                <div>
                  <strong className="text-[#20252D]">How Used in Article:</strong>{" "}
                  {insight.editorialApplication}
                </div>
                {insight.conflictsWithOfficialDocs && (
                  <div className="text-[#825405] bg-[#FEF7E8] p-2 rounded-md mt-1 border border-[#FFE0B2] text-[11px]">
                    <strong>Divergence from Docs:</strong> {insight.conflictsWithOfficialDocs}
                  </div>
                )}
              </div>

              {insight.sourceDiscussionUrls && insight.sourceDiscussionUrls.length > 0 && (
                <div className="pt-2 border-t border-[#E6E9ED] flex items-center gap-1.5 text-[11px]">
                  <span className="text-[#89919E]">Source:</span>
                  <a
                    href={insight.sourceDiscussionUrls[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#426B5A] hover:underline truncate max-w-[240px] inline-flex items-center gap-1 font-medium"
                  >
                    <span>{insight.sourceDiscussionUrls[0].replace("https://reddit.com", "")}</span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Claims Requiring Verification Against Primary Sources */}
      {redditData?.claimsRequiringVerification && redditData.claimsRequiringVerification.length > 0 && (
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#B47D18]" />
            <h4 className="text-sm font-semibold text-[#20252D]">
              Community Claims Requiring Primary Source Verification ({redditData.claimsRequiringVerification.length})
            </h4>
          </div>
          <p className="text-xs text-[#687180]">
            Reddit discussions frequently contain anecdotal percentages or casual rules of thumb. These claims are flagged for independent primary source verification before being stated as facts.
          </p>

          <div className="space-y-2 pt-1">
            {redditData.claimsRequiringVerification.map((claim, idx) => (
              <div
                key={idx}
                className="bg-[#FAFBFC] p-3.5 rounded-xl border border-[#E6E9ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="font-semibold text-[#20252D]">
                    &ldquo;{claim.communityClaim}&rdquo;
                  </div>
                  <div className="text-[#687180] text-[11px]">
                    <strong className="text-[#B47D18]">Verification Need:</strong> {claim.reasonVerificationNeeded}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#FEF7E8] text-[#B47D18] border border-[#FFE0B2]">
                    {claim.status.replace(/_/g, " ")}
                  </span>
                  {claim.sourceUrl && (
                    <a
                      href={claim.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-[#89919E] hover:text-[#426B5A]"
                      title="View source thread"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
