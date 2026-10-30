"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Brain,
  Timer,
  ChevronDown,
  Globe,
  Award,
} from "lucide-react";
import { BLOOMS_TAXONOMY } from "@/lib/rag-data";

interface ScoreImprovementBarProps {
  baselineScore: number;
  currentScore: number;
  averageLatencySeconds: number;
  currentBloomsLevel: string;
  eslLanguage: string;
  onEslLanguageChange: (lang: "none" | "spanish" | "mandarin" | "hindi" | "arabic") => void;
  onBloomsSelect: (level: string) => void;
  masteredCount?: number;
  totalConcepts?: number;
}

export function ScoreImprovementBar({
  baselineScore,
  currentScore,
  averageLatencySeconds,
  currentBloomsLevel,
  eslLanguage,
  onEslLanguageChange,
  onBloomsSelect,
  masteredCount = 2,
  totalConcepts = 5,
}: ScoreImprovementBarProps) {
  const [showDetails, setShowDetails] = useState(false);
  const delta = currentScore - baselineScore;

  // Progress width
  const progressPercent = Math.min(100, Math.max(5, currentScore));

  const latencyStatus =
    averageLatencySeconds < 5
      ? "Impulsive guessing signal"
      : averageLatencySeconds > 60
      ? "High cognitive load / deliberation"
      : "Optimal deliberation flow";

  return (
    <div className="space-y-4">
      {/* Primary Score & Progress Section (Screenshot matching) */}
      <div>
        <div className="flex items-baseline justify-between">
          <div className="font-serif text-5xl text-white tracking-tight">
            {currentScore}
            <span className="text-2xl text-neutral-400 font-sans font-light">%</span>
          </div>

          <div className="text-xs text-[#E8B288] font-medium text-right">
            Up {delta} points since you started
          </div>
        </div>

        {/* Thin progress bar */}
        <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[#E8B288] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Subtitle */}
        <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
          <span>
            {masteredCount} of {totalConcepts} concepts mastered
          </span>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <span>Bloom: {currentBloomsLevel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expandable Pedagogical Diagnostics (Bloom's Taxonomy, Deliberation Latency, ESL) */}
      {showDetails && (
        <div className="p-4 rounded-2xl bg-[#141416] border border-neutral-800/80 space-y-3.5 text-xs">
          {/* Bloom's Taxonomy Cognitive Hierarchy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-[#E8B288]" />
                <span>Bloom&apos;s Cognitive Level:</span>
              </span>
              <span className="text-[#E8B288] font-semibold">
                {currentBloomsLevel}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1">
              {BLOOMS_TAXONOMY.map((b) => {
                const isSelected = b.name.toLowerCase() === currentBloomsLevel.toLowerCase();
                return (
                  <button
                    key={b.name}
                    onClick={() => onBloomsSelect(b.name)}
                    className={`py-1 rounded text-[10px] font-medium text-center transition-all ${
                      isSelected
                        ? "bg-[#E8B288] text-neutral-950 font-semibold"
                        : "bg-[#18181b] text-neutral-400 hover:text-white"
                    }`}
                    title={`${b.level}. ${b.name}: ${b.description}`}
                  >
                    {b.name.slice(0, 4)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deliberation Latency telemetry */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Timer className="w-3 h-3" />
              <span>Deliberation Latency:</span>
            </span>
            <span className="text-neutral-200 font-medium">
              {averageLatencySeconds}s · <span className="text-neutral-400 font-normal">{latencyStatus}</span>
            </span>
          </div>

          {/* ESL Language Switcher */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px]">
            <span className="text-neutral-400 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>Bilingual Code-Switch:</span>
            </span>
            <select
              value={eslLanguage}
              onChange={(e) => onEslLanguageChange(e.target.value as any)}
              className="bg-[#18181b] border border-neutral-700 rounded-lg text-neutral-200 px-2 py-0.5 text-xs focus:outline-none"
            >
              <option value="none">English Only</option>
              <option value="spanish">Español (Spanish)</option>
              <option value="mandarin">中文 (Mandarin)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
              <option value="arabic">العربية (Arabic)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
