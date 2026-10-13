"use client";

import React from "react";
import { BookOpen, History, HelpCircle, User, Folder as FolderIcon, Cpu, Feather } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  onOpenHistory: () => void;
  draftsCount: number;
  onOpenHelp: () => void;
  onOpenAuth: () => void;
  onOpenFolders: () => void;
  foldersCount: number;
  onOpenAIProvider: () => void;
  activeProviderName: string;
}

export function Header({
  onOpenHistory,
  draftsCount,
  onOpenHelp,
  onOpenAuth,
  onOpenFolders,
  foldersCount,
  onOpenAIProvider,
  activeProviderName,
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="border-b border-[#E6E9ED] bg-white sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EAF2ED] border border-[#C8DCD1] flex items-center justify-center text-[#426B5A] shrink-0">
            <Feather className="w-4 h-4 text-[#426B5A]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[#20252D] tracking-tight text-sm sm:text-base">
              Medium AI Research & Article Agent
            </span>
            <span className="hidden md:inline-block text-[11px] font-medium text-[#687180] px-1.5 py-0.5 rounded bg-[#F0F3F5]">
              Workspace
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Model & Provider Switcher */}
          <button
            onClick={onOpenAIProvider}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs text-[#20252D] bg-[#F7F8FA] hover:bg-[#F0F3F5] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
            title="Configure AI Engine / API Keys"
          >
            <Cpu className="w-3.5 h-3.5 text-[#426B5A]" />
            <span className="font-medium max-w-[100px] truncate">{activeProviderName}</span>
          </button>

          {/* Folders Button */}
          <button
            onClick={onOpenFolders}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs text-[#687180] hover:text-[#20252D] bg-white hover:bg-[#F7F8FA] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
            title="Manage Article Folders"
          >
            <FolderIcon className="w-3.5 h-3.5 text-[#687180]" />
            <span className="hidden sm:inline font-medium">Folders</span>
            {foldersCount > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#F0F3F5] text-[#20252D] font-mono font-medium">
                {foldersCount}
              </span>
            )}
          </button>

          {/* Articles History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-[#687180] hover:text-[#20252D] bg-white hover:bg-[#F7F8FA] border border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
            title="View Saved Articles"
          >
            <History className="w-3.5 h-3.5 text-[#687180]" />
            <span className="hidden sm:inline">Articles</span>
            {draftsCount > 0 && (
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#EAF2ED] text-[#426B5A] font-mono font-semibold">
                {draftsCount}
              </span>
            )}
          </button>

          {/* Policy Guide / Help */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-[#F7F8FA] border border-transparent hover:border-[#E6E9ED] rounded-lg transition-colors cursor-pointer"
            title="Medium Editorial Policy Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile / Auth Button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              user
                ? "bg-[#EAF2ED] border-[#C8DCD1] text-[#426B5A] hover:bg-[#DFECE3]"
                : "bg-[#426B5A] hover:bg-[#345545] text-white border-transparent shadow-sm"
            }`}
          >
            {user ? (
              <>
                <div className="w-4 h-4 rounded-full bg-[#426B5A] text-white flex items-center justify-center text-[10px] font-semibold">
                  {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                </div>
                <span className="max-w-[80px] truncate font-medium">
                  {user.displayName || (user.isAnonymous ? "Guest" : "Account")}
                </span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
