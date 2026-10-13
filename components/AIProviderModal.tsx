"use client";

import React, { useState } from "react";
import { X, Cpu, Check, Key, Globe, ShieldCheck } from "lucide-react";
import { AIProvider, AIProviderConfig } from "@/lib/ai-provider";

interface AIProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (newConfig: AIProviderConfig) => void;
}

export function AIProviderModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: AIProviderModalProps) {
  const [provider, setProvider] = useState<AIProvider>(config.provider || "gemini");
  const [customApiKey, setCustomApiKey] = useState(config.customApiKey || "");
  const [customBaseUrl, setCustomBaseUrl] = useState(config.customBaseUrl || "");
  const [customModel, setCustomModel] = useState(config.customModel || "");

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      customApiKey: customApiKey.trim() || undefined,
      customBaseUrl: customBaseUrl.trim() || undefined,
      customModel: customModel.trim() || undefined,
    });
    onClose();
  };

  const providersList = [
    {
      id: "gemini" as AIProvider,
      name: "Google Gemini 3.8 Flash",
      badge: "Default & Recommended",
      desc: "Live Google Search Grounding for fresh data & Reddit community quotes.",
      status: "Pre-configured & Ready",
    },
    {
      id: "deepseek" as AIProvider,
      name: "DeepSeek V3 (DeepSeek Chat)",
      badge: "Server Key Loaded",
      desc: "High-reasoning, low-cost open model with deep technical and analytical writing capability.",
      status: "Server Key Loaded (sk-55eee1...)",
    },
    {
      id: "deepseek_r1" as AIProvider,
      name: "DeepSeek R1 (DeepSeek Reasoner)",
      badge: "Deep Reasoning",
      desc: "Chain-of-thought mathematical and logical analysis engine.",
      status: "Server Key Loaded (sk-55eee1...)",
    },
    {
      id: "openai" as AIProvider,
      name: "ChatGPT / OpenAI (GPT-4o)",
      badge: "OpenAI API",
      desc: "Conversational model for humanized Medium essays.",
      status: "Requires OpenAI Key",
    },
    {
      id: "custom" as AIProvider,
      name: "Custom OpenAI-Compatible API (BYOK)",
      badge: "OpenRouter / Groq / Local",
      desc: "Connect any custom OpenAI-compatible endpoint with your own API key & base URL.",
      status: "Custom Endpoint",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#20252D]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E6E9ED] rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF2ED] border border-[#C8DCD1] flex items-center justify-center text-[#426B5A]">
              <Cpu className="w-4 h-4 text-[#426B5A]" />
            </div>
            <h3 className="font-semibold text-[#20252D] text-base">
              AI Model & Provider Settings
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
          <div className="p-3.5 bg-[#EAF2ED] border border-[#C8DCD1] rounded-xl flex items-start gap-2.5 text-xs text-[#20252D]">
            <ShieldCheck className="w-4 h-4 text-[#426B5A] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#426B5A]">Dual Active Support:</span> Both{" "}
              <strong className="text-[#20252D]">Google Gemini</strong> (with live search grounding) and{" "}
              <strong className="text-[#20252D]">DeepSeek AI</strong> (server key{" "}
              <span className="font-mono text-[#426B5A]">sk-55eee1...</span>) are pre-configured.
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-[#20252D] block">
              Select Active Generation & Editing Engine:
            </span>

            {providersList.map((p) => {
              const isSelected = provider === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#EAF2ED]/50 border-[#426B5A] ring-1 ring-[#426B5A]/30"
                      : "bg-white border-[#E6E9ED] hover:border-[#D1D6DE]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#20252D]">
                          {p.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F3F5] text-[#687180] font-mono">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#687180] leading-relaxed">
                        {p.desc}
                      </p>
                      <div className="text-[10px] text-[#2E7D5B] font-medium pt-0.5">
                        ✓ {p.status}
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#426B5A] bg-[#426B5A] text-white"
                            : "border-[#D1D6DE]"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom API Key input (for DeepSeek custom key, OpenAI, or BYOK endpoints) */}
          {(provider === "openai" || provider === "custom" || provider === "deepseek" || provider === "deepseek_r1") && (
            <div className="p-4 bg-[#FAFBFC] rounded-xl border border-[#E6E9ED] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#20252D] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#426B5A]" />
                  <span>
                    {provider.startsWith("deepseek")
                      ? "DeepSeek Key (Optional Override)"
                      : "API Key (Sent only via secure server proxy)"}
                  </span>
                </span>
                {provider.startsWith("deepseek") && !customApiKey && (
                  <span className="text-[10px] text-[#2E7D5B] font-medium">
                    Using Pre-configured Server Key
                  </span>
                )}
              </div>

              <div>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder={
                    provider.startsWith("deepseek")
                      ? "sk-55eee166... (Preconfigured default active)"
                      : "sk-..."
                  }
                  className="w-full px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A] font-mono"
                />
              </div>

              {provider === "custom" && (
                <>
                  <div>
                    <label className="block text-[11px] text-[#687180] mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>Custom Base URL</span>
                    </label>
                    <input
                      type="text"
                      value={customBaseUrl}
                      onChange={(e) => setCustomBaseUrl(e.target.value)}
                      placeholder="https://openrouter.ai/api/v1"
                      className="w-full px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#687180] mb-1">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                      className="w-full px-3 py-2 bg-white border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A] font-mono"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E9ED] bg-[#FAFBFC] flex items-center justify-between">
          <span className="text-[11px] text-[#687180]">
            Active: <strong className="text-[#20252D]">{provider}</strong>
          </span>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#426B5A] hover:bg-[#345545] text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Apply Model Provider
          </button>
        </div>
      </div>
    </div>
  );
}
