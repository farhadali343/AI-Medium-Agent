"use client";

import React, { useState } from "react";
import {
  Check,
  Compass,
  ShieldAlert,
  MessageSquare,
  Sparkles,
  Copy,
  Lightbulb,
  Search,
  BookOpen,
  Target,
} from "lucide-react";
import { ArticleDraft, TitleOption } from "@/types/article";

interface TabAngleTitlesProps {
  draft: ArticleDraft;
  onSelectTitle: (title: string, subtitle: string) => void;
}

export function TabAngleTitles({ draft, onSelectTitle }: TabAngleTitlesProps) {
  const [copiedTitleId, setCopiedTitleId] = useState<string | null>(null);

  const handleCopyTitle = (t: TitleOption) => {
    navigator.clipboard.writeText(`${t.title}\n${t.subtitle}`);
    setCopiedTitleId(t.id);
    setTimeout(() => setCopiedTitleId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. Topic Understanding & Editorial Angle */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#426B5A]" />
              <h3 className="text-lg font-semibold text-[#20252D]">
                Topic Understanding & Editorial Angle
              </h3>
            </div>
            <p className="text-xs text-[#687180] mt-0.5">
              Identifies reader intent, prior knowledge, existing content gaps, and original synthesis value before drafting.
            </p>
          </div>
          <span className="text-xs text-[#426B5A] bg-[#EAF2ED] border border-[#C8DCD1] px-2.5 py-1 rounded-lg self-start sm:self-auto font-medium">
            Research-First Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recommended Angle */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 md:col-span-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#426B5A] mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Angle (Honest Thesis)</span>
              </div>
              <span className="text-[10px] text-[#89919E] font-medium">Pre-Drafting Foundation</span>
            </div>
            <p className="text-sm sm:text-base text-[#20252D] font-medium leading-relaxed">
              {draft.angle.honestAngle}
            </p>
          </div>

          {/* Explicit Reader Promise */}
          <div className="bg-[#FAFBFC] border border-[#E6E9ED] rounded-xl p-5 md:col-span-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#3F647E] mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-[#3F647E]" />
                <span className="text-[#3F647E]">Explicit Reader Promise (Concrete Takeaway)</span>
              </div>
              <span className="text-[10px] text-[#426B5A] font-medium">Zero Fluff Guarantee</span>
            </div>
            <p className="text-sm sm:text-base text-[#20252D] font-normal leading-relaxed">
              {draft.angle.readerPromise ||
                draft.angle.articleUniqueValue ||
                "Walk away with a concrete decision framework, verified empirical numbers, and an honest operational blueprint that bypasses common failure modes."}
            </p>
          </div>

          {/* Reader Problem & Search Intent */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#3F647E] mb-2">
              <Search className="w-3.5 h-3.5" />
              <span>Reader Search Intent & Actual Problem</span>
            </div>
            <p className="text-xs sm:text-sm text-[#333C48] leading-relaxed">
              {draft.angle.intentAnalysis}
            </p>
          </div>

          {/* Specific Value This Article Adds */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#426B5A] mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Original Editorial Contribution & Unique Value</span>
            </div>
            <p className="text-xs sm:text-sm text-[#333C48] leading-relaxed">
              {draft.angle.articleUniqueValue || "Contributes a practical decision framework, concrete worked examples, and verified evidence to surpass generic web summaries."}
            </p>
          </div>

          {/* What Readers Probably Already Know (Baseline) */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#687180] mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Baseline: What Readers Already Know</span>
            </div>
            <p className="text-xs sm:text-sm text-[#333C48] leading-relaxed">
              {draft.angle.readerPriorKnowledge || "Basic conceptual awareness, but lacks honest operational friction points and empirical cost/time math."}
            </p>
          </div>

          {/* What Existing Articles Commonly Miss (Gap Analysis) */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#687180] mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#B47D18]" />
              <span>Gap Analysis: What Existing Articles Miss</span>
            </div>
            <p className="text-xs sm:text-sm text-[#333C48] leading-relaxed">
              {draft.angle.commonGapsInExistingArticles || "Most articles parrot high-level marketing buzzwords while omitting failure modes, true maintenance costs, and street-level execution trade-offs."}
            </p>
          </div>

          {/* Clickbait Debunked */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B47D18] mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B47D18]" />
              <span>Exaggerated Claims & Clickbait Removed</span>
            </div>
            <p className="text-xs text-[#687180] mb-3">
              Standard algorithmic articles lure readers with unfeasible promises. We eliminated:
            </p>
            <ul className="space-y-1.5">
              {draft.angle.debunkedClickbait.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#333C48]">
                  <span className="text-[#C53929] font-bold shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reddit Community Consensus */}
          <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Community Reality Check</span>
            </div>
            <p className="text-xs sm:text-sm text-[#333C48] leading-relaxed mb-3">
              {draft.angle.redditConsensus}
            </p>
            {draft.redditSubreddits && draft.redditSubreddits.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-[#687180] pt-2 border-t border-[#E6E9ED]">
                <span>Communities Scanned:</span>
                {draft.redditSubreddits.map((sub, i) => (
                  <span key={i} className="text-[#20252D] font-mono text-[11px]">
                    {sub}{i < draft.redditSubreddits!.length - 1 ? " ·" : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 3 SEO Title Options Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#20252D]">
              3 SEO Title & Subtitle Options
            </h3>
            <p className="text-xs text-[#687180] mt-0.5">
              Optimized for Medium search distribution, high reader CTR, and zero policy-violating clickbait.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {draft.titleOptions.map((t, index) => {
            const isSelected = draft.selectedTitle === t.title;

            return (
              <div
                key={t.id || index}
                className={`p-5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-[#FAFBFC] border-[#426B5A] ring-1 ring-[#426B5A]/20 shadow-xs"
                    : "bg-white border-[#E6E9ED] hover:border-[#D1D7E0]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs text-[#687180]">
                      <span className="font-mono text-[#426B5A] font-semibold">Option {index + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#20252D] font-medium">{t.typeLabel}</span>
                      {isSelected && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#2E7D5B] font-medium">Active Article Title</span>
                        </>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-[#20252D] tracking-tight">
                      {t.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-[#687180]">
                      {t.subtitle}
                    </p>

                    {t.seoKeywords && t.seoKeywords.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-[#89919E] pt-1">
                        <span>Keywords:</span>
                        {t.seoKeywords.map((kw, i) => (
                          <span key={i} className="text-[#687180] font-mono text-[11px]">
                            #{kw}{i < t.seoKeywords.length - 1 ? " ·" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectTitle(t.title, t.subtitle)}
                      className={`w-full text-xs font-medium px-3.5 py-1.5 rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#426B5A] text-white border-[#426B5A] font-medium shadow-xs"
                          : "bg-white text-[#20252D] border-[#E6E9ED] hover:bg-[#F7F8FA]"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Use This Title</span>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyTitle(t)}
                      className="text-xs text-[#89919E] hover:text-[#20252D] p-1.5 rounded-md hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                      title="Copy title and subtitle"
                    >
                      {copiedTitleId === t.id ? (
                        <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
