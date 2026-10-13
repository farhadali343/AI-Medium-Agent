"use client";

import React from "react";
import { X, ShieldCheck, CheckCircle2, AlertOctagon, BookOpen } from "lucide-react";

interface PolicyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyGuideModal({ isOpen, onClose }: PolicyGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#20252D]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E6E9ED] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF2ED] border border-[#C8DCD1] flex items-center justify-center text-[#426B5A]">
              <ShieldCheck className="w-4 h-4 text-[#426B5A]" />
            </div>
            <h3 className="font-semibold text-[#20252D] text-base">
              Medium Editorial Policy & Quality Standards
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-[#F0F3F5] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-[#333C48] bg-white">
          <section className="space-y-2">
            <h4 className="font-semibold text-[#20252D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D5B]" />
              <span>Official Medium Partner Program & AI Rules (2024–2026)</span>
            </h4>
            <div className="space-y-2 text-[#4F5866] leading-relaxed">
              <p>
                <strong className="text-[#20252D]">May 1, 2024 Policy Update:</strong> Medium explicitly prohibits stories with 100% AI-generated writing from being placed behind the Partner Program paywall. Accounts publishing paywalled 100% AI stories face removal from the Partner Program.
              </p>
              <p>
                <strong className="text-[#20252D]">AI-Assisted Writing Permitted with Disclosure:</strong> Stories created with AI assistance (research, outlines, editing, synthesis) are permitted behind the paywall provided the author includes a clear disclosure within the first two paragraphs or before any paywall cutoff.
              </p>
              <p>
                <strong className="text-[#20252D]">Medium Boost Eligibility:</strong> Medium human nominators and curation algorithms prioritize genuine first-person insight, original research, and lived experience. Mass-produced AI drafts or regurgitated summaries are ineligible for Boost distribution.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold text-[#20252D] flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#B47D18]" />
              <span>Strict Anti-AI Word Filtering</span>
            </h4>
            <p className="text-[#4F5866] leading-relaxed">
              Algorithmic detectors and human editors immediately spot robotic prose by scanning for overused LLM clichés. Our engine actively scans and bans words such as:
            </p>
            <div className="p-3 bg-[#FEF7E8] border border-[#FFE0B2] rounded-lg font-mono text-[11px] text-[#825405] leading-relaxed">
              &quot;delve&quot;, &quot;unlock&quot;, &quot;game-changer&quot;, &quot;fast-paced world&quot;, &quot;testament&quot;, &quot;beacon&quot;, &quot;in conclusion&quot;, &quot;tapestry&quot;, &quot;realm&quot;, &quot;spearhead&quot;, &quot;revolutionize&quot;, &quot;seamlessly&quot;, &quot;furthermore&quot;, &quot;moreover&quot;, &quot;vital role&quot;, &quot;paramount&quot;.
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold text-[#20252D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#426B5A]" />
              <span>The 6-Step Agent Pipeline</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[#4F5866]">
              <li><strong className="text-[#20252D]">Understanding Intent:</strong> Stripping guru hype and defining an honest thesis and non-clickbait title options.</li>
              <li><strong className="text-[#20252D]">Web Research Grounding:</strong> Scanning 5–10 primary sources, benchmarks, and official documentation from the last 12 months.</li>
              <li><strong className="text-[#20252D]">Reddit Community Research:</strong> Mining real discussions on targeted subreddits for beginner questions, reported mistakes, friction points, and unvarnished sentiment.</li>
              <li><strong className="text-[#20252D]">Drafting Full Article:</strong> Generating 1,400–1,900 words in plain B1-B2 conversational English with 1–3 sentence paragraphs, comparison tables, and a concrete worked blueprint.</li>
              <li><strong className="text-[#20252D]">Fact-Check Verification:</strong> Cataloging key claims with confidence ratings, source domains, and uncertainty flags.</li>
              <li><strong className="text-[#20252D]">Medium Policy & Editorial Risk Audit:</strong> Auditing the finished article against official Medium rules (Partner Program, copyright, affiliate disclosure, sensationalism) before unlocking Human Review.</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold text-[#20252D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#426B5A]" />
              <span>10 Audit Categories Evaluated</span>
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[#4F5866]">
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">1. Originality & Reader Value</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">2. Plagiarism & Paraphrasing</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">3. AI Disclosure (May 2024 rules)</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">4. Financial/Health/Legal Claims</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">5. Clickbait & Misleading Titles</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">6. Affiliate & Promotional Intent</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">7. Copyright & Quotation Length</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">8. Spam SEO & Low-Value Content</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">9. Citations & Empirical Validity</li>
              <li className="p-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg">10. Partner Program & Platform Rules</li>
            </ul>
          </section>
        </div>

        <div className="p-4 border-t border-[#E6E9ED] bg-[#FAFBFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#426B5A] hover:bg-[#345545] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
