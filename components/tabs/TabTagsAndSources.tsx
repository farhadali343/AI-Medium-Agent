"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  ExternalLink,
  Copy,
  Check,
  Globe,
  MessageSquare,
  BookOpen,
  FileCheck,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { ArticleDraft, SourceItem } from "@/types/article";

interface TabTagsAndSourcesProps {
  draft: ArticleDraft;
}

type SourceFilter = "all" | "primary" | "studies" | "reddit";

export function TabTagsAndSources({ draft }: TabTagsAndSourcesProps) {
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedIndividualTag, setCopiedIndividualTag] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<SourceFilter>("all");

  const handleCopyAllTags = () => {
    navigator.clipboard.writeText(draft.tags.join(", "));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedIndividualTag(tag);
    setTimeout(() => setCopiedIndividualTag(null), 1500);
  };

  const getSourceIcon = (type: SourceItem["type"]) => {
    switch (type) {
      case "reddit_discussion":
        return <MessageSquare className="w-3.5 h-3.5 text-[#B47D18] shrink-0" />;
      case "regulatory_doc":
      case "primary_official":
        return <FileCheck className="w-3.5 h-3.5 text-[#2E7D5B] shrink-0" />;
      case "original_study":
        return <BookOpen className="w-3.5 h-3.5 text-[#426B5A] shrink-0" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-[#89919E] shrink-0" />;
    }
  };

  const getSourceTypeLabel = (type: SourceItem["type"]) => {
    switch (type) {
      case "primary_official":
        return "Primary / Official Doc";
      case "regulatory_doc":
        return "Regulatory Policy";
      case "original_study":
        return "Original Study";
      case "reddit_discussion":
        return "Reddit Discussion";
      case "web_benchmark":
        return "Benchmark Dataset";
      default:
        return "Secondary Reference";
    }
  };

  const filteredSources = useMemo(() => {
    if (activeFilter === "primary") {
      return draft.sources.filter(
        (s) => s.type === "primary_official" || s.type === "regulatory_doc" || s.verificationConfidence === "confirmed_primary"
      );
    }
    if (activeFilter === "studies") {
      return draft.sources.filter(
        (s) => s.type === "original_study" || s.type === "web_benchmark" || s.type === "reputable_secondary"
      );
    }
    if (activeFilter === "reddit") {
      return draft.sources.filter(
        (s) => s.type === "reddit_discussion" || s.domain.includes("reddit.com")
      );
    }
    return draft.sources;
  }, [draft.sources, activeFilter]);

  const counts = useMemo(() => ({
    all: draft.sources.length,
    primary: draft.sources.filter(
      (s) => s.type === "primary_official" || s.type === "regulatory_doc" || s.verificationConfidence === "confirmed_primary"
    ).length,
    studies: draft.sources.filter(
      (s) => s.type === "original_study" || s.type === "web_benchmark" || s.type === "reputable_secondary"
    ).length,
    reddit: draft.sources.filter(
      (s) => s.type === "reddit_discussion" || s.domain.includes("reddit.com")
    ).length,
  }), [draft.sources]);

  return (
    <div className="space-y-8">
      {/* Research & Grounding Status Banner */}
      <div className="bg-[#EAF2ED] border border-[#C8DCD1] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#C8DCD1] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#426B5A]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#20252D] flex items-center gap-2">
              <span>{draft.researchStatus?.auditLabel || "Research Grounding Active"}</span>
              <span className="text-[10px] text-[#2E7D5B] font-mono px-1.5 py-0.5 rounded bg-white border border-[#C8DCD1]">
                {draft.sources.length} Sources
              </span>
            </div>
            <p className="text-[11px] text-[#4F5866] mt-0.5">
              Multi-tiered source discovery across primary official documentation, empirical benchmark reports, and Reddit forum experiences.
            </p>
          </div>
        </div>

        {draft.researchStatus?.researchDisclaimer && (
          <div className="text-[11px] text-[#825405] bg-[#FEF7E8] border border-[#FFE0B2] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#B47D18] shrink-0" />
            <span>{draft.researchStatus.researchDisclaimer}</span>
          </div>
        )}
      </div>

      {/* Medium Tags Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#426B5A]" />
              <h3 className="text-lg font-semibold text-[#20252D]">
                Recommended Medium Tags (5 Tags)
              </h3>
            </div>
            <p className="text-xs text-[#687180] mt-0.5">
              Paste these into Medium&apos;s story settings to maximize topic tag distribution and audience reach.
            </p>
          </div>

          <button
            onClick={handleCopyAllTags}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F0F3F5] text-[#20252D] text-xs font-medium rounded-lg border border-[#E6E9ED] transition-colors self-start sm:self-auto cursor-pointer"
          >
            {copiedTags ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="text-[#2E7D5B]">Copied All Tags!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#687180]" />
                <span>Copy All 5 Tags</span>
              </>
            )}
          </button>
        </div>

        {/* Tags Display */}
        <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 shadow-2xs">
          <div className="flex flex-wrap gap-2.5">
            {draft.tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyTag(tag)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-[#FAFBFC] border border-[#E6E9ED] hover:border-[#426B5A] hover:bg-[#EAF2ED]/40 text-[#20252D] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Click to copy single tag"
              >
                <span className="text-[#426B5A] font-mono">#{idx + 1}</span>
                <span>{tag}</span>
                {copiedIndividualTag === tag ? (
                  <Check className="w-3 h-3 text-[#2E7D5B]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#89919E] group-hover:text-[#426B5A]" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#E6E9ED] text-[11px] text-[#687180]">
            <span>Tip: Medium allows exactly 5 tags per story. These tags target high-readership topics.</span>
          </div>
        </div>
      </div>

      {/* Verified Sources Directory Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#426B5A]" />
              <h3 className="text-lg font-semibold text-[#20252D]">
                Researched Sources & Community Benchmarks Directory ({draft.sources.length} Sources)
              </h3>
            </div>
            <p className="text-xs text-[#687180] mt-0.5">
              Verified references inspected during research. Categorized into primary docs, benchmark studies, and forum discussions.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#F0F3F5] p-1 rounded-lg self-start sm:self-auto text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeFilter === "all"
                  ? "bg-white text-[#20252D] font-medium shadow-xs"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setActiveFilter("primary")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeFilter === "primary"
                  ? "bg-white text-[#20252D] font-medium shadow-xs"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              Primary ({counts.primary})
            </button>
            <button
              onClick={() => setActiveFilter("studies")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeFilter === "studies"
                  ? "bg-white text-[#20252D] font-medium shadow-xs"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              Studies ({counts.studies})
            </button>
            <button
              onClick={() => setActiveFilter("reddit")}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeFilter === "reddit"
                  ? "bg-white text-[#20252D] font-medium shadow-xs"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              Reddit ({counts.reddit})
            </button>
          </div>
        </div>

        {/* Source Cards */}
        <div className="space-y-3">
          {filteredSources.map((src, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E6E9ED] rounded-xl p-4 hover:border-[#D1D6DE] transition-colors shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#687180]">
                    <span className="font-mono text-[#426B5A] font-semibold">[{idx + 1}]</span>
                    {getSourceIcon(src.type)}
                    <span className="font-mono text-[11px] text-[#20252D] font-medium">{src.domain}</span>
                    {src.publisher && src.publisher !== src.domain && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#687180]">{src.publisher}</span>
                      </>
                    )}
                    {src.publicationDate && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#89919E] flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>{src.publicationDate}</span>
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#FAFBFC] border border-[#E6E9ED] text-[#4F5866]">
                      {getSourceTypeLabel(src.type)}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#20252D]">
                    {src.title}
                  </h4>

                  {src.supportedClaim && (
                    <div className="text-xs text-[#2E7D5B] font-medium pt-0.5">
                      <strong className="text-[#687180]">Validates:</strong> &ldquo;{src.supportedClaim}&rdquo;
                    </div>
                  )}

                  <p className="text-xs text-[#4F5866] leading-relaxed pt-0.5">
                    {src.keyTakeaway}
                  </p>
                </div>

                <div className="shrink-0 self-start sm:self-auto pt-1 sm:pt-0">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#20252D] hover:text-[#426B5A] bg-[#FAFBFC] hover:bg-[#F0F3F5] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3 h-3 text-[#89919E]" />
                  </a>
                </div>
              </div>
            </div>
          ))}

          {filteredSources.length === 0 && (
            <div className="p-8 text-center text-xs text-[#89919E] bg-[#FAFBFC] rounded-xl border border-[#E6E9ED]">
              No sources found in this category filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
