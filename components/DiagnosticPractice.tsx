"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Check,
} from "lucide-react";
import { PracticeQuestion, ConceptNode } from "@/lib/curricula";

interface DiagnosticPracticeProps {
  question?: PracticeQuestion;
  activeConcept: ConceptNode;
  onAnswerSubmitted: (isCorrect: boolean, identifiedMisconception?: string) => void;
  onRequestTutorHelp: (context: string) => void;
}

export function DiagnosticPractice({
  question,
  activeConcept,
  onAnswerSubmitted,
  onRequestTutorHelp,
}: DiagnosticPracticeProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!question) {
    return (
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 text-center">
        <Lightbulb className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">
          Ready for Practice on {activeConcept.title}
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Ask the AI Teacher for a custom practice question or select a preset module to test your understanding.
        </p>
        <button
          onClick={() =>
            onRequestTutorHelp(
              `Can you give me a diagnostic practice problem specifically designed to check my understanding of ${activeConcept.title}?`
            )
          }
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Practice Problem</span>
        </button>
      </div>
    );
  }

  const isCorrect = selectedOption === question.correctIndex;
  const misconception =
    selectedOption !== null && !isCorrect
      ? question.misconceptionMap[selectedOption]
      : undefined;

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setHasSubmitted(true);
    onAnswerSubmitted(isCorrect, misconception);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowHint(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
            Q
          </span>
          <span className="text-xs font-semibold text-slate-200">
            Diagnostic Knowledge Check
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Target: {activeConcept.title}
        </span>
      </div>

      {/* Question prompt */}
      <h3 className="text-sm font-medium text-slate-100 leading-relaxed mb-4">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isTheCorrectOption = hasSubmitted && idx === question.correctIndex;
          const isTheWrongSelection = hasSubmitted && isSelected && !isCorrect;

          return (
            <button
              key={idx}
              type="button"
              disabled={hasSubmitted}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 ${
                isTheCorrectOption
                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-200"
                  : isTheWrongSelection
                  ? "bg-rose-950/40 border-rose-500 text-rose-200"
                  : isSelected
                  ? "bg-indigo-900/30 border-indigo-500 text-indigo-100"
                  : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border mt-0.5 ${
                  isTheCorrectOption
                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                    : isTheWrongSelection
                    ? "bg-rose-500 text-white border-rose-400"
                    : isSelected
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "border-slate-700 text-slate-400 bg-slate-900"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1 leading-snug">{opt}</span>
              {isTheCorrectOption && (
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Hint toggle */}
      {!hasSubmitted && (
        <div className="mb-4">
          {showHint ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              <span className="font-semibold text-amber-300 flex items-center gap-1 mb-1">
                <Lightbulb className="w-3.5 h-3.5" /> Scaffold Hint:
              </span>
              {question.hint}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Need a hint before answering?</span>
            </button>
          )}
        </div>
      )}

      {/* Submit / Retry button */}
      {!hasSubmitted ? (
        <button
          type="button"
          disabled={selectedOption === null}
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
        >
          <span>Submit for Diagnostic Evaluation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="space-y-3 pt-2">
          {/* Cognitive diagnosis feedback */}
          <div
            className={`p-3.5 rounded-xl border ${
              isCorrect
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                : "bg-amber-950/30 border-amber-500/40 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Correct! Concept Mastered</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Cognitive Gap Diagnosed</span>
                </>
              )}
            </div>

            {misconception && (
              <div className="text-xs bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 my-2">
                <strong className="text-amber-300 block mb-0.5">
                  Identified Misconception:
                </strong>
                {misconception}
              </div>
            )}

            <p className="text-xs leading-relaxed mt-1 opacity-90">
              {question.explanation}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Question</span>
            </button>
            <button
              onClick={() =>
                onRequestTutorHelp(
                  `I just tried this problem: "${question.question}". ${
                    isCorrect
                      ? "I got it right! Can you give me a deeper theoretical perspective?"
                      : `I got it wrong by selecting "${question.options[selectedOption!]}". Can you explain the misconception: "${misconception}" and guide me through it?`
                  }`
                )
              }
              className="flex-1 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask Tutor to Break Down</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
