"use client";

import React, { useState } from "react";
import {
  X,
  Trash2,
  BookOpen,
  Clock,
  ArrowRight,
  Star,
  Search,
  Cloud,
} from "lucide-react";
import { ArticleDraft } from "@/types/article";
import { useAuth } from "@/context/AuthContext";

interface DraftsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: ArticleDraft[];
  onSelectDraft: (draft: ArticleDraft) => void;
  onDeleteDraft: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export function DraftsHistoryModal({
  isOpen,
  onClose,
  drafts,
  onSelectDraft,
  onDeleteDraft,
  onToggleFavorite,
}: DraftsHistoryModalProps) {
  const { user, folders } = useAuth();
  const [filterType, setFilterType] = useState<"all" | "favorites" | string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredDrafts = drafts.filter((d) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        d.selectedTitle.toLowerCase().includes(q) ||
        d.topic.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterType === "favorites") {
      return d.isFavorite;
    }
    if (filterType !== "all") {
      return d.folderId === filterType;
    }
    return true;
  });

  const getFolderName = (folderId?: string) => {
    if (!folderId) return null;
    return folders.find((f) => f.id === folderId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#20252D]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E6E9ED] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF2ED] border border-[#C8DCD1] flex items-center justify-center text-[#426B5A]">
              <BookOpen className="w-4 h-4 text-[#426B5A]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#20252D] text-base">
                Article History & Saved Drafts ({drafts.length})
              </h3>
              {user && (
                <span className="flex items-center gap-1 text-[11px] text-[#2E7D5B] font-medium">
                  <Cloud className="w-3 h-3" />
                  <span>Cloud Synced</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-[#F0F3F5] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-[#FAFBFC] border-b border-[#E6E9ED] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#89919E] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, topic, or tag..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A] placeholder-[#89919E]"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none cursor-pointer focus:border-[#426B5A]"
            >
              <option value="all">All Articles</option>
              <option value="favorites">★ Favorites Only</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1 bg-white">
          {filteredDrafts.length === 0 ? (
            <div className="py-12 text-center text-[#687180] space-y-2">
              <BookOpen className="w-8 h-8 text-[#89919E] mx-auto" />
              <p className="text-sm font-medium text-[#20252D]">No articles match your filter.</p>
              <p className="text-xs text-[#687180]">
                Generate an article or adjust your search query.
              </p>
            </div>
          ) : (
            filteredDrafts.map((d) => {
              const folderInfo = getFolderName(d.folderId);

              return (
                <div
                  key={d.id}
                  className="p-4 bg-white border border-[#E6E9ED] hover:border-[#D1D6DE] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#687180]">
                      <Clock className="w-3 h-3 text-[#89919E]" />
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      <span aria-hidden="true">·</span>
                      <span>{d.wordCount} words</span>
                      <span aria-hidden="true">·</span>
                      <span>{d.readingTimeMinutes} min read</span>

                      {folderInfo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 text-[#20252D]">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: folderInfo.color }}
                            />
                            <span>{folderInfo.name}</span>
                          </span>
                        </>
                      )}

                      {d.isFavorite && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#B47D18] flex items-center gap-0.5 font-medium">
                            <Star className="w-3 h-3 fill-[#B47D18]" />
                            <span>Favorite</span>
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-[#20252D] line-clamp-1">
                      {d.selectedTitle}
                    </h4>

                    <p className="text-xs text-[#687180] line-clamp-1">
                      {d.topic}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(d.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          d.isFavorite
                            ? "text-[#B47D18] bg-[#FEF7E8] border-[#FFE0B2]"
                            : "text-[#89919E] hover:text-[#20252D] border-transparent hover:bg-[#F0F3F5]"
                        }`}
                        title={d.isFavorite ? "Unfavorite" : "Favorite"}
                      >
                        <Star className={`w-3.5 h-3.5 ${d.isFavorite ? "fill-[#B47D18]" : ""}`} />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectDraft(d);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#426B5A] text-white hover:bg-[#345545] text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteDraft(d.id)}
                      className="p-1.5 text-[#89919E] hover:text-[#C53929] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
