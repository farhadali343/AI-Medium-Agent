"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Download,
  Bookmark,
  Star,
  Folder as FolderIcon,
  Sparkles,
  BookOpen,
  Tag,
  ShieldCheck,
  FileText,
  Compass,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ArticleDraft, Folder } from "@/types/article";
import { TabAngleTitles } from "./tabs/TabAngleTitles";
import { TabFullArticle } from "./tabs/TabFullArticle";
import { TabCommunityInsights } from "./tabs/TabCommunityInsights";
import { TabTagsAndSources } from "./tabs/TabTagsAndSources";
import { TabFactCheck } from "./tabs/TabFactCheck";
import { TabAiDisclosure } from "./tabs/TabAiDisclosure";
import { TabPolicyAudit } from "./tabs/TabPolicyAudit";
import { TabEditorialReview } from "./tabs/TabEditorialReview";
import { PrePublicationWorkflow } from "./PrePublicationWorkflow";
import { useAuth } from "@/context/AuthContext";

export type OutputTab =
  | "angle"
  | "article"
  | "community"
  | "editorial"
  | "tags_sources"
  | "factcheck"
  | "disclosure"
  | "policy_audit";

interface OutputDashboardProps {
  draft: ArticleDraft;
  onUpdateDraft: (updated: ArticleDraft) => void;
  onSaveToHistory: (draft: ArticleDraft) => void;
}

export function OutputDashboard({ draft, onUpdateDraft, onSaveToHistory }: OutputDashboardProps) {
  const { user, folders, toggleFavoriteArticle, assignArticleToFolder, saveArticleToCloud } = useAuth();
  const [activeTab, setActiveTab] = useState<OutputTab>("article");
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedClean, setCopiedClean] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);

  const handleCopyFullArticle = () => {
    const fullArticle = `# ${draft.selectedTitle}\n\n## ${draft.selectedSubtitle}\n\n${draft.contentMarkdown}\n\n---\n*${draft.aiDisclosure}*\n\n---\n**Medium Tags:** ${draft.tags.join(", ")}`;
    navigator.clipboard.writeText(fullArticle);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2500);
  };

  const handleCleanCopy = () => {
    const cleanArticle = `# ${draft.selectedTitle}\n\n${draft.selectedSubtitle}\n\n${draft.contentMarkdown}`;
    navigator.clipboard.writeText(cleanArticle);
    setCopiedClean(true);
    setTimeout(() => setCopiedClean(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const fullArticle = `# ${draft.selectedTitle}\n\n## ${draft.selectedSubtitle}\n\n${draft.contentMarkdown}\n\n---\n*${draft.aiDisclosure}*\n\n---\n**Medium Tags:** ${draft.tags.join(", ")}\n\n## Sources\n${draft.sources.map(s => `- [${s.title}](${s.url}) (${s.domain})`).join("\n")}`;
    const blob = new Blob([fullArticle], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const sanitizedTitle = draft.selectedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    link.href = url;
    link.download = `${sanitizedTitle || "medium-article"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveDraft = async () => {
    onSaveToHistory(draft);
    setSavedLocally(true);

    if (user) {
      try {
        await saveArticleToCloud(draft);
        setCloudSynced(true);
        setTimeout(() => setCloudSynced(false), 2000);
      } catch (e) {
        console.warn("Cloud save error:", e);
      }
    }

    setTimeout(() => setSavedLocally(false), 2000);
  };

  const handleToggleFavorite = async () => {
    const nextFav = !draft.isFavorite;
    const updated = { ...draft, isFavorite: nextFav };
    onUpdateDraft(updated);
    onSaveToHistory(updated);

    if (user) {
      try {
        await toggleFavoriteArticle(draft.id);
      } catch (e) {
        console.warn("Cloud favorite error:", e);
      }
    }
  };

  const handleAssignFolder = async (folderId: string | undefined) => {
    const updated = { ...draft, folderId };
    onUpdateDraft(updated);
    onSaveToHistory(updated);
    setShowFolderMenu(false);

    if (user) {
      try {
        await assignArticleToFolder(draft.id, folderId);
      } catch (e) {
        console.warn("Cloud folder assign error:", e);
      }
    }
  };

  const handleSelectTitle = (title: string, subtitle: string) => {
    const updated = {
      ...draft,
      selectedTitle: title,
      selectedSubtitle: subtitle,
    };
    onUpdateDraft(updated);
    onSaveToHistory(updated);
  };

  const handleUpdateMarkdown = (newMarkdown: string) => {
    const updated = {
      ...draft,
      contentMarkdown: newMarkdown,
    };
    onUpdateDraft(updated);
    onSaveToHistory(updated);
  };

  const currentFolder = folders.find((f) => f.id === draft.folderId);

  const tabs: Array<{
    id: OutputTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: "article", label: "Full Article", icon: BookOpen },
    { id: "angle", label: "Angle & SEO Titles", icon: Compass },
    {
      id: "editorial",
      label: "Editorial Review",
      icon: Sliders,
      badge: "3 PRIORITIES",
    },
    {
      id: "community",
      label: "Community Insights",
      icon: MessageSquare,
      badge: draft.redditResearch?.discussions?.length
        ? `${draft.redditResearch.discussions.length}`
        : undefined,
    },
    { id: "tags_sources", label: "Tags & Sources", icon: Tag },
    {
      id: "factcheck",
      label: "Claim Verification",
      icon: ShieldCheck,
      badge: draft.claimVerificationSummary?.prePublicationWarningActive
        ? `${draft.claimVerificationSummary.unresolvedUnsupportedCount} FLAGGED`
        : draft.factCheck?.length
        ? `${draft.factCheck.length}`
        : undefined,
    },
    { id: "disclosure", label: "AI Disclosure", icon: FileText },
    {
      id: "policy_audit",
      label: "Policy & Risk Audit",
      icon: ShieldAlert,
      badge: draft.policyAudit ? `${draft.policyAudit.overallRisk.toUpperCase()}` : undefined,
    },
  ];

  const overallRisk = draft.policyAudit?.overallRisk || "low";
  const isHumanApproved = draft.humanReviewStatus === "approved_by_human";
  const redditCount = draft.redditResearch?.discussions?.length || 0;

  return (
    <div className="bg-white border border-[#E6E9ED] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden mb-12">
      {/* Top Header Bar with Metrics & Primary Actions */}
      <div className="p-5 sm:p-6 border-b border-[#E6E9ED] bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Unboxed Metadata with Typographic Separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#687180] mb-1.5 font-medium">
            <span>{draft.wordCount.toLocaleString()} words</span>
            <span aria-hidden="true">·</span>
            <span>{draft.readingTimeMinutes} min read</span>

            {redditCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{redditCount} Reddit discussions</span>
              </>
            )}

            <span aria-hidden="true">·</span>
            <span
              className={`font-semibold ${
                overallRisk === "high"
                  ? "text-[#C53929]"
                  : overallRisk === "moderate"
                  ? "text-[#B47D18]"
                  : "text-[#2E7D5B]"
              }`}
            >
              Risk: {overallRisk.toUpperCase()}
            </span>

            {draft.claimVerificationSummary?.prePublicationWarningActive && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#B47D18] font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-[#B47D18]" />
                  <span>{draft.claimVerificationSummary.unresolvedUnsupportedCount} claims need review</span>
                </span>
              </>
            )}

            <span aria-hidden="true">·</span>
            <span className={isHumanApproved ? "text-[#2E7D5B] font-semibold" : "text-[#687180]"}>
              {isHumanApproved
                ? "✓ Human Reviewed"
                : draft.claimVerificationSummary?.prePublicationWarningActive
                ? "Requires claim review"
                : "Ready for Human Review"}
            </span>

            {currentFolder && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 text-[#20252D]">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentFolder.color }}
                  />
                  <span>{currentFolder.name}</span>
                </span>
              </>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-[#20252D] tracking-tight line-clamp-1">
            {draft.selectedTitle}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Favorite Toggle Button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              draft.isFavorite
                ? "bg-[#FEF7E8] text-[#B47D18] border-[#FFE0B2]"
                : "bg-white hover:bg-[#F7F8FA] text-[#89919E] hover:text-[#20252D] border-[#E6E9ED]"
            }`}
            title={draft.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star className={`w-4 h-4 ${draft.isFavorite ? "fill-[#B47D18] text-[#B47D18]" : ""}`} />
          </button>

          {/* Folder Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFolderMenu(!showFolderMenu)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#20252D] bg-white hover:bg-[#F7F8FA] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
              title="Organize in Folder"
            >
              <FolderIcon className="w-3.5 h-3.5 text-[#426B5A]" />
              <span>{currentFolder ? currentFolder.name : "Folder"}</span>
            </button>

            {showFolderMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E6E9ED] rounded-xl shadow-lg p-2 z-30 space-y-1 text-xs animate-fade-in">
                <button
                  type="button"
                  onClick={() => handleAssignFolder(undefined)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    !draft.folderId ? "bg-[#EAF2ED] text-[#426B5A] font-medium" : "text-[#687180] hover:bg-[#F7F8FA]"
                  }`}
                >
                  <span>No Folder</span>
                  {!draft.folderId && <Check className="w-3.5 h-3.5 text-[#426B5A]" />}
                </button>

                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleAssignFolder(f.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      draft.folderId === f.id ? "bg-[#EAF2ED] text-[#426B5A] font-medium" : "text-[#20252D] hover:bg-[#F7F8FA]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                      <span className="truncate">{f.name}</span>
                    </div>
                    {draft.folderId === f.id && <Check className="w-3.5 h-3.5 text-[#426B5A]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save Draft Button */}
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#20252D] bg-white hover:bg-[#F7F8FA] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
            title="Save changes to drafts"
          >
            {savedLocally || cloudSynced ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="text-[#2E7D5B] font-medium">{user ? "Cloud Synced" : "Saved"}</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-[#687180]" />
                <span>Save</span>
              </>
            )}
          </button>

          {/* Download Markdown */}
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#20252D] bg-white hover:bg-[#F7F8FA] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
            title="Download formatted markdown file"
          >
            <Download className="w-3.5 h-3.5 text-[#687180]" />
            <span className="hidden sm:inline">Export .md</span>
          </button>

          {/* Clean Copy Button */}
          <button
            onClick={handleCleanCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#20252D] bg-white hover:bg-[#F7F8FA] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
            title="Copy clean article text ready for Medium editor"
          >
            {copiedClean ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span className="text-[#2E7D5B] font-medium">Clean Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#687180]" />
                <span className="hidden sm:inline">Clean Copy</span>
              </>
            )}
          </button>

          {/* Primary Copy Full Article Button */}
          <button
            onClick={handleCopyFullArticle}
            className="flex items-center gap-2 px-4 py-2 bg-[#426B5A] hover:bg-[#345545] text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            {copiedFull ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied Full Article</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>Copy Full Article</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pre-Publication Workflow & 8-Stage Tracker */}
      <div className="p-5 sm:p-6 pb-2 bg-[#FAFBFC] border-b border-[#E6E9ED]">
        <PrePublicationWorkflow
          draft={draft}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onUpdateDraft={onUpdateDraft}
        />
      </div>

      {/* Understated Segmented Tab Navigation Controls */}
      <div className="border-b border-[#E6E9ED] bg-white px-5 sm:px-6 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-[#426B5A] text-[#426B5A]"
                    : "border-transparent text-[#687180] hover:text-[#20252D] hover:border-[#E6E9ED]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-[#426B5A]" : "text-[#89919E]"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider ${
                      tab.badge.includes("FLAGGED") || tab.badge.includes("HIGH")
                        ? "bg-[#FEF7E8] text-[#B47D18]"
                        : "bg-[#EAF2ED] text-[#426B5A]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-5 sm:p-8 bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "angle" && (
              <TabAngleTitles draft={draft} onSelectTitle={handleSelectTitle} />
            )}

            {activeTab === "article" && (
              <TabFullArticle draft={draft} onUpdateContent={handleUpdateMarkdown} />
            )}

            {activeTab === "editorial" && (
              <TabEditorialReview draft={draft} onUpdateDraft={onUpdateDraft} />
            )}

            {activeTab === "community" && (
              <TabCommunityInsights draft={draft} onUpdateDraft={onUpdateDraft} />
            )}

            {activeTab === "tags_sources" && (
              <TabTagsAndSources draft={draft} />
            )}

            {activeTab === "factcheck" && (
              <TabFactCheck draft={draft} onUpdateDraft={onUpdateDraft} />
            )}

            {activeTab === "disclosure" && (
              <TabAiDisclosure draft={draft} />
            )}

            {activeTab === "policy_audit" && (
              <TabPolicyAudit draft={draft} onUpdateDraft={onUpdateDraft} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
