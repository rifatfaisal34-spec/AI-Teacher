"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { PRESET_CAREER_PATHS, CareerPath } from "@/lib/rag-data";

interface CareerPathPlannerProps {
  onSelectModuleTopic: (topic: string) => void;
}

export function CareerPathPlanner({ onSelectModuleTopic }: CareerPathPlannerProps) {
  const [selectedPathId, setSelectedPathId] = useState<string>(
    PRESET_CAREER_PATHS[0].id
  );
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});

  const activePath =
    PRESET_CAREER_PATHS.find((p) => p.id === selectedPathId) ||
    PRESET_CAREER_PATHS[0];

  const toggleDayComplete = (key: string) => {
    setCompletedDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Briefcase className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-100">
              Career-Integrated Learning Path Generator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Bridge academic theory to real-world job specifications at frontier industry labs.
          </p>
        </div>

        {/* Career Path Picker */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {PRESET_CAREER_PATHS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPathId(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedPathId === p.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {p.title.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Target company & profile */}
      <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-purple-300">
            {activePath.title}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Target Role: <strong>{activePath.companyTarget}</strong></span>
            <span>•</span>
            <span className="text-purple-400 font-medium">{activePath.industry}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            {activePath.description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">Curriculum Depth</span>
          <span className="text-xs font-bold text-emerald-400">
            OpenStax + ArXiv Grounded
          </span>
        </div>
      </div>

      {/* Daily Micro-Learning Modules */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span>Curriculum Modules:</span>
        </span>

        {activePath.dailyModules.map((module) => {
          const key = `${activePath.id}-${module.day}`;
          const isDone = !!completedDays[key];

          return (
            <div
              key={module.day}
              className={`p-3.5 rounded-xl border transition-all ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleDayComplete(key)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-400 text-slate-950"
                        : "border-slate-700 hover:border-slate-500 text-transparent"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        Day {module.day}: {module.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {module.targetSkill}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Reading: {module.openStaxReference}</span>
                    </div>

                    <div className="text-xs text-indigo-300 font-medium mt-1.5 bg-indigo-950/30 px-2 py-1 rounded border border-indigo-500/20 inline-block">
                      💻 Capstone Lab: {module.practicalProject}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectModuleTopic(module.title)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/30 text-xs font-semibold shrink-0 transition-colors"
                >
                  <span>Practice Module</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
