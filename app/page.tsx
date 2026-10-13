"use client";

import React, { useState, useRef, useMemo } from "react";
import { Header } from "@/components/Header";
import { InputSection } from "@/components/InputSection";
import { GenerationTracker, PipelineStep } from "@/components/GenerationTracker";
import { OutputDashboard } from "@/components/OutputDashboard";
import { DraftsHistoryModal } from "@/components/DraftsHistoryModal";
import { PolicyGuideModal } from "@/components/PolicyGuideModal";
import { AuthModal } from "@/components/AuthModal";
import { FolderManagerModal } from "@/components/FolderManagerModal";
import { AIProviderModal } from "@/components/AIProviderModal";
import { SAMPLE_INITIAL_DRAFT } from "@/constants/sample-draft";
import { ArticleDraft, GenerateArticleResponse } from "@/types/article";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AIProviderConfig } from "@/lib/ai-provider";
import { Sparkles, AlertCircle, RefreshCw, BookOpen, ShieldCheck, Flame, Cpu } from "lucide-react";

function HomeContent() {
  const { user, folders, savedArticles, saveArticleToCloud, deleteArticleFromCloud, toggleFavoriteArticle } = useAuth();

  // Basic generation inputs
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("Beginners who want honest, practical guidance");
  const [tone, setTone] = useState("Conversational & Candid");
  const [redditFocus, setRedditFocus] = useState("r/technology, r/productivity, r/entrepreneur");

  // Advanced generation options
  const [focusKeywords, setFocusKeywords] = useState("");
  const [audienceKnowledgeLevel, setAudienceKnowledgeLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [audienceInterests, setAudienceInterests] = useState("");

  // AI Provider & Key Configuration
  const [providerConfig, setProviderConfig] = useState<AIProviderConfig>(() => {
    if (typeof window === "undefined") return { provider: "gemini" };
    try {
      const stored = localStorage.getItem("medium_ai_provider_config");
      if (stored) return JSON.parse(stored);
    } catch {}
    return { provider: "gemini" };
  });

  // Pipeline execution state
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStep>("completed");
  const [progressPercent, setProgressPercent] = useState(100);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentDraft, setCurrentDraft] = useState<ArticleDraft | null>(SAMPLE_INITIAL_DRAFT);
  const [localDrafts, setLocalDrafts] = useState<ArticleDraft[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("medium_agent_drafts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Modal visibility states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isAIProviderOpen, setIsAIProviderOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeProviderName = useMemo(() => {
    switch (providerConfig.provider) {
      case "deepseek":
        return "DeepSeek V3";
      case "deepseek_r1":
        return "DeepSeek R1";
      case "openai":
        return "ChatGPT 4o";
      case "custom":
        return "Custom BYOK";
      default:
        return "Gemini 3.8";
    }
  }, [providerConfig.provider]);

  // Merge cloud articles and local drafts deduplicated by ID
  const allDrafts = useMemo(() => {
    const map = new Map<string, ArticleDraft>();
    localDrafts.forEach((d) => map.set(d.id, d));
    savedArticles.forEach((d) => map.set(d.id, d));
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }, [localDrafts, savedArticles]);

  const handleSaveAIConfig = (newCfg: AIProviderConfig) => {
    setProviderConfig(newCfg);
    try {
      localStorage.setItem("medium_ai_provider_config", JSON.stringify(newCfg));
    } catch {}
  };

  const saveToLocalAndCloud = (draftToSave: ArticleDraft) => {
    const existingIndex = localDrafts.findIndex((d) => d.id === draftToSave.id);
    let updatedLocal: ArticleDraft[];
    if (existingIndex >= 0) {
      updatedLocal = [...localDrafts];
      updatedLocal[existingIndex] = draftToSave;
    } else {
      updatedLocal = [draftToSave, ...localDrafts];
    }
    setLocalDrafts(updatedLocal);
    try {
      localStorage.setItem("medium_agent_drafts", JSON.stringify(updatedLocal));
    } catch {}

    if (user) {
      saveArticleToCloud(draftToSave).catch((err) => {
        console.warn("Could not save to Firebase cloud:", err);
      });
    }
  };

  const handleDeleteDraft = (id: string) => {
    const updated = localDrafts.filter((d) => d.id !== id);
    setLocalDrafts(updated);
    try {
      localStorage.setItem("medium_agent_drafts", JSON.stringify(updated));
    } catch {}

    if (user) {
      deleteArticleFromCloud(id).catch((err) => {
        console.warn("Could not delete from Firebase cloud:", err);
      });
    }
  };

  const handleSelectDraft = (draft: ArticleDraft) => {
    setCurrentDraft(draft);
    setTopic(draft.topic);
    setAudience(draft.audience);
    if (draft.focusKeywords) setFocusKeywords(draft.focusKeywords);
    if (draft.tone) setTone(draft.tone);
    if (draft.audienceKnowledgeLevel) setAudienceKnowledgeLevel(draft.audienceKnowledgeLevel);
    if (draft.audienceInterests) setAudienceInterests(draft.audienceInterests);
  };

  const handleToggleFavoriteInModal = async (articleId: string) => {
    const target = allDrafts.find((d) => d.id === articleId);
    if (!target) return;
    const updated = { ...target, isFavorite: !target.isFavorite };
    saveToLocalAndCloud(updated);
    if (currentDraft && currentDraft.id === articleId) {
      setCurrentDraft(updated);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentStep("intent");
    setProgressPercent(12);

    if (timerRef.current) clearInterval(timerRef.current);

    let progress = 12;
    timerRef.current = setInterval(() => {
      progress += 2.5;
      if (progress < 22) {
        setCurrentStep("intent");
      } else if (progress < 42) {
        setCurrentStep("research");
      } else if (progress < 62) {
        setCurrentStep("reddit");
      } else if (progress < 80) {
        setCurrentStep("drafting");
      } else if (progress < 92) {
        setCurrentStep("factcheck");
      } else if (progress < 98) {
        setCurrentStep("policy_audit");
      }

      setProgressPercent(Math.min(98, progress));
    }, 900);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience,
          tone,
          redditFocus,
          focusKeywords,
          audienceKnowledgeLevel,
          audienceInterests,
          providerConfig,
        }),
      });

      const data: GenerateArticleResponse = await res.json();

      if (!res.ok || !data.success || !data.draft) {
        throw new Error(data.error || "Failed to generate article from server.");
      }

      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentStep("completed");
      setProgressPercent(100);

      setCurrentDraft(data.draft);
      saveToLocalAndCloud(data.draft);
    } catch (err: unknown) {
      console.error("Article generation failed:", err);
      if (timerRef.current) clearInterval(timerRef.current);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while communicating with the research agent."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#20252D] flex flex-col selection:bg-[#EAF2ED] selection:text-[#426B5A]">
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        draftsCount={allDrafts.length}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenFolders={() => setIsFoldersOpen(true)}
        foldersCount={folders.length}
        onOpenAIProvider={() => setIsAIProviderOpen(true)}
        activeProviderName={activeProviderName}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Editorial Hero Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#20252D] tracking-tight">
              Research & Article Workspace
            </h1>

            <button
              onClick={() => setIsAIProviderOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#F0F3F5] border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] transition-colors self-start sm:self-auto cursor-pointer shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-[#426B5A]" />
              <span className="text-[#687180]">Engine:</span>
              <strong className="font-semibold text-[#20252D]">{activeProviderName}</strong>
              <span className="text-[11px] text-[#426B5A] font-medium ml-1">Configure</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#687180] max-w-3xl leading-relaxed">
            Generate research-backed, policy-safe 1,400–1,900 word Medium articles grounded in live web citations and authentic community sentiment.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#687180] mt-3 pt-1 font-medium">
            <span className="flex items-center gap-1 text-[#20252D]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#426B5A]" />
              <span>Strict Anti-Cliché Filter</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Real Reddit Discussions</span>
            <span aria-hidden="true">·</span>
            <span>Claim-Level Fact Verification</span>
            <span aria-hidden="true">·</span>
            <span>Medium Partner Policy Audit</span>
          </div>
        </div>

        {/* Input Section */}
        <InputSection
          topic={topic}
          setTopic={setTopic}
          audience={audience}
          setAudience={setAudience}
          tone={tone}
          setTone={setTone}
          redditFocus={redditFocus}
          setRedditFocus={setRedditFocus}
          focusKeywords={focusKeywords}
          setFocusKeywords={setFocusKeywords}
          audienceKnowledgeLevel={audienceKnowledgeLevel}
          setAudienceKnowledgeLevel={setAudienceKnowledgeLevel}
          audienceInterests={audienceInterests}
          setAudienceInterests={setAudienceInterests}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-[#FDF2F2] border border-[#F5C2C2] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#C53929]">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#C53929] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#A82A1C]">Generation Notice:</span> {errorMessage}
                {currentDraft && (
                  <p className="text-[#687180] text-xs mt-0.5">
                    Your previous research draft was safely preserved below.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C53929] hover:bg-[#A82A1C] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Generation</span>
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="px-2.5 py-1.5 text-[#687180] hover:text-[#20252D] text-xs rounded-lg cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Generation Progress Tracker */}
        {(isLoading || (currentStep !== "completed" && currentDraft)) && (
          <GenerationTracker
            currentStep={currentStep}
            progressPercent={progressPercent}
          />
        )}

        {/* Output Dashboard (5 Tabs + Rich In-App Editor) */}
        {currentDraft && !isLoading && (
          <OutputDashboard
            draft={currentDraft}
            onUpdateDraft={(updated) => setCurrentDraft(updated)}
            onSaveToHistory={saveToLocalAndCloud}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E9ED] bg-white py-6 text-xs text-[#687180] mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#20252D]">Medium AI Research & Article Agent</span>
            <span aria-hidden="true">·</span>
            <span>Policy-Safe Editorial Workspace</span>
          </div>
          <div className="text-[#89919E]">
            Fact-checked research · Reddit street sentiment · Medium Partner Program compliant
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DraftsHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        drafts={allDrafts}
        onSelectDraft={handleSelectDraft}
        onDeleteDraft={handleDeleteDraft}
        onToggleFavorite={handleToggleFavoriteInModal}
      />

      <FolderManagerModal
        isOpen={isFoldersOpen}
        onClose={() => setIsFoldersOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <PolicyGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <AIProviderModal
        isOpen={isAIProviderOpen}
        onClose={() => setIsAIProviderOpen(false)}
        config={providerConfig}
        onSaveConfig={handleSaveAIConfig}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
