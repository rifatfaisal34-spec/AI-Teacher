"use client";

import React from "react";
import {
  CheckCircle,
  PlayCircle,
  AlertTriangle,
  Lock,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ConceptNode } from "@/lib/curricula";

interface ConceptRoadmapProps {
  concepts: ConceptNode[];
  activeConceptId: string;
  onSelectConcept: (concept: ConceptNode) => void;
  onRemediateGap: (concept: ConceptNode, misconception: string) => void;
}

export function ConceptRoadmap({
  concepts,
  activeConceptId,
  onSelectConcept,
  onRemediateGap,
}: ConceptRoadmapProps) {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Adaptive Mastery Map
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any concept to direct tutor focus
        </span>
      </div>

      {/* Nodes list / flow */}
      <div className="space-y-3">
        {concepts.map((node, index) => {
          const isActive = node.id === activeConceptId;
          const isMastered = node.status === "mastered";
          const isGap = node.status === "gap";
          const isCurrent = node.status === "current";
          const isLocked = node.status === "locked";

          return (
            <div
              key={node.id}
              className={`relative rounded-xl border p-3.5 transition-all ${
                isActive
                  ? "bg-slate-800/90 border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                  : isGap
                  ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70"
                  : isMastered
                  ? "bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/50"
                  : isCurrent
                  ? "bg-slate-800/60 border-blue-500/40 hover:border-blue-500/60"
                  : "bg-slate-900/40 border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectConcept(node)}
                  className="flex items-start gap-3 text-left flex-1 group"
                >
                  {/* Status icon badge */}
                  <div className="mt-0.5">
                    {isMastered && (
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                    {isGap && (
                      <div className="p-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="p-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="p-1 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {node.title}
                      </span>
                      {isActive && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Active Focus
                        </span>
                      )}
                      {isGap && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Gap Diagnosed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>
                  </div>
                </button>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      node.difficulty === "beginner"
                        ? "bg-slate-800 text-slate-300"
                        : node.difficulty === "intermediate"
                        ? "bg-blue-950/60 text-blue-300 border border-blue-800/40"
                        : "bg-purple-950/60 text-purple-300 border border-purple-800/40"
                    }`}
                  >
                    {node.difficulty}
                  </span>
                </div>
              </div>

              {/* Identified Misconceptions & Repair trigger */}
              {isGap && node.commonMisconceptions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 bg-amber-500/5 -mx-3.5 -mb-3.5 p-3 rounded-b-xl">
                  <div className="text-[11px] font-medium text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Target Cognitive Misconception:
                  </div>
                  <p className="text-xs text-amber-200/90 italic mb-2">
                    &ldquo;{node.commonMisconceptions[0]}&rdquo;
                  </p>
                  <button
                    onClick={() =>
                      onRemediateGap(node, node.commonMisconceptions[0])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Repair Knowledge Gap</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
