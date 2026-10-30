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
    <div className="bg-[#121214] rounded-2xl border border-neutral-800 p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#222226] text-[#E8B288] border border-neutral-700">
              <Briefcase className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-white">
              Career-Integrated Learning Path Generator
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Bridge academic theory to real-world job specifications at frontier industry labs.
          </p>
        </div>

        {/* Career Path Picker */}
        <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-neutral-800">
          {PRESET_CAREER_PATHS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPathId(p.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedPathId === p.id
                  ? "bg-[#E8B288] text-neutral-950 font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {p.title.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Target company & profile */}
      <div className="p-4 rounded-xl bg-[#18181b] border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-[#E8B288]">
            {activePath.title}
          </div>
          <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
            <span>Target Role: <strong className="text-white">{activePath.companyTarget}</strong></span>
            <span>·</span>
            <span className="text-neutral-300 font-medium">{activePath.industry}</span>
          </div>
          <p className="text-xs text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
            {activePath.description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-neutral-500 uppercase block">Curriculum Depth</span>
          <span className="text-xs font-semibold text-emerald-400">
            OpenStax Grounded
          </span>
        </div>
      </div>

      {/* Daily Micro-Learning Modules */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-white flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#E8B288]" />
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
                  ? "bg-emerald-950/20 border-emerald-500/40"
                  : "bg-[#18181b] border-neutral-800 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleDayComplete(key)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isDone
                        ? "bg-emerald-500 border-emerald-400 text-neutral-950"
                        : "border-neutral-700 hover:border-neutral-500 text-transparent"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        Day {module.day}: {module.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#222226] text-neutral-300 border border-neutral-700">
                        {module.targetSkill}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 text-[#E8B288] shrink-0" />
                      <span>Reading: {module.openStaxReference}</span>
                    </div>

                    <div className="text-xs text-neutral-300 font-medium mt-1.5 bg-[#121214] px-2.5 py-1 rounded-lg border border-neutral-800 inline-block">
                      💻 Capstone Lab: {module.practicalProject}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectModuleTopic(module.title)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8B288] hover:bg-[#d9a47a] text-neutral-950 text-xs font-semibold shrink-0 transition-colors shadow-sm cursor-pointer"
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
