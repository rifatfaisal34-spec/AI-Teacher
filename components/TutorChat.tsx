"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  Check,
  X,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { ConceptNode, PracticeQuestion } from "@/lib/curricula";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  detectedGap?: string | null;
  scaffoldQuestion?: string | null;
  suggestedQuickReplies?: string[];
  isQuote?: boolean;
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
  currentQuestion?: PracticeQuestion;
  onAnswerSubmitted?: (isCorrect: boolean, identifiedMisconception?: string) => void;
  onSelectConceptGap?: (gap: string) => void;
}

export function TutorChat({
  messages,
  onSendMessage,
  isLoading,
  activeConcept,
  pace,
  currentQuestion,
  onAnswerSubmitted,
  onSelectConceptGap,
}: TutorChatProps) {
  const [input, setInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedQuestion, setHasSubmittedQuestion] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Reset quiz state when active concept changes
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmittedQuestion(false);
    setShowHint(false);
  }, [activeConcept.id, currentQuestion?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, hasSubmittedQuestion]);

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

    const cleanText = text
      .replace(/[#*`_>]/g, "")
      .replace(/\$(.*?)\$/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = pace === "scaffolded" ? 0.9 : 1.02;
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

  // Quick check submission
  const handleCheckAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    const misconception = !isCorrect
      ? currentQuestion.misconceptionMap[selectedOption]
      : undefined;

    setHasSubmittedQuestion(true);
    if (onAnswerSubmitted) {
      onAnswerSubmitted(isCorrect, misconception);
    }
  };

  return (
    <div className="flex flex-col min-h-[700px] pb-10">
      {/* Editorial Header Section */}
      <div className="mb-8">
        <div className="text-xs text-neutral-400 font-medium tracking-wide mb-2 flex items-center gap-1.5">
          <span>Today</span>
          <span>·</span>
          <span className="text-neutral-300">{activeConcept.title}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
          Let&apos;s think this one through together.
        </h1>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-6 flex-1">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isMsgSpeaking = isSpeaking && speakingMsgId === msg.id;

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-[#1c1c1f] text-neutral-200 text-sm py-3 px-4.5 rounded-2xl max-w-xl leading-relaxed shadow-sm">
                  {msg.content}
                </div>
              </div>
            );
          }

          // Teacher message (Assistant)
          return (
            <div key={msg.id} className="flex items-start gap-3.5 group">
              {/* Avatar M */}
              <div className="w-7 h-7 rounded-full bg-[#E0A97E] text-neutral-950 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm">
                M
              </div>

              <div className="flex-1 space-y-3 max-w-2xl">
                {/* Message Body */}
                <div className="text-sm text-neutral-200 leading-relaxed space-y-2.5">
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Socratic Quote Highlight Box */}
                  {msg.scaffoldQuestion && (
                    <div className="border-l-2 border-neutral-700 pl-4 py-1 my-3 font-serif italic text-lg sm:text-xl text-neutral-100 leading-snug">
                      {msg.scaffoldQuestion}
                    </div>
                  )}

                  {/* Knowledge Gap Flagged Banner if detected */}
                  {msg.detectedGap && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-3 my-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>Gap Detected:</strong> {msg.detectedGap}
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

                {/* Suggested Quick Reply Pills (e.g. "Try an analogy", "Show me a worked example", "Explain it simpler") */}
                {msg.suggestedQuickReplies && msg.suggestedQuickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggestedQuickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        disabled={isLoading}
                        onClick={() => onSendMessage(reply)}
                        className="border border-neutral-800 bg-[#161618] hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs px-3.5 py-1.5 rounded-full transition-colors font-normal cursor-pointer"
                      >
                        {reply}
                      </button>
                    ))}
                    {/* Voice Read Aloud Button */}
                    <button
                      type="button"
                      onClick={() => handleVoicePlay(msg.id, msg.content)}
                      className={`px-2.5 py-1.5 rounded-full border border-neutral-800 text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1 ${
                        isMsgSpeaking ? "bg-[#E8B288]/20 text-[#E8B288] border-[#E8B288]/40" : ""
                      }`}
                      title="Read aloud"
                    >
                      {isMsgSpeaking ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-7 h-7 rounded-full bg-[#E0A97E] text-neutral-950 font-bold flex items-center justify-center text-xs shrink-0">
              M
            </div>
            <div className="bg-[#141416] border border-neutral-800 rounded-2xl px-4 py-2.5 text-xs text-neutral-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E8B288]" />
              <span>Maya is thinking...</span>
            </div>
          </div>
        )}

        {/* Integrated QUICK CHECK Card (Matching the Screenshot exactly) */}
        {currentQuestion && (
          <div className="bg-[#121214] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 mt-6 space-y-4 shadow-xl">
            {/* Subheader */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
                QUICK CHECK
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {activeConcept.title}
              </span>
            </div>

            {/* Question Heading */}
            <h3 className="font-serif text-xl sm:text-2xl text-white font-normal leading-snug">
              {currentQuestion.question}
            </h3>

            {/* 2x2 Option Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQuestion.correctIndex;
                const isIncorrectSelected = hasSubmittedQuestion && isSelected && !isCorrect;
                const isCorrectRevealed = hasSubmittedQuestion && isCorrect;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={hasSubmittedQuestion}
                    onClick={() => setSelectedOption(optIdx)}
                    className={`text-left p-3.5 sm:p-4 rounded-xl border text-sm font-mono transition-all flex items-center justify-between ${
                      isCorrectRevealed
                        ? "border-emerald-500/80 bg-emerald-950/20 text-emerald-200"
                        : isIncorrectSelected
                        ? "border-rose-500/80 bg-rose-950/20 text-rose-200"
                        : isSelected
                        ? "border-neutral-500 bg-[#222226] text-white ring-1 ring-neutral-500"
                        : "border-neutral-800 bg-[#18181b] hover:border-neutral-700 text-neutral-200"
                    }`}
                  >
                    <span>{optionText}</span>
                    {isCorrectRevealed && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {isIncorrectSelected && (
                      <X className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Box (if revealed) */}
            {showHint && !hasSubmittedQuestion && (
              <div className="p-3 rounded-xl bg-[#18181b] border border-neutral-800 text-xs text-neutral-300 leading-relaxed flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-[#E8B288] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Hint:</strong>
                  {currentQuestion.hint}
                </div>
              </div>
            )}

            {/* Post-submission feedback */}
            {hasSubmittedQuestion && (
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  selectedOption === currentQuestion.correctIndex
                    ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                    : "bg-amber-950/20 border-amber-500/40 text-amber-200"
                }`}
              >
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  {selectedOption === currentQuestion.correctIndex ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Spot on! Product rule executed cleanly.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>Reviewing reasoning:</span>
                    </>
                  )}
                </div>
                <p className="text-neutral-300">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Quick Check Card Footer */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {!hasSubmittedQuestion ? (
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    {showHint ? "Hide hint" : "I'd like a hint first"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOption(null);
                      setHasSubmittedQuestion(false);
                      setShowHint(false);
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4 cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Try again</span>
                  </button>
                )}
              </div>

              {!hasSubmittedQuestion ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleCheckAnswer}
                  className="bg-[#E8B288] hover:bg-[#d9a47a] disabled:opacity-40 disabled:hover:bg-[#E8B288] text-neutral-950 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Check my answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onSendMessage(
                      selectedOption === currentQuestion.correctIndex
                        ? "I solved the quick check correctly! Let's explore the geometric intuition or try an advanced variation."
                        : `I worked through ${currentQuestion.question}. Can you break down why the inner/product interaction behaves this way?`,
                      "socratic"
                    );
                  }}
                  className="bg-[#1f1f23] hover:bg-[#27272b] border border-neutral-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Discuss with Maya</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E8B288]" />
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Chat Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 sticky bottom-4 z-30 bg-[#121214] border border-neutral-800 rounded-2xl p-1.5 pl-5 flex items-center gap-3 shadow-2xl backdrop-blur-md"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell Maya what you're thinking..."
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-[#E8B288] hover:bg-[#d9a47a] disabled:opacity-40 text-neutral-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md"
          title="Send message"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
