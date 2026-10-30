"use client";

import React from "react";
import { Check, AlertCircle } from "lucide-react";
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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
        YOUR PATH
      </div>

      {/* List of Concepts */}
      <div className="space-y-2">
        {concepts.map((node) => {
          const isActive = node.id === activeConceptId;
          const isMastered = node.status === "mastered";
          const isGap = node.status === "gap";
          const isLocked = node.status === "locked";

          // If active node: render bordered highlight box with "You're here"
          if (isActive) {
            return (
              <div
                key={node.id}
                onClick={() => onSelectConcept(node)}
                className="border border-neutral-700 bg-[#161618] rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all shadow-sm"
              >
                {/* Hollow ring indicator */}
                <div className="w-5 h-5 rounded-full border-2 border-neutral-400 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {node.title}
                  </div>
                  <div className="text-xs text-neutral-400">
                    You&apos;re here
                  </div>
                </div>
              </div>
            );
          }

          // Inactive nodes
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelectConcept(node)}
              className="w-full text-left p-2.5 rounded-xl flex items-center gap-3 hover:bg-[#141416] transition-colors group cursor-pointer"
            >
              {/* Node Icon */}
              <div className="shrink-0">
                {isMastered ? (
                  <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isGap ? (
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-neutral-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E8B288]"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-neutral-700"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    isMastered || isGap ? "text-white" : "text-neutral-300 group-hover:text-white"
                  }`}
                >
                  {node.title}
                </div>
                {isGap ? (
                  <div className="text-xs text-neutral-400">
                    Needs a second look
                  </div>
                ) : isLocked ? (
                  <div className="text-xs text-neutral-500">
                    Coming up
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
