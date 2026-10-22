"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Download,
  Flame,
  Award,
} from "lucide-react";
import { ConceptNode } from "@/lib/curricula";

interface DiagnosedGapItem {
  id: string;
  topic: string;
  misconception: string;
  timestamp: Date;
  status: "open" | "resolved";
}

interface GapRadarProps {
  gaps: DiagnosedGapItem[];
  concepts: ConceptNode[];
  onRemediateGap: (gap: DiagnosedGapItem) => void;
  onMarkResolved: (gapId: string) => void;
  pace: string;
}

export function GapRadar({
  gaps,
  concepts,
  onRemediateGap,
  onMarkResolved,
  pace,
}: GapRadarProps) {
  const [activeTab, setActiveTab] = useState<"gaps" | "notes">("gaps");

  const openGaps = gaps.filter((g) => g.status === "open");
  const resolvedGaps = gaps.filter((g) => g.status === "resolved");

  const masteredCount = concepts.filter((c) => c.status === "mastered").length;
  const totalCount = concepts.length;
  const masteryPercentage =
    totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
      {/* Header and tabs */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("gaps")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "gaps"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Gaps Radar ({openGaps.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "notes"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Study Insights</span>
            </button>
          </div>
        </div>

        {/* Mastery progress circle */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Mastery Health</div>
            <div className="text-xs font-bold text-emerald-400">
              {masteryPercentage}%
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-emerald-500/80 flex items-center justify-center text-[10px] font-bold text-white">
            {masteredCount}/{totalCount}
          </div>
        </div>
      </div>

      {activeTab === "gaps" ? (
        <div className="space-y-3">
          {openGaps.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/80 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-slate-200">
                No Critical Knowledge Gaps Active!
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                You are proceeding smoothly at your <strong>{pace}</strong> pace. The tutor is monitoring for any emerging misconceptions.
              </p>
            </div>
          ) : (
            openGaps.map((gap) => (
              <div
                key={gap.id}
                className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Topic: {gap.topic}</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 uppercase font-semibold">
                    Needs Repair
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                  &ldquo;{gap.misconception}&rdquo;
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => onMarkResolved(gap.id)}
                    className="text-[11px] text-slate-400 hover:text-emerald-300 px-2 py-1 rounded transition-colors"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => onRemediateGap(gap)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Repair with Tutor</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {resolvedGaps.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Recently Resolved Traps ({resolvedGaps.length}):
              </span>
              <div className="space-y-1.5">
                {resolvedGaps.slice(-3).map((rg) => (
                  <div
                    key={rg.id}
                    className="flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-950/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="line-through text-slate-400 truncate">
                      {rg.misconception}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Study insights & key takeaways */
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Adaptive Retention Advice:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>
                <strong>Pace Calibration:</strong> At <em>{pace}</em>, focus on breaking nested formulas into isolated terms before calculating.
              </li>
              <li>
                <strong>Self-Explanation Effect:</strong> Explaining why a distractor choice is wrong provides 2.4x higher concept retention than just memorizing answers.
              </li>
              <li>
                <strong>Prerequisite Chains:</strong> When hitting resistance on advanced topics, 80% of stumbling blocks trace back to 1 step prior.
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Session Streak:</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Active diagnostic loop engaged. Every answer you input calibrates your personal learning graph.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
