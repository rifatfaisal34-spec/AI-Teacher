"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Layers,
  PenTool,
  RotateCcw,
  Briefcase,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sliders,
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
  activeTab: "tutor" | "visual_math" | "flipped_classroom" | "career_path" | "radar";
  onTabChange: (tab: "tutor" | "visual_math" | "flipped_classroom" | "career_path" | "radar") => void;
  eslLanguage?: string;
  onEslLanguageChange?: (lang: "none" | "spanish" | "mandarin" | "hindi" | "arabic") => void;
  bloomsLevel?: string;
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
  activeTab,
  onTabChange,
  eslLanguage = "none",
  onEslLanguageChange,
  bloomsLevel = "Understand",
}: HeaderProps) {
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Map pace internal values to screenshot names: Steady, Balanced, Quick
  const paceOptions: Array<{ id: "scaffolded" | "balanced" | "accelerated"; label: string }> = [
    { id: "scaffolded", label: "Steady" },
    { id: "balanced", label: "Balanced" },
    { id: "accelerated", label: "Quick" },
  ];

  // Derive dynamic teacher title (e.g. "Your calculus teacher")
  const teacherSub = currentSubject.id === "calculus" 
    ? "Your calculus teacher" 
    : `Your ${currentSubject.category.toLowerCase()} teacher`;

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0C]/90 backdrop-blur-md border-b border-neutral-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Left: Persona Avatar & Teacher identity */}
          <div className="flex items-center gap-3 relative">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#E0A97E] text-neutral-950 font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                  className="group flex items-center gap-1 text-sm font-semibold text-white hover:text-[#E8B288] transition-colors"
                >
                  <span>Maya</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 transition-transform" />
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 font-normal leading-tight">
                {teacherSub}
              </p>
            </div>

            {/* Subject Selector Dropdown */}
            {isSubjectDropdownOpen && (
              <div className="absolute top-12 left-0 w-72 bg-[#121214] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50">
                <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold px-3 py-1.5">
                  Select Study Course
                </div>
                <div className="space-y-0.5">
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        onSelectSubject(sub);
                        setIsSubjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        sub.id === currentSubject.id
                          ? "bg-[#1f1f23] text-white font-medium"
                          : "text-neutral-300 hover:bg-[#18181b] hover:text-white"
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      {sub.id === currentSubject.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E8B288]"></span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-neutral-800/80">
                  <button
                    onClick={() => {
                      setIsSubjectDropdownOpen(false);
                      onOpenCustomModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#E8B288] hover:bg-[#18181b] flex items-center gap-2 font-medium transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create Custom Topic...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center: Topic breadcrumb / current topic focus */}
          <div className="hidden md:flex items-center justify-center text-xs text-neutral-400 font-medium tracking-wide">
            {currentSubject.name.includes(":") 
              ? currentSubject.name.split(":")[1]?.trim() 
              : currentSubject.name}
          </div>

          {/* Right: Pace Selector & Navigation Tabs */}
          <div className="flex items-center gap-3">
            {/* Pace Pill Segmented Group (Steady / Balanced / Quick) */}
            <div className="bg-[#141416] border border-neutral-800 rounded-full p-0.5 flex items-center">
              {paceOptions.map((opt) => {
                const isActive = pace === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onPaceChange(opt.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#242428] text-white shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* View / Tool Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-medium ${
                  activeTab !== "tutor"
                    ? "bg-[#1d1d21] text-[#E8B288] border-neutral-700"
                    : "bg-[#141416] border-neutral-800 text-neutral-300 hover:text-white hover:bg-[#18181b]"
                }`}
                title="Explore learning tools (Visual Math, Teach Maya, Career, Gaps)"
              >
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">
                  {activeTab === "tutor"
                    ? "Tools"
                    : activeTab === "visual_math"
                    ? "Canvas"
                    : activeTab === "flipped_classroom"
                    ? "Teach"
                    : activeTab === "career_path"
                    ? "Career"
                    : "Radar"}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-11 w-64 bg-[#121214] border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold px-3 py-1.5">
                    Learning Mode
                  </div>
                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        onTabChange("tutor");
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        activeTab === "tutor"
                          ? "bg-[#1f1f23] text-white font-medium"
                          : "text-neutral-300 hover:bg-[#18181b]"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#E8B288]" />
                      <span>Interactive Lesson (Default)</span>
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("visual_math");
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        activeTab === "visual_math"
                          ? "bg-[#1f1f23] text-white font-medium"
                          : "text-neutral-300 hover:bg-[#18181b]"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5 text-[#E8B288]" />
                      <span>Visual Math Canvas</span>
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("flipped_classroom");
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        activeTab === "flipped_classroom"
                          ? "bg-[#1f1f23] text-white font-medium"
                          : "text-neutral-300 hover:bg-[#18181b]"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#E8B288]" />
                      <span>Teach Maya (Flipped Class)</span>
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("career_path");
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        activeTab === "career_path"
                          ? "bg-[#1f1f23] text-white font-medium"
                          : "text-neutral-300 hover:bg-[#18181b]"
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#E8B288]" />
                      <span>Career-Integrated Modules</span>
                    </button>
                    <button
                      onClick={() => {
                        onTabChange("radar");
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                        activeTab === "radar"
                          ? "bg-[#1f1f23] text-white font-medium"
                          : "text-neutral-300 hover:bg-[#18181b]"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#E8B288]" />
                      <span>Knowledge Gap Radar</span>
                    </button>
                  </div>

                  {/* ESL Language & Cognitive Settings */}
                  {onEslLanguageChange && (
                    <div className="pt-2 mt-2 border-t border-neutral-800/80 px-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span>ESL Switch:</span>
                        </span>
                        <select
                          value={eslLanguage}
                          onChange={(e) => onEslLanguageChange(e.target.value as any)}
                          className="bg-[#18181b] border border-neutral-700 rounded-lg text-[10px] text-neutral-200 py-0.5 px-1.5 focus:outline-none cursor-pointer"
                        >
                          <option value="none">English</option>
                          <option value="spanish">Español</option>
                          <option value="mandarin">中文</option>
                          <option value="hindi">हिन्दी</option>
                          <option value="arabic">العربية</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>Cognitive Level:</span>
                        <span className="text-[#E8B288] font-medium">{bloomsLevel}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
