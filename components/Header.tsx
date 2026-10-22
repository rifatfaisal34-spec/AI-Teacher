"use client";

import React from "react";
import {
  GraduationCap,
  Sparkles,
  Zap,
  ShieldAlert,
  Gauge,
  PlusCircle,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";
import { SubjectCurriculum } from "@/lib/curricula";

interface HeaderProps {
  currentSubject: SubjectCurriculum;
  subjects: SubjectCurriculum[];
  onSelectSubject: (subject: SubjectCurriculum) => void;
  pace: "scaffolded" | "balanced" | "accelerated";
  onPaceChange: (pace: "scaffolded" | "balanced" | "accelerated") => void;
  gapCount: number;
  masteredCount: number;
  onOpenCustomModal: () => void;
}

export function Header({
  currentSubject,
  subjects,
  onSelectSubject,
  pace,
  onPaceChange,
  gapCount,
  masteredCount,
  onOpenCustomModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3.5">
          {/* Logo & Subject selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 text-white font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-white tracking-tight flex items-center gap-1.5">
                  AI Teacher
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Adaptive Tutor
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <select
                  value={currentSubject.id}
                  onChange={(e) => {
                    const found = subjects.find((s) => s.id === e.target.value);
                    if (found) onSelectSubject(found);
                  }}
                  className="bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-lg text-xs font-medium text-slate-200 py-1 px-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.category}: {sub.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onOpenCustomModal}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-300 transition-colors"
                  title="Generate a custom learning roadmap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Custom Topic</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pace & Diagnostic stats */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Pace selector */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-slate-400" />
                Pace:
              </span>
              <button
                onClick={() => onPaceChange("scaffolded")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  pace === "scaffolded"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
                title="Foundational scaffolding, bite-sized steps, intuitive analogies"
              >
                🐢 Scaffolded
              </button>
              <button
                onClick={() => onPaceChange("balanced")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  pace === "balanced"
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
                title="Balanced pace: clear concepts with interactive check-ins"
              >
                ⚖️ Balanced
              </button>
              <button
                onClick={() => onPaceChange("accelerated")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  pace === "accelerated"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
                title="Accelerated: fast progression, edge cases, deep proofs"
              >
                ⚡ Accelerated
              </button>
            </div>

            {/* Gap & Mastery badges */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{masteredCount} Mastered</span>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  gapCount > 0
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{gapCount} Identified {gapCount === 1 ? "Gap" : "Gaps"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
