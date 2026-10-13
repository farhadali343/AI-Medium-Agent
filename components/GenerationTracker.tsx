"use client";

import React from "react";
import { Check, Loader2, Compass, Globe, MessageSquare, PenTool, ShieldCheck, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export type PipelineStep = "intent" | "research" | "reddit" | "drafting" | "factcheck" | "policy_audit" | "completed";

interface StepConfig {
  id: PipelineStep;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PIPELINE_STEPS: StepConfig[] = [
  {
    id: "intent",
    label: "Understanding intent",
    description: "Analyzing search intent and formulating an honest thesis",
    icon: Compass,
  },
  {
    id: "research",
    label: "Web research",
    description: "Grounding with verified sources, statistics, and benchmarks",
    icon: Globe,
  },
  {
    id: "reddit",
    label: "Community research",
    description: "Reviewing authentic discussions, friction points, and terminology",
    icon: MessageSquare,
  },
  {
    id: "drafting",
    label: "Drafting article",
    description: "Writing in clear conversational English with strict anti-cliché filters",
    icon: PenTool,
  },
  {
    id: "factcheck",
    label: "Fact-checking",
    description: "Verifying material assertions and cataloging source citations",
    icon: ShieldCheck,
  },
  {
    id: "policy_audit",
    label: "Policy review",
    description: "Auditing against Medium publication and Boost quality criteria",
    icon: ShieldAlert,
  },
];

interface GenerationTrackerProps {
  currentStep: PipelineStep;
  progressPercent: number;
}

export function GenerationTracker({ currentStep, progressPercent }: GenerationTrackerProps) {
  const getStepStatus = (stepId: PipelineStep, index: number) => {
    const stepOrder: PipelineStep[] = ["intent", "research", "reddit", "drafting", "factcheck", "policy_audit", "completed"];
    const currentIndex = stepOrder.indexOf(currentStep);

    if (currentStep === "completed") return "done";
    if (currentIndex > index) return "done";
    if (currentIndex === index) return "active";
    return "pending";
  };

  const activeStepConfig = PIPELINE_STEPS.find((s) => s.id === currentStep) || PIPELINE_STEPS[0];

  return (
    <div className="bg-white border border-[#E6E9ED] rounded-xl p-5 sm:p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[11px] font-semibold text-[#426B5A] uppercase tracking-wider">
            Research & Drafting Pipeline
          </span>
          <h3 className="text-base sm:text-lg font-semibold text-[#20252D] flex items-center gap-2 mt-0.5">
            {currentStep !== "completed" && (
              <Loader2 className="w-4 h-4 text-[#426B5A] animate-spin shrink-0" />
            )}
            <span>{activeStepConfig.label}</span>
          </h3>
          <p className="text-xs text-[#687180] mt-0.5">
            {activeStepConfig.description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[11px] text-[#89919E]">Overall progress</div>
          <div className="text-base font-semibold text-[#20252D] font-mono">
            {Math.min(100, Math.round(progressPercent))}%
          </div>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-[#F0F3F5] rounded-full h-1.5 mb-5 overflow-hidden">
        <motion.div
          className="bg-[#426B5A] h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Horizontal Steps Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STEPS.map((step, idx) => {
          const status = getStepStatus(step.id, idx);
          const IconComponent = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border transition-all ${
                status === "done"
                  ? "bg-[#EAF2ED]/60 border-[#C8DCD1] text-[#2E7D5B]"
                  : status === "active"
                  ? "bg-white border-[#426B5A] text-[#20252D] ring-1 ring-[#426B5A]/20 shadow-xs"
                  : "bg-[#FAFBFC] border-[#E6E9ED] text-[#89919E]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#89919E]">
                  0{idx + 1}
                </span>
                {status === "done" ? (
                  <span className="w-4 h-4 rounded-full bg-[#EAF2ED] text-[#2E7D5B] flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                ) : status === "active" ? (
                  <span className="w-4 h-4 rounded-full bg-[#EAF2ED] text-[#426B5A] flex items-center justify-center">
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-[#F0F3F5] text-[#89919E] flex items-center justify-center text-[10px] font-mono">
                    ·
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-0.5">
                <IconComponent
                  className={`w-3.5 h-3.5 shrink-0 ${
                    status === "done"
                      ? "text-[#2E7D5B]"
                      : status === "active"
                      ? "text-[#426B5A]"
                      : "text-[#89919E]"
                  }`}
                />
                <span className="text-xs font-medium truncate">
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
