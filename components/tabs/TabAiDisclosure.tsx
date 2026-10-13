"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Copy,
  Check,
  FileText,
  CheckCircle2,
  Scale,
  Award,
} from "lucide-react";
import { ArticleDraft } from "@/types/article";

interface TabAiDisclosureProps {
  draft: ArticleDraft;
}

export function TabAiDisclosure({ draft }: TabAiDisclosureProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const disclosures = [
    {
      id: "intro",
      badge: "Official Medium Rule",
      title: "Opening Paragraph Disclosure (Mandatory Placement)",
      text: draft.aiDisclosure || "Disclosure: AI assistance was used for initial search aggregation and Reddit community synthesis; all arguments, calculations, and conclusions were independently reviewed and verified by the author.",
      placement: "Add within the first two paragraphs (directly below subtitle or opening hook) to comply with official Medium Help Center rules.",
    },
    {
      id: "publication",
      badge: "Editorial Grade",
      title: "Comprehensive Transparency Disclosure (For Curated Publications)",
      text: "Transparency Disclosure: In strict compliance with Medium's distribution standards, this article used AI research tools to query recent official documentation and synthesize public Reddit discussions. The thesis, structure, voice editing, mathematical checks, and conclusions were independently authored and verified by the human writer.",
      placement: "Recommended when submitting to curated Medium publications or editors.",
    },
    {
      id: "footer",
      badge: "Footer Note",
      title: "1-Line Secondary Footer Disclosure",
      text: "Note: Researched with AI analysis of public web benchmarks and Reddit forums; fully fact-checked, edited, and authored by the writer.",
      placement: "Add as an italicized line at the very bottom of your Medium story in addition to the opening note.",
    },
    {
      id: "commercial",
      badge: "Policy Safe",
      title: "Commercial & Promotional Neutrality Statement",
      text: "Editorial Independence: This article contains no sponsored placements or affiliate kickbacks. All product benchmarks, tool mentions, and community threads are cited solely on editorial merit and verified public documentation.",
      placement: "Add alongside the disclosure note if mentioning specific tools or SaaS platforms.",
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#426B5A]" />
          <h3 className="text-lg font-semibold text-[#20252D]">
            Policy-Safe AI & Research Disclosure Statements
          </h3>
        </div>
        <p className="text-xs text-[#687180] mt-0.5">
          Medium requires writers to disclose when AI assistance was utilized. Including this truthful statement protects your story from algorithmic suppression and preserves Boost eligibility.
        </p>
      </div>

      {/* Guidelines Reminder Card */}
      <div className="bg-[#EAF2ED] border border-[#C8DCD1] rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-[#2E7D5B] shrink-0 mt-0.5" />
        <div className="text-xs text-[#20252D] space-y-1">
          <div className="font-semibold text-[#2E7D5B] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Official Medium Partner Program & Boost Rules (May 1, 2024)</span>
          </div>
          <p className="text-[#4F5866] leading-relaxed">
            Per Medium&apos;s Official AI Guidelines, stories assisted by AI research tools are permitted behind the Partner Program paywall provided they feature substantive human authoring and clear disclosure <strong className="text-[#20252D]">within the first two paragraphs</strong>. Fully automated AI-generated stories (without human authoring) cannot be paywalled and are excluded from Boost curation.
          </p>
        </div>
      </div>

      {/* Disclosure Options */}
      <div className="space-y-4">
        {disclosures.map((d) => (
          <div
            key={d.id}
            className="bg-white border border-[#E6E9ED] rounded-xl p-5 hover:border-[#D1D6DE] transition-colors shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#20252D]">
                  {d.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF2ED] text-[#426B5A] border border-[#C8DCD1]">
                  {d.badge}
                </span>
              </div>
              <span className="text-[11px] text-[#687180]">
                {d.placement}
              </span>
            </div>

            <div className="p-3.5 bg-[#FAFBFC] rounded-lg border border-[#E6E9ED] font-sans text-xs sm:text-sm text-[#20252D] leading-relaxed mb-3 select-all">
              &ldquo;{d.text}&rdquo;
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleCopy(d.id, d.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFBFC] hover:bg-[#F0F3F5] text-[#20252D] hover:text-[#426B5A] rounded-lg text-xs font-medium border border-[#E6E9ED] transition-colors cursor-pointer"
              >
                {copiedKey === d.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                    <span className="text-[#2E7D5B]">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#687180]" />
                    <span>Copy Disclosure Line</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Policy Safeguards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 bg-white border border-[#E6E9ED] rounded-xl text-xs space-y-1 shadow-2xs">
          <div className="font-semibold text-[#20252D] flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-[#426B5A]" />
            <span>Anti-Plagiarism</span>
          </div>
          <p className="text-[11px] text-[#687180] leading-relaxed">
            Zero whole-sentence scraping. Sources are paraphrased and synthesized in your independent editorial voice.
          </p>
        </div>

        <div className="p-3.5 bg-white border border-[#E6E9ED] rounded-xl text-xs space-y-1 shadow-2xs">
          <div className="font-semibold text-[#20252D] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D5B]" />
            <span>Zero Hallucinations</span>
          </div>
          <p className="text-[11px] text-[#687180] leading-relaxed">
            All primary numbers, policy dates, and forum threads are verified against live search benchmarks.
          </p>
        </div>

        <div className="p-3.5 bg-white border border-[#E6E9ED] rounded-xl text-xs space-y-1 shadow-2xs">
          <div className="font-semibold text-[#20252D] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#4A6572]" />
            <span>Humanized Rhythm</span>
          </div>
          <p className="text-[11px] text-[#687180] leading-relaxed">
            Short 1-3 line paragraphs, street-level vocabulary, and conversational flow without synthetic clichés.
          </p>
        </div>
      </div>
    </div>
  );
}
