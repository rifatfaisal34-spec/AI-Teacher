"use client";

import React, { useState } from "react";
import {
  Brain,
  Mic,
  MicOff,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { BLOOMS_TAXONOMY, BloomsTaxonomyLevel } from "@/lib/rag-data";

interface SocraticEvalResponse {
  accuracyScore: number;
  clarityScore: number;
  completenessScore: number;
  overallScore: number;
  bloomsLevelAchieved: string;
  blindSpots: string[];
  strengths: string[];
  socraticCounterQuestion: string;
  feynmanFeedback: string;
}

interface FlippedClassroomProps {
  currentTopic: string;
  subject: string;
}

export function FlippedClassroom({ currentTopic, subject }: FlippedClassroomProps) {
  const [explanation, setExplanation] = useState("");
  const [selectedBloomsLevel, setSelectedBloomsLevel] = useState("Understand");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<SocraticEvalResponse | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleStartSpeech = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your explanation.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setExplanation((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleEvaluate = async () => {
    if (!explanation.trim()) return;

    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const res = await fetch("/api/tutor/socratic-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic,
          studentExplanation: explanation.trim(),
          targetBloomsLevel: selectedBloomsLevel,
          subject,
        }),
      });

      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const sampleExplanationPrompts = [
    {
      title: "Intuitive Gear Analogy",
      text: "Think of the chain rule like connected gears on a bicycle. The outer gear spins at the pedal rate, but the inner gear has its own teeth ratio. So when you change the pedal speed, the final wheel speed is the product of both gear ratios multiplied together, not added."
    },
    {
      title: "Algebraic Substitution",
      text: "If you have a function inside another function like f(g(x)), we let u = g(x). Then we take the derivative of the outer shell df/du, and by the chain rule theorem we must multiply by du/dx. For instance, for (x^2+1)^3, u is x^2+1, du is 2x, so the answer is 3(x^2+1)^2 * 2x."
    }
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Brain className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-100">
              Flipped Classroom: Teach the AI (Feynman Technique)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            The ultimate test of mastery is teaching. Explain <strong>{currentTopic}</strong> in your own words—the AI will evaluate your conceptual depth and ask Socratic counter-questions!
          </p>
        </div>

        {/* Bloom's Level Target Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 font-bold uppercase px-2">Target Depth:</span>
          {["Understand", "Apply", "Analyze", "Evaluate"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedBloomsLevel(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedBloomsLevel === lvl
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Quick sample prompt fills */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold shrink-0">
          Example Drafts:
        </span>
        {sampleExplanationPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setExplanation(p.text)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700/80 transition-colors"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Input text box */}
      <div className="relative">
        <textarea
          rows={4}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={`Teach the AI: How does ${currentTopic} work? Why does the formula work, what is the intuition, and what mistake should a student avoid?`}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed resize-none"
        />

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleStartSpeech}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isListening
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Listening... Speak now</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-slate-400" />
                <span>Dictate Explanation</span>
              </>
            )}
          </button>

          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !explanation.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Assessing Conceptual Depth...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluate My Explanation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Results */}
      {evaluation && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 animate-in fade-in">
          {/* Scores Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Overall Mastery</span>
              <span className="text-lg font-bold text-emerald-400">
                {evaluation.overallScore}%
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Accuracy</span>
              <span className="text-lg font-bold text-indigo-400">
                {evaluation.accuracyScore}%
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Clarity & Analogy</span>
              <span className="text-lg font-bold text-amber-400">
                {evaluation.clarityScore}%
              </span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Bloom's Level</span>
              <span className="text-xs font-bold text-purple-300 uppercase mt-1 block">
                {evaluation.bloomsLevelAchieved}
              </span>
            </div>
          </div>

          {/* Socratic Counter Challenge */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>AI Student Socratic Counter-Question:</span>
            </div>
            <p className="text-slate-200 italic leading-relaxed">
              &ldquo;{evaluation.socraticCounterQuestion}&rdquo;
            </p>
          </div>

          {/* Strengths & Blind spots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="font-semibold text-emerald-300 flex items-center gap-1 mb-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Strengths:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <span className="font-semibold text-amber-300 flex items-center gap-1 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Latent Blind Spots:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {evaluation.blindSpots.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feynman Feedback */}
          <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">Feynman Coaching Note:</strong>{" "}
              {evaluation.feynmanFeedback}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
