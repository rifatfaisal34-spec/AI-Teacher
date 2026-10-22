"use client";

import React from "react";
import {
  TrendingUp,
  Brain,
  Timer,
  ShieldCheck,
  CheckCircle,
  Database,
  Award,
  Zap,
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
}

export function ScoreImprovementBar({
  baselineScore,
  currentScore,
  averageLatencySeconds,
  currentBloomsLevel,
  eslLanguage,
  onEslLanguageChange,
  onBloomsSelect,
}: ScoreImprovementBarProps) {
  const delta = currentScore - baselineScore;
  const isPositive = delta >= 0;

  // UCI ML Predictive metric: <5s = impulsive guessing; >90s = cognitive overload; 10-45s = optimal zone
  const latencyStatus =
    averageLatencySeconds < 5
      ? { label: "Impulsive / Guessing", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
      : averageLatencySeconds > 60
      ? { label: "High Cognitive Load", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" }
      : { label: "Optimal Deliberation Flow", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Measurable Score Gain Tracker */}
        <div className="md:col-span-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Measurable Score Gain</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-white">
                {currentScore}%
              </span>
              <span className="text-xs text-slate-400">
                (Pre-test Baseline: {baselineScore}%)
              </span>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 shadow-sm ${
              isPositive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 text-slate-300 border-slate-700"
            }`}
          >
            <span>{isPositive ? `+${delta}%` : `${delta}%`}</span>
            <span className="text-[10px] uppercase font-semibold">Improvement</span>
          </div>
        </div>

        {/* Bloom's Taxonomy Cognitive Hierarchy */}
        <div className="md:col-span-5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Bloom&apos;s Taxonomy Ladder:</span>
            </span>
            <span className="text-[11px] font-bold text-indigo-300 uppercase">
              Current: {currentBloomsLevel}
            </span>
          </div>

          {/* Stepped cognitive nodes */}
          <div className="grid grid-cols-6 gap-1">
            {BLOOMS_TAXONOMY.map((b) => {
              const isSelected = b.name.toLowerCase() === currentBloomsLevel.toLowerCase();
              return (
                <button
                  key={b.name}
                  onClick={() => onBloomsSelect(b.name)}
                  className={`py-1 rounded text-[10px] font-semibold text-center transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                  title={`${b.level}. ${b.name}: ${b.description}`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Latency & ESL Multi-lingual control */}
        <div className="md:col-span-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between gap-2">
          {/* Response Latency telemetry */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Timer className="w-3.5 h-3.5 text-slate-500" />
              <span>Deliberation Latency:</span>
            </div>
            <span className="text-xs font-bold text-slate-200">
              {averageLatencySeconds}s
            </span>
          </div>

          <div className={`px-2 py-0.5 rounded text-[10px] font-medium border text-center ${latencyStatus.color}`}>
            {latencyStatus.label}
          </div>

          {/* ESL language selector */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400">ESL Code-Switch:</span>
            <select
              value={eslLanguage}
              onChange={(e) => onEslLanguageChange(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="none">English Only</option>
              <option value="spanish">Español (Spanish)</option>
              <option value="mandarin">中文 (Mandarin)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
              <option value="arabic">العربية (Arabic)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
