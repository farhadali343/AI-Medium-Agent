"use client";

import React, { useState } from "react";
import Markdown from "react-markdown";
import { Copy, Check, Eye, FileText, Edit3, ShieldCheck, AlertCircle } from "lucide-react";
import { ArticleDraft } from "@/types/article";
import { auditAntiAiText, calculateReadingStats } from "@/lib/anti-ai-scanner";
import { RichArticleEditor } from "@/components/RichArticleEditor";

interface TabFullArticleProps {
  draft: ArticleDraft;
  onUpdateContent?: (newMarkdown: string) => void;
}

export function TabFullArticle({ draft, onUpdateContent }: TabFullArticleProps) {
  const [viewMode, setViewMode] = useState<"preview" | "raw" | "edit">("preview");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [copied, setCopied] = useState(false);
  const [localEdit, setLocalEdit] = useState<string | null>(null);

  const markdownContent = localEdit !== null ? localEdit : draft.contentMarkdown;

  const stats = calculateReadingStats(markdownContent);
  const antiAiCheck = auditAntiAiText(markdownContent);

  const handleCopyMarkdown = () => {
    const fullTextToCopy = `# ${draft.selectedTitle}\n\n## ${draft.selectedSubtitle}\n\n${markdownContent}\n\n---\n*${draft.aiDisclosure}*`;
    navigator.clipboard.writeText(fullTextToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContentChange = (val: string) => {
    setLocalEdit(val);
    if (onUpdateContent) {
      onUpdateContent(val);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-[#FAFBFC] border border-[#E6E9ED] rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Unboxed Metrics info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#687180] font-medium">
          <span className="font-semibold text-[#20252D] font-mono">
            {stats.wordCount.toLocaleString()} words
          </span>
          <span aria-hidden="true">·</span>
          <span>{stats.readingTimeMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1 text-[#426B5A]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Anti-cliché: {antiAiCheck.bannedWordsCount} flagged</span>
          </span>
        </div>

        {/* Action toggles */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Font switcher */}
          {viewMode === "preview" && (
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-[#E6E9ED]">
              <button
                onClick={() => setFontFamily("serif")}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  fontFamily === "serif"
                    ? "bg-[#EAF2ED] text-[#426B5A] font-serif font-semibold"
                    : "text-[#687180] hover:text-[#20252D] font-serif"
                }`}
                title="Georgia Serif"
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily("sans")}
                className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                  fontFamily === "sans"
                    ? "bg-[#EAF2ED] text-[#426B5A] font-sans font-semibold"
                    : "text-[#687180] hover:text-[#20252D] font-sans"
                }`}
                title="Modern Sans"
              >
                Sans
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-[#E6E9ED]">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                viewMode === "preview"
                  ? "bg-[#EAF2ED] text-[#426B5A] font-medium"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Reader</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                viewMode === "raw"
                  ? "bg-[#EAF2ED] text-[#426B5A] font-medium"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Raw</span>
            </button>
            <button
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors cursor-pointer ${
                viewMode === "edit"
                  ? "bg-[#EAF2ED] text-[#426B5A] font-medium"
                  : "text-[#687180] hover:text-[#20252D]"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#20252D] bg-white hover:bg-[#F0F3F5] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="text-[#2E7D5B]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#687180]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cliché Warning Notice */}
      {antiAiCheck.bannedWordsCount > 0 && (
        <div className="p-3 bg-[#FEF7E8] border border-[#FFE0B2] rounded-lg flex items-start gap-2.5 text-xs text-[#B47D18]">
          <AlertCircle className="w-4 h-4 text-[#B47D18] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Review Clichés:</span> Detected flagged tropes:{" "}
            <span className="font-mono text-[#825405]">{antiAiCheck.detectedBannedWords.join(", ")}</span>.
            Consider replacing with conversational verbs.
          </div>
        </div>
      )}

      {/* Main Content Area - Reader View */}
      {viewMode === "preview" && (
        <article className="bg-white border border-[#E6E9ED] rounded-xl p-8 sm:p-12 md:p-16 max-w-3xl mx-auto shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Article Header (Medium Editorial Style) */}
          <header className="mb-8 pb-6 border-b border-[#E6E9ED]">
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#20252D] tracking-tight leading-[1.25] mb-3 ${
                fontFamily === "serif" ? "font-serif" : "font-sans"
              }`}
            >
              {draft.selectedTitle}
            </h1>
            <p
              className={`text-base sm:text-lg text-[#687180] font-normal leading-relaxed mb-4 ${
                fontFamily === "serif" ? "font-serif" : "font-sans"
              }`}
            >
              {draft.selectedSubtitle}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#89919E] font-medium">
              <span>Editorial Dispatch</span>
              <span aria-hidden="true">·</span>
              <span>{stats.readingTimeMinutes} min read</span>
              <span aria-hidden="true">·</span>
              <span>Prepared for Medium</span>
            </div>
          </header>

          {/* Article Body */}
          <div
            className={`medium-article-prose text-[#20252D] leading-[1.75] text-[16px] sm:text-[17px] ${
              fontFamily === "serif" ? "font-serif" : "font-sans"
            }`}
          >
            <div className="markdown-body space-y-4">
              <Markdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl sm:text-2xl font-bold text-[#20252D] tracking-tight mt-10 mb-3 pt-4 border-t border-[#E6E9ED]">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg sm:text-xl font-semibold text-[#20252D] mt-6 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[#20252D] leading-[1.75] my-3.5">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside pl-5 space-y-1.5 my-3 text-[#20252D]">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside pl-5 space-y-1.5 my-3 text-[#20252D]">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-[1.7] pl-1 text-[16px]">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-5 pl-4 border-l-2 border-[#426B5A] italic text-[#4F5866] py-1 bg-[#FAFBFC] rounded-r-md">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-[#20252D]">{children}</strong>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border border-[#E6E9ED] rounded-lg">
                      <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-[#E6E9ED]">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2.5 bg-[#FAFBFC] font-semibold text-[#20252D]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2.5 text-[#333C48] border-t border-[#E6E9ED]">
                      {children}
                    </td>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#426B5A] hover:text-[#345545] underline underline-offset-2 font-medium transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="bg-[#F0F3F5] px-1.5 py-0.5 rounded text-[#20252D] font-mono text-xs border border-[#E6E9ED]">
                      {children}
                    </code>
                  ),
                }}
              >
                {markdownContent}
              </Markdown>
            </div>
          </div>

          {/* Policy Disclosure Footer */}
          <footer className="mt-12 pt-6 border-t border-[#E6E9ED]">
            <p className="text-xs text-[#687180] italic font-sans leading-relaxed">
              {draft.aiDisclosure}
            </p>
          </footer>
        </article>
      )}

      {/* Raw Markdown View */}
      {viewMode === "raw" && (
        <div className="relative bg-[#FAFBFC] border border-[#E6E9ED] rounded-xl p-5 overflow-hidden font-mono text-xs text-[#20252D]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6E9ED]">
            <span className="text-[#687180] font-medium">Raw Markdown Output</span>
            <button
              onClick={handleCopyMarkdown}
              className="text-xs text-[#426B5A] hover:text-[#345545] flex items-center gap-1 font-medium cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Raw</span>
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[700px] select-all font-mono text-xs text-[#333C48]">
            {`# ${draft.selectedTitle}\n\n## ${draft.selectedSubtitle}\n\n${markdownContent}\n\n---\n*${draft.aiDisclosure}*`}
          </pre>
        </div>
      )}

      {/* Rich In-App Edit View */}
      {viewMode === "edit" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div>
              <span className="text-xs font-semibold text-[#20252D]">
                In-App Rich Text Editor
              </span>
              <p className="text-[11px] text-[#687180]">
                Format sections, rephrase sentences, or refine headings.
              </p>
            </div>
            <button
              onClick={() => setViewMode("preview")}
              className="px-3 py-1.5 bg-[#426B5A] hover:bg-[#345545] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Done & Preview
            </button>
          </div>

          <RichArticleEditor
            draft={draft}
            markdownContent={markdownContent}
            onChangeContent={handleContentChange}
          />
        </div>
      )}
    </div>
  );
}
