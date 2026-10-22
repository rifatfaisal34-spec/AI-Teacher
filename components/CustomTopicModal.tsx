"use client";

import React, { useState } from "react";
import { X, Sparkles, BrainCircuit, RefreshCw, Layers } from "lucide-react";
import { SubjectCurriculum } from "@/lib/curricula";

interface CustomTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurriculumGenerated: (newCurriculum: SubjectCurriculum) => void;
}

export function CustomTopicModal({
  isOpen,
  onClose,
  onCurriculumGenerated,
}: CustomTopicModalProps) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("College");
  const [goal, setGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/tutor/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          gradeLevel: level,
          learnerGoal: goal.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate curriculum roadmap");
      }

      const data = await res.json();

      const newSubject: SubjectCurriculum = {
        id: "custom-" + Date.now(),
        name: data.title || topic.trim(),
        category: data.category || "Custom Subject",
        badge: data.badge || "AI",
        description:
          data.description ||
          `Adaptive personalized learning roadmap for ${topic.trim()}.`,
        concepts: (data.concepts || []).map((c: any, index: number) => ({
          id: c.id || `concept-${index}`,
          title: c.title,
          description: c.description,
          prerequisites: c.prerequisites || [],
          status: index === 0 ? "current" : "locked",
          difficulty: c.difficulty || "intermediate",
          commonMisconceptions: c.commonMisconceptions || [],
        })),
        questions: data.sampleQuestion
          ? [
              {
                id: `q-custom-${Date.now()}`,
                conceptId:
                  data.concepts?.[0]?.id || "foundations",
                question: data.sampleQuestion.question,
                options: data.sampleQuestion.options || [],
                correctIndex: data.sampleQuestion.correctIndex ?? 0,
                explanation: data.sampleQuestion.explanation || "",
                misconceptionMap: {
                  1: "Overgeneralization of basic principle",
                  2: "Calculation error or missing constraint",
                  3: "Confusing cause with effect",
                },
                hint: data.sampleQuestion.hint || "Review the core definition.",
              },
            ]
          : [],
      };

      onCurriculumGenerated(newSubject);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError("Could not generate curriculum. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Create Adaptive Topic Roadmap
            </h3>
            <p className="text-xs text-slate-400">
              AI Teacher will structure an adaptive prerequisite graph and diagnostic checkpoints.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              What would you like to master?
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Organic Chemistry Stereochemistry, Quantum Entanglement, Rust Lifetimes..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
                <option value="College Undergraduate">College Undergraduate</option>
                <option value="Graduate / Advanced">Graduate / Advanced</option>
                <option value="Self-Taught Professional">Self-Taught Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Learning Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Exam prep, project building..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Curriculum...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Personalized Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
