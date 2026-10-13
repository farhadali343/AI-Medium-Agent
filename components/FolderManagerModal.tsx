"use client";

import React, { useState } from "react";
import { X, Folder as FolderIcon, Plus, Trash2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFolderId?: string;
  onSelectFolderFilter?: (folderId: string | undefined) => void;
}

const PRESET_COLORS = [
  "#426B5A", // accent green
  "#2E7D5B", // emerald
  "#3B82F6", // blue
  "#7C3AED", // purple
  "#B47D18", // amber
  "#C53929", // red
  "#0891B2", // cyan
];

export function FolderManagerModal({
  isOpen,
  onClose,
  selectedFolderId,
  onSelectFolderFilter,
}: FolderManagerModalProps) {
  const { folders, createFolder, deleteFolder } = useAuth();
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await createFolder(newFolderName.trim(), selectedColor);
      setNewFolderName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#20252D]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E6E9ED] rounded-xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF2ED] border border-[#C8DCD1] flex items-center justify-center text-[#426B5A]">
              <FolderIcon className="w-4 h-4 text-[#426B5A]" />
            </div>
            <h3 className="font-semibold text-[#20252D] text-base">
              Article Folders
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
        <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-white">
          {/* Create New Folder Form */}
          <form onSubmit={handleCreate} className="space-y-3 bg-[#FAFBFC] p-4 rounded-xl border border-[#E6E9ED]">
            <span className="text-xs font-semibold text-[#20252D] block">
              Create New Folder
            </span>

            {error && (
              <div className="p-2 bg-[#FDF2F2] text-[#C53929] border border-[#F5C2C2] rounded text-xs">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name (e.g. Case Studies, AI Tools)"
                className="w-full px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A] placeholder-[#89919E]"
              />
            </div>

            {/* Color choices */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-[#687180]">Color:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className="w-5 h-5 rounded-full border border-black/10 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c }}
                  >
                    {selectedColor === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newFolderName.trim() || loading}
              className="w-full py-2 bg-[#426B5A] hover:bg-[#345545] text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{loading ? "Creating..." : "Add Folder"}</span>
            </button>
          </form>

          {/* Existing Folders List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#20252D] block">
              Your Folders ({folders.length})
            </span>

            {folders.length === 0 ? (
              <p className="text-xs text-[#687180] py-3 text-center">
                No folders created yet. Create your first folder to organize your articles.
              </p>
            ) : (
              <div className="space-y-1.5">
                {folders.map((f) => {
                  const isSelected = selectedFolderId === f.id;

                  return (
                    <div
                      key={f.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-[#EAF2ED]/60 border-[#C8DCD1]"
                          : "bg-white border-[#E6E9ED] hover:border-[#D1D6DE]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectFolderFilter) {
                            onSelectFolderFilter(isSelected ? undefined : f.id);
                          }
                          onClose();
                        }}
                        className="flex items-center gap-2.5 flex-1 text-left cursor-pointer"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: f.color }}
                        />
                        <span className="text-xs font-medium text-[#20252D]">
                          {f.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-[#426B5A] font-medium">
                            (Active Filter)
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteFolder(f.id)}
                        className="p-1.5 text-[#89919E] hover:text-[#C53929] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer"
                        title="Delete Folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
