"use client";

import React, { useState } from "react";
import { PenTool, ChevronDown, ChevronUp, SlidersHorizontal, KeyRound, Sparkles, HelpCircle } from "lucide-react";
import { PRESET_TOPICS, PresetTopic } from "@/constants/presets";

interface InputSectionProps {
  topic: string;
  setTopic: (val: string) => void;
  audience: string;
  setAudience: (val: string) => void;
  tone: string;
  setTone: (val: string) => void;
  redditFocus: string;
  setRedditFocus: (val: string) => void;
  focusKeywords: string;
  setFocusKeywords: (val: string) => void;
  audienceKnowledgeLevel: "beginner" | "intermediate" | "advanced";
  setAudienceKnowledgeLevel: (val: "beginner" | "intermediate" | "advanced") => void;
  audienceInterests: string;
  setAudienceInterests: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function InputSection({
  topic,
  setTopic,
  audience,
  setAudience,
  tone,
  setTone,
  redditFocus,
  setRedditFocus,
  focusKeywords,
  setFocusKeywords,
  audienceKnowledgeLevel,
  setAudienceKnowledgeLevel,
  audienceInterests,
  setAudienceInterests,
  onGenerate,
  isLoading,
}: InputSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPreset = (preset: PresetTopic) => {
    setTopic(preset.title);
    setAudience(preset.audience);
    setRedditFocus(preset.redditFocus);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 2000);
    onGenerate();
  };

  return (
    <div className="bg-white border border-[#E6E9ED] rounded-xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] mb-8 transition-shadow">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic-input" className="block text-xs font-semibold text-[#20252D] uppercase tracking-wider mb-2">
            Article Topic or Working Title
          </label>
          <div className="relative">
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What would you like to write about?"
              disabled={isLoading}
              required
              className="w-full px-4 py-3 bg-[#FAFBFC] border border-[#E6E9ED] focus:bg-white focus:border-[#426B5A] focus:ring-1 focus:ring-[#426B5A] rounded-lg text-[#20252D] placeholder-[#89919E] text-base outline-none transition-all disabled:opacity-50"
            />
          </div>
          <p className="text-xs text-[#687180] mt-1.5">
            Enter an angle, thesis, question, or draft headline. The agent inspects live web sources and community discussions.
          </p>
        </div>

        {/* Primary Configuration Row: Audience & Tone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Target Audience */}
          <div>
            <label htmlFor="audience-input" className="block text-xs font-medium text-[#20252D] mb-1.5">
              Target Audience
            </label>
            <input
              id="audience-input"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Beginners who want honest guidance"
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E6E9ED] focus:bg-white focus:border-[#426B5A] focus:ring-1 focus:ring-[#426B5A] rounded-lg text-xs text-[#20252D] placeholder-[#89919E] outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Writing Tone */}
          <div>
            <label className="block text-xs font-medium text-[#20252D] mb-1.5">
              Writing Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E6E9ED] focus:bg-white focus:border-[#426B5A] rounded-lg text-xs text-[#20252D] outline-none cursor-pointer"
            >
              <option value="Conversational & Candid">Conversational & Candid (Recommended)</option>
              <option value="Casual & Humorous">Casual & Humorous (Relatable, witty)</option>
              <option value="Formal & Analytical">Formal & Analytical (Authoritative deep dive)</option>
              <option value="Pragmatic & Investigative">Pragmatic & Investigative (Reality check)</option>
              <option value="First-person Experience Story">First-person Experience Story (Essay)</option>
            </select>
          </div>

          {/* Reader Knowledge Level */}
          <div>
            <label className="block text-xs font-medium text-[#20252D] mb-1.5">
              Knowledge Depth
            </label>
            <select
              value={audienceKnowledgeLevel}
              onChange={(e) => setAudienceKnowledgeLevel(e.target.value as any)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E6E9ED] focus:bg-white focus:border-[#426B5A] rounded-lg text-xs text-[#20252D] outline-none cursor-pointer"
            >
              <option value="beginner">Beginner (Foundations & clear context)</option>
              <option value="intermediate">Intermediate (Practitioner workflows)</option>
              <option value="advanced">Advanced (Deep technical trade-offs)</option>
            </select>
          </div>
        </div>

        {/* Compact Expandable Section: Research Preferences */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#687180] hover:text-[#20252D] transition-colors cursor-pointer py-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#426B5A]" />
            <span>Research preferences</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#89919E]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#89919E]" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-[#F7F8FA] border border-[#E6E9ED] rounded-xl space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Focus Keywords */}
                <div>
                  <label className="block text-xs font-medium text-[#20252D] mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3 h-3 text-[#426B5A]" />
                    <span>Focus Keywords</span>
                  </label>
                  <input
                    type="text"
                    value={focusKeywords}
                    onChange={(e) => setFocusKeywords(e.target.value)}
                    placeholder="e.g. bootstrapped SaaS, conversion rate, churn"
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-white border border-[#E6E9ED] focus:border-[#426B5A] rounded-lg text-xs text-[#20252D] placeholder-[#89919E] outline-none"
                  />
                  <span className="text-[11px] text-[#687180] mt-1 block">
                    Keywords should fit naturally into headlines and narrative sections.
                  </span>
                </div>

                {/* Reddit Subreddits */}
                <div>
                  <label className="block text-xs font-medium text-[#20252D] mb-1">
                    Community Forums (Reddit Subreddits)
                  </label>
                  <input
                    type="text"
                    value={redditFocus}
                    onChange={(e) => setRedditFocus(e.target.value)}
                    placeholder="e.g. r/technology, r/productivity, r/SaaS"
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-white border border-[#E6E9ED] focus:border-[#426B5A] rounded-lg text-xs text-[#20252D] placeholder-[#89919E] outline-none"
                  />
                  <span className="text-[11px] text-[#687180] mt-1 block">
                    Communities scanned for authentic reader questions and terminology.
                  </span>
                </div>
              </div>

              {/* Specific Pain Points / Audience Interests */}
              <div>
                <label className="block text-xs font-medium text-[#20252D] mb-1">
                  Specific Reader Friction Points or Interests
                </label>
                <input
                  type="text"
                  value={audienceInterests}
                  onChange={(e) => setAudienceInterests(e.target.value)}
                  placeholder="e.g. Tired of marketing hype; want honest first-year numbers and failure rates."
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-white border border-[#E6E9ED] focus:border-[#426B5A] rounded-lg text-xs text-[#20252D] placeholder-[#89919E] outline-none"
                />
              </div>

              {/* Quick Topic Inspiration */}
              <div className="pt-2 border-t border-[#E6E9ED]/80">
                <div className="text-[11px] font-medium text-[#687180] mb-2">
                  Sample topics for quick testing:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((p) => {
                    const isCurrent = topic === p.title;
                    return (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        disabled={isLoading}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-[#EAF2ED] text-[#426B5A] border-[#C8DCD1] font-medium"
                            : "bg-white text-[#687180] border-[#E6E9ED] hover:text-[#20252D] hover:bg-[#FAFBFC]"
                        } disabled:opacity-50`}
                      >
                        {p.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Footer */}
        <div className="pt-3 border-t border-[#E6E9ED] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-[#687180] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#426B5A]" />
            <span>Policy-safe 1,400–1,900 words · Grounded sources · Fact-checked</span>
          </div>

          <button
            type="submit"
            disabled={!topic.trim() || isLoading || isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#426B5A] hover:bg-[#345545] active:bg-[#284336] text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-white" />
            <span>{isLoading || isSubmitting ? "Researching & drafting..." : "Generate article"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
