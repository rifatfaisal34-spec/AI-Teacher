"use client";

import React, { useState } from "react";
import {
  PRESET_CURRICULA,
  SubjectCurriculum,
  ConceptNode,
  PracticeQuestion,
} from "@/lib/curricula";
import { Header } from "@/components/Header";
import { ConceptRoadmap } from "@/components/ConceptRoadmap";
import { TutorChat, ChatMessage } from "@/components/TutorChat";
import { DiagnosticPractice } from "@/components/DiagnosticPractice";
import { GapRadar } from "@/components/GapRadar";
import { CustomTopicModal } from "@/components/CustomTopicModal";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Gauge,
  BookOpen,
  HelpCircle,
} from "lucide-react";

export default function Home() {
  const [subjects, setSubjects] = useState<SubjectCurriculum[]>(PRESET_CURRICULA);
  const [currentSubject, setCurrentSubject] = useState<SubjectCurriculum>(
    PRESET_CURRICULA[0]
  );
  const [activeConceptId, setActiveConceptId] = useState<string>(
    PRESET_CURRICULA[0].concepts[2].id // calc-product-rule
  );
  const [pace, setPace] = useState<"scaffolded" | "balanced" | "accelerated">(
    "balanced"
  );
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Diagnosed gaps
  const [diagnosedGaps, setDiagnosedGaps] = useState<
    Array<{
      id: string;
      topic: string;
      misconception: string;
      timestamp: Date;
      status: "open" | "resolved";
    }>
  >([
    {
      id: "gap-1",
      topic: "The Chain Rule",
      misconception:
        "Missing inner derivative g'(x) — applying power rule to outer shell only",
      timestamp: new Date(),
      status: "open",
    },
  ]);

  // Initial tutor greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content: `Welcome to **AI Teacher**! I am your adaptive tutor for **${currentSubject.name}**.

I monitor your learning pace and pinpoint cognitive gaps in real time so you never waste hours staring at confusing formulas.

We are currently focused on **${
        currentSubject.concepts.find((c) => c.id === activeConceptId)?.title ||
        "Product & Quotient Rules"
      }**. What is your intuition about how rates combine when two varying functions multiply?`,
      timestamp: new Date(),
      scaffoldQuestion:
        "If u(x) and v(x) are both growing, does (u * v)' simply equal u' * v', or is something else happening?",
      suggestedQuickReplies: [
        "Explain with an analogy",
        "Show a concrete example",
        "Give me a diagnostic quiz",
      ],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const activeConcept =
    currentSubject.concepts.find((c) => c.id === activeConceptId) ||
    currentSubject.concepts[0];

  const currentQuestion: PracticeQuestion | undefined =
    currentSubject.questions.find((q) => q.conceptId === activeConcept.id) ||
    currentSubject.questions[0];

  // Send message to tutor
  const handleSendMessage = async (
    userText: string,
    mode: "socratic" | "explain" | "analogy" | "practice" = "socratic"
  ) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const openGapsList = diagnosedGaps
        .filter((g) => g.status === "open")
        .map((g) => `${g.topic}: ${g.misconception}`);

      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: newMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          subject: currentSubject.name,
          currentTopic: activeConcept.title,
          pace,
          identifiedGaps: openGapsList,
          mode,
        }),
      });

      const data = await res.json();

      // If tutor caught a new knowledge gap, add to list
      if (data.detectedGap) {
        setDiagnosedGaps((prev) => [
          ...prev,
          {
            id: `gap-${Date.now()}`,
            topic: activeConcept.title,
            misconception: data.detectedGap,
            timestamp: new Date(),
            status: "open",
          },
        ]);

        // Mark concept node as having a gap
        setCurrentSubject((prevSub) => ({
          ...prevSub,
          concepts: prevSub.concepts.map((c) =>
            c.id === activeConcept.id ? { ...c, status: "gap" } : c
          ),
        }));
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        detectedGap: data.detectedGap,
        scaffoldQuestion: data.scaffoldQuestion,
        suggestedQuickReplies: data.suggestedQuickReplies,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "Let's refocus on this concept together. Would you like to see a step-by-step example or try a guided exercise?",
        timestamp: new Date(),
        suggestedQuickReplies: ["Step-by-step example", "Try a guided quiz"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle diagnostic quiz answer
  const handleAnswerSubmitted = (
    isCorrect: boolean,
    identifiedMisconception?: string
  ) => {
    if (isCorrect) {
      // Mark concept node as mastered
      setCurrentSubject((prevSub) => ({
        ...prevSub,
        concepts: prevSub.concepts.map((c) =>
          c.id === activeConcept.id ? { ...c, status: "mastered" } : c
        ),
      }));

      // If there were open gaps on this topic, mark resolved
      setDiagnosedGaps((prev) =>
        prev.map((g) =>
          g.topic === activeConcept.title ? { ...g, status: "resolved" } : g
        )
      );
    } else if (identifiedMisconception) {
      // Flag knowledge gap
      setDiagnosedGaps((prev) => [
        ...prev,
        {
          id: `gap-${Date.now()}`,
          topic: activeConcept.title,
          misconception: identifiedMisconception,
          timestamp: new Date(),
          status: "open",
        },
      ]);

      // Set concept status to gap
      setCurrentSubject((prevSub) => ({
        ...prevSub,
        concepts: prevSub.concepts.map((c) =>
          c.id === activeConcept.id ? { ...c, status: "gap" } : c
        ),
      }));
    }
  };

  const handleSelectConcept = (node: ConceptNode) => {
    setActiveConceptId(node.id);
    handleSendMessage(
      `I'd like to switch focus to "${node.title}". Could you introduce this concept at my current ${pace} pace?`,
      "explain"
    );
  };

  const handleRemediateGap = (
    concept: ConceptNode,
    misconceptionText: string
  ) => {
    setActiveConceptId(concept.id);
    handleSendMessage(
      `I need targeted help resolving this misconception regarding ${concept.title}: "${misconceptionText}". Can you walk me through where learners usually go wrong and give me a clear mental model?`,
      "socratic"
    );
  };

  const handleSubjectChange = (subject: SubjectCurriculum) => {
    setCurrentSubject(subject);
    const firstActive =
      subject.concepts.find((c) => c.status === "current") ||
      subject.concepts[0];
    setActiveConceptId(firstActive.id);

    setMessages([
      {
        id: `init-${Date.now()}`,
        role: "assistant",
        content: `Switched subject to **${subject.name}**!\n\n${subject.description}\n\nOur current checkpoint is **${firstActive.title}**. Ready to begin?`,
        timestamp: new Date(),
        scaffoldQuestion: `What prior familiarity do you have with ${firstActive.title}?`,
        suggestedQuickReplies: [
          "I'm a complete beginner",
          "I need a refresher",
          "Test my knowledge right away",
        ],
      },
    ]);
  };

  const openGapsCount = diagnosedGaps.filter((g) => g.status === "open").length;
  const masteredCount = currentSubject.concepts.filter(
    (c) => c.status === "mastered"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        currentSubject={currentSubject}
        subjects={subjects}
        onSelectSubject={handleSubjectChange}
        pace={pace}
        onPaceChange={setPace}
        gapCount={openGapsCount}
        masteredCount={masteredCount}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Adaptive Tutor Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              Adaptive Tutor That Personalizes to Learner Pace & Gaps
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mb-5 leading-relaxed">
              Never get left behind or held back. AI Teacher continuously analyzes your reasoning, diagnoses latent misconceptions, and recalibrates explanations to your velocity.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  handleSendMessage(
                    "Can you test my current baseline understanding with a diagnostic question?",
                    "practice"
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Diagnose My Gaps</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Custom Learning Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Adaptive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Socratic AI Tutor Chat (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <TutorChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              activeConcept={activeConcept}
              pace={pace}
              onPracticeTrigger={() => {
                const element = document.getElementById("practice-arena");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              onSelectConceptGap={(gapText) => {
                handleSendMessage(
                  `Can you explain the gap "${gapText}" in detail and show me how to overcome it?`,
                  "explain"
                );
              }}
            />

            {/* Diagnostic Practice Arena */}
            <div id="practice-arena">
              <DiagnosticPractice
                question={currentQuestion}
                activeConcept={activeConcept}
                onAnswerSubmitted={handleAnswerSubmitted}
                onRequestTutorHelp={(prompt) => handleSendMessage(prompt, "explain")}
              />
            </div>
          </div>

          {/* Right Column: Knowledge Map & Gap Radar (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Knowledge Gap Radar & Study Insights */}
            <GapRadar
              gaps={diagnosedGaps}
              concepts={currentSubject.concepts}
              pace={pace}
              onRemediateGap={(gap) => {
                const matchingConcept =
                  currentSubject.concepts.find(
                    (c) => c.title.toLowerCase() === gap.topic.toLowerCase()
                  ) || activeConcept;
                handleRemediateGap(matchingConcept, gap.misconception);
              }}
              onMarkResolved={(gapId) => {
                setDiagnosedGaps((prev) =>
                  prev.map((g) =>
                    g.id === gapId ? { ...g, status: "resolved" } : g
                  )
                );
              }}
            />

            {/* Adaptive Concept Roadmap */}
            <ConceptRoadmap
              concepts={currentSubject.concepts}
              activeConceptId={activeConcept.id}
              onSelectConcept={handleSelectConcept}
              onRemediateGap={handleRemediateGap}
            />
          </div>
        </div>
      </main>

      {/* Custom Topic Modal */}
      <CustomTopicModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCurriculumGenerated={(newCurriculum) => {
          setSubjects((prev) => [newCurriculum, ...prev]);
          handleSubjectChange(newCurriculum);
        }}
      />
    </div>
  );
}
