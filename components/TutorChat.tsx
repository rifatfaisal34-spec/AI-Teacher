"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Brain,
  Layers,
  GraduationCap,
} from "lucide-react";
import { ConceptNode } from "@/lib/curricula";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  detectedGap?: string | null;
  scaffoldQuestion?: string | null;
  suggestedQuickReplies?: string[];
}

interface TutorChatProps {
  messages: ChatMessage[];
  onSendMessage: (
    content: string,
    mode?: "socratic" | "explain" | "analogy" | "practice"
  ) => void;
  isLoading: boolean;
  activeConcept: ConceptNode;
  pace: "scaffolded" | "balanced" | "accelerated";
  onPracticeTrigger: () => void;
  onSelectConceptGap?: (gap: string) => void;
}

export function TutorChat({
  messages,
  onSendMessage,
  isLoading,
  activeConcept,
  pace,
  onPracticeTrigger,
  onSelectConceptGap,
}: TutorChatProps) {
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleVoicePlay = (msgId: string, text: string) => {
    if (!synthRef.current) return;

    if (isSpeaking && speakingMsgId === msgId) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    synthRef.current.cancel();

    // Strip basic markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[#*`_>]/g, "")
      .replace(/\$(.*?)\$/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = pace === "scaffolded" ? 0.9 : 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const quickActionPrompts = [
    {
      label: "🧩 Real-World Analogy",
      prompt: "Can you give me an intuitive real-world analogy for this concept?",
      mode: "analogy" as const,
    },
    {
      label: "🔍 Step-by-Step Breakdown",
      prompt: "Can you break down the previous step in detail?",
      mode: "explain" as const,
    },
    {
      label: "💡 Explain Simpler",
      prompt: "Explain this in simpler terms with no jargon.",
      mode: "socratic" as const,
    },
    {
      label: "🎯 Challenge Me",
      prompt: "Give me an active challenge question to test my understanding.",
      mode: "practice" as const,
    },
  ];

  return (
    <div className="flex flex-col h-[650px] bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Chat header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
              <span>Socratic AI Tutor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[11px] text-slate-400">
              Focus: <span className="text-indigo-300 font-medium">{activeConcept.title}</span> •{" "}
              <span className="capitalize">{pace}</span> Pace
            </div>
          </div>
        </div>

        <button
          onClick={onPracticeTrigger}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Quiz</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isMsgSpeaking = isSpeaking && speakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                  isUser
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none"
                }`}
              >
                {/* Voice button for AI responses */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700/60">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400 flex items-center gap-1">
                      <Brain className="w-3 h-3" /> AI Teacher
                    </span>
                    <button
                      onClick={() => handleVoicePlay(msg.id, msg.content)}
                      className={`p-1 rounded-md transition-colors ${
                        isMsgSpeaking
                          ? "bg-indigo-500 text-white animate-pulse"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                      }`}
                      title={isMsgSpeaking ? "Mute speech" : "Read aloud"}
                    >
                      {isMsgSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Body formatting */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                {/* Socratic scaffold checkpoint question */}
                {msg.scaffoldQuestion && (
                  <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs">
                    <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Checkpoint Prompt:
                    </div>
                    <div>{msg.scaffoldQuestion}</div>
                  </div>
                )}

                {/* Detected Gap alert in tutor response */}
                {msg.detectedGap && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong>Knowledge Gap Flagged:</strong> {msg.detectedGap}
                      </span>
                    </div>
                    {onSelectConceptGap && (
                      <button
                        onClick={() => onSelectConceptGap(msg.detectedGap!)}
                        className="text-[11px] underline font-semibold text-amber-400 hover:text-amber-200 whitespace-nowrap"
                      >
                        Target Gap
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick suggestion buttons for this message */}
              {!isUser && msg.suggestedQuickReplies && msg.suggestedQuickReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                  {msg.suggestedQuickReplies.map((reply, i) => (
                    <button
                      key={i}
                      disabled={isLoading}
                      onClick={() => onSendMessage(reply)}
                      className="px-2.5 py-1 rounded-full text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/70 transition-all text-left flex items-center gap-1"
                    >
                      <span>{reply}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>AI Teacher is adapting explanation to your pace...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/70 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold shrink-0">
          Fast Actions:
        </span>
        {quickActionPrompts.map((btn, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => onSendMessage(btn.prompt, btn.mode)}
            className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-700/60 hover:border-indigo-500/40 transition-colors"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Input submission box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${activeConcept.title} or test your reasoning...`}
          className="flex-1 bg-slate-900 border border-slate-700/90 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-medium transition-all shadow-md shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
