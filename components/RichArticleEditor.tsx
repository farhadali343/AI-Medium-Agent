"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  RefreshCw,
  PlusCircle,
  Table as TableIcon,
  MessageSquare,
  Wand2,
} from "lucide-react";
import { ArticleDraft, RephraseResponse, RegenerateSectionResponse } from "@/types/article";

interface RichArticleEditorProps {
  draft: ArticleDraft;
  markdownContent: string;
  onChangeContent: (newContent: string) => void;
}

export function RichArticleEditor({
  draft,
  markdownContent,
  onChangeContent,
}: RichArticleEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rephrasing states
  const [selectedText, setSelectedText] = useState("");
  const [rephraseStyle, setRephraseStyle] = useState<
    "conversational" | "punchy" | "humorous" | "authoritative" | "reddit_candid"
  >("conversational");
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [rephraseResult, setRephraseResult] = useState<{
    rephrased: string;
    variations: string[];
  } | null>(null);
  const [showRephrasePanel, setShowRephrasePanel] = useState(false);

  // Section regeneration states
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [regenInstruction, setRegenInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenMessage, setRegenMessage] = useState<string | null>(null);

  // Extract all H2 section headers from markdown
  const h2Sections: string[] = [];
  const lines = markdownContent.split("\n");
  for (const line of lines) {
    if (line.startsWith("## ")) {
      h2Sections.push(line.replace("## ", "").trim());
    }
  }

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = el.value;
    const selection = current.substring(start, end);

    const replacement = `${prefix}${selection || "text"}${suffix}`;
    const updated = current.substring(0, start) + replacement + current.substring(end);
    onChangeContent(updated);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selection.length || 4));
    }, 10);
  };

  const insertInsightBlock = (type: "case_study" | "author_note" | "reddit_quote") => {
    let block = "";
    if (type === "case_study") {
      block = `\n\n> **Author Case Study:** In my own tests during Q1 2025, reaching out to 25 verified users via direct message converted 4 paid pilot accounts, outperforming cold email campaigns.\n\n`;
    } else if (type === "author_note") {
      block = `\n\n*Personal Field Note:* If you find yourself spending more than two days debating database schemas before talking to a single customer, step away from your keyboard and schedule a customer interview.\n\n`;
    } else if (type === "reddit_quote") {
      block = `\n\n> "The day I stopped checking Stripe hourly and started writing helpful documentation for my five existing users was the day retention actually stabilized." — Top retrospective, r/SaaS\n\n`;
    }

    const el = textareaRef.current;
    if (!el) {
      onChangeContent(markdownContent + block);
      return;
    }

    const pos = el.selectionStart || markdownContent.length;
    const updated = markdownContent.substring(0, pos) + block + markdownContent.substring(pos);
    onChangeContent(updated);
  };

  const handleSelectToRephrase = () => {
    const el = textareaRef.current;
    if (el) {
      const sel = el.value.substring(el.selectionStart, el.selectionEnd);
      if (sel.trim()) {
        setSelectedText(sel.trim());
        setShowRephrasePanel(true);
        return;
      }
    }
    setShowRephrasePanel(!showRephrasePanel);
  };

  const executeRephrase = async () => {
    if (!selectedText.trim()) return;
    setIsRephrasing(true);
    setRephraseResult(null);

    try {
      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          style: rephraseStyle,
          topic: draft.topic,
        }),
      });

      const data: RephraseResponse = await res.json();
      if (data.success && data.rephrased) {
        setRephraseResult({
          rephrased: data.rephrased,
          variations: data.variations || [],
        });
      }
    } catch (e) {
      console.error("Rephrase failed:", e);
    } finally {
      setIsRephrasing(false);
    }
  };

  const applyRephrase = (replacement: string) => {
    if (!selectedText) return;
    const el = textareaRef.current;
    if (el && el.value.includes(selectedText)) {
      const updated = el.value.replace(selectedText, replacement);
      onChangeContent(updated);
    } else {
      const updated = markdownContent.replace(selectedText, replacement);
      onChangeContent(updated);
    }
    setRephraseResult(null);
    setSelectedText("");
    setShowRephrasePanel(false);
  };

  const executeRegenerateSection = async () => {
    if (!selectedSection) return;
    setIsRegenerating(true);
    setRegenMessage(null);

    const sectionHeader = `## ${selectedSection}`;
    const startIndex = markdownContent.indexOf(sectionHeader);
    if (startIndex === -1) {
      setIsRegenerating(false);
      setRegenMessage("Could not locate section in current document.");
      return;
    }

    const nextSectionIndex = markdownContent.indexOf("\n## ", startIndex + sectionHeader.length);
    const endIndex = nextSectionIndex !== -1 ? nextSectionIndex : markdownContent.length;
    const currentSectionContent = markdownContent.substring(startIndex, endIndex);

    try {
      const res = await fetch("/api/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: selectedSection,
          currentContent: currentSectionContent,
          articleTopic: draft.topic,
          promptInstruction: regenInstruction,
          tone: draft.tone || "Conversational & Candid",
        }),
      });

      const data: RegenerateSectionResponse = await res.json();
      if (data.success && data.regeneratedMarkdown) {
        const updated =
          markdownContent.substring(0, startIndex) +
          data.regeneratedMarkdown +
          markdownContent.substring(endIndex);
        onChangeContent(updated);
        setRegenMessage(`Successfully refreshed "${selectedSection}"!`);
        setTimeout(() => {
          setRegenMessage(null);
          setShowRegeneratePanel(false);
        }, 2500);
      }
    } catch (e) {
      console.error("Regenerate section failed:", e);
      setRegenMessage("Error during section regeneration. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="bg-white border border-[#E6E9ED] rounded-xl overflow-hidden shadow-xs">
      {/* Rich Editor Toolbar */}
      <div className="p-2.5 bg-[#FAFBFC] border-b border-[#E6E9ED] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting("**", "**")}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*")}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n## ", "\n")}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Heading 2 (## Section)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n### ", "\n")}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Heading 3 (### Sub-section)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n> ", "\n")}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Blockquote (> Quote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n* ", "")}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Bullet list"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("\n1. ", "")}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Numbered list"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertFormatting(
                "\n| Metric | Benchmark | Notes |\n| :--- | :--- | :--- |\n| Phase 1 | Standard | Context |\n"
              )
            }
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-white rounded transition-colors cursor-pointer"
            title="Insert Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-px bg-[#E6E9ED] mx-1" />

          <button
            type="button"
            onClick={() => insertInsightBlock("case_study")}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED] rounded text-xs transition-colors cursor-pointer"
            title="Add your own case study"
          >
            <PlusCircle className="w-3 h-3 text-[#426B5A]" />
            <span>+ Case Study</span>
          </button>

          <button
            type="button"
            onClick={() => insertInsightBlock("reddit_quote")}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED] rounded text-xs transition-colors cursor-pointer"
            title="Add authentic Reddit quote"
          >
            <MessageSquare className="w-3 h-3 text-[#B47D18]" />
            <span>+ Reddit Anecdote</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectToRephrase}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showRephrasePanel
                ? "bg-[#EAF2ED] text-[#426B5A] border-[#C8DCD1]"
                : "bg-white hover:bg-[#F0F3F5] text-[#20252D] border-[#E6E9ED]"
            }`}
          >
            <Wand2 className="w-3 h-3 text-[#426B5A]" />
            <span>Rephrase Sentence</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRegeneratePanel(!showRegeneratePanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showRegeneratePanel
                ? "bg-[#EDF2F4] text-[#4A6572] border-[#D1D6DE]"
                : "bg-white hover:bg-[#F0F3F5] text-[#20252D] border-[#E6E9ED]"
            }`}
          >
            <RefreshCw className="w-3 h-3 text-[#4A6572]" />
            <span>Regenerate Section</span>
          </button>
        </div>
      </div>

      {showRephrasePanel && (
        <div className="p-4 bg-[#FAFBFC] border-b border-[#E6E9ED] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#426B5A] flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Sentence Rephraser (Anti-AI Filtered)</span>
            </span>
            <button
              onClick={() => setShowRephrasePanel(false)}
              className="text-[#687180] hover:text-[#20252D] text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                placeholder="Highlight text in editor or type sentence to rephrase..."
                className="w-full px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={rephraseStyle}
                onChange={(e) => setRephraseStyle(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none cursor-pointer"
              >
                <option value="conversational">Conversational (B1-B2)</option>
                <option value="punchy">Punchy & Short</option>
                <option value="humorous">Wry / Humorous</option>
                <option value="authoritative">Authoritative</option>
                <option value="reddit_candid">Reddit Street-Level</option>
              </select>

              <button
                type="button"
                onClick={executeRephrase}
                disabled={!selectedText.trim() || isRephrasing}
                className="px-3 py-2 bg-[#426B5A] hover:bg-[#345545] text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
              >
                {isRephrasing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                <span>Rewrite</span>
              </button>
            </div>
          </div>

          {rephraseResult && (
            <div className="p-3 bg-white border border-[#C8DCD1] rounded-xl space-y-2 mt-2">
              <div className="text-[11px] font-semibold text-[#426B5A]">
                Recommended Polish:
              </div>
              <div className="p-2.5 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] leading-relaxed flex items-center justify-between gap-3">
                <span>&ldquo;{rephraseResult.rephrased}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => applyRephrase(rephraseResult.rephrased)}
                  className="px-2.5 py-1 bg-[#426B5A] hover:bg-[#345545] text-white font-medium text-xs rounded transition-colors shrink-0 cursor-pointer"
                >
                  Apply in Editor
                </button>
              </div>

              {rephraseResult.variations.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] text-[#687180]">Alternative Takes:</div>
                  {rephraseResult.variations.map((v, i) => (
                    <div
                      key={i}
                      className="p-2 bg-[#FAFBFC] rounded text-xs text-[#4F5866] flex items-center justify-between gap-2"
                    >
                      <span className="line-clamp-2">&ldquo;{v}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => applyRephrase(v)}
                        className="px-2 py-0.5 bg-white hover:bg-[#F0F3F5] text-[#20252D] border border-[#E6E9ED] text-[11px] rounded transition-colors shrink-0 cursor-pointer"
                      >
                        Use This
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showRegeneratePanel && (
        <div className="p-4 bg-[#FAFBFC] border-b border-[#E6E9ED] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4A6572] flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate Specific Section with Custom Focus</span>
            </span>
            <button
              onClick={() => setShowRegeneratePanel(false)}
              className="text-[#687180] hover:text-[#20252D] text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#687180] mb-1">
                Select Section to Rewrite:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none cursor-pointer"
              >
                <option value="">-- Choose an H2 Section --</option>
                {h2Sections.map((sec, idx) => (
                  <option key={idx} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#687180] mb-1">
                Custom Focus / Instructions for this section:
              </label>
              <input
                type="text"
                value={regenInstruction}
                onChange={(e) => setRegenInstruction(e.target.value)}
                placeholder="e.g. Add 2025 data, make tone more skeptical, include Reddit quote"
                className="w-full px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#687180]">
              Preserves the rest of your article while rewriting only this chosen block.
            </span>
            <button
              type="button"
              onClick={executeRegenerateSection}
              disabled={!selectedSection || isRegenerating}
              className="px-4 py-1.5 bg-[#426B5A] hover:bg-[#345545] text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rewriting Section...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Selected Section</span>
                </>
              )}
            </button>
          </div>

          {regenMessage && (
            <div className="p-2.5 bg-[#EAF2ED] border border-[#C8DCD1] text-[#2E7D5B] text-xs rounded-lg">
              {regenMessage}
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-white">
        <textarea
          ref={textareaRef}
          value={markdownContent}
          onChange={(e) => onChangeContent(e.target.value)}
          rows={28}
          className="w-full bg-white font-mono text-xs sm:text-sm text-[#20252D] outline-none focus:ring-0 leading-relaxed resize-y border-0"
          placeholder="Article markdown content..."
        />
      </div>
    </div>
  );
}
