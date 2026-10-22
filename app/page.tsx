"use client";

import React, { useState, useEffect } from "react";
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
import { VisualMathCanvas } from "@/components/VisualMathCanvas";
import { FlippedClassroom } from "@/components/FlippedClassroom";
import { CareerPathPlanner } from "@/components/CareerPathPlanner";
import { ScoreImprovementBar } from "@/components/ScoreImprovementBar";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Gauge,
  BookOpen,
  HelpCircle,
  PenTool,
  RotateCcw,
  Briefcase,
  Layers,
  GraduationCap,
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

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    "tutor" | "visual_math" | "flipped_classroom" | "career_path" | "radar"
  >("tutor");

  // Measurable score improvement metrics
  const [baselineScore, setBaselineScore] = useState(58);
  const [currentScore, setCurrentScore] = useState(79);
  const [averageLatencySeconds, setAverageLatencySeconds] = useState(18);
  const [currentBloomsLevel, setCurrentBloomsLevel] = useState("Understand");
  const [eslLanguage, setEslLanguage] = useState<
    "none" | "spanish" | "mandarin" | "hindi" | "arabic"
  >("none");

  // Deliberation latency tracking (safely initialized in useEffect to avoid hydration mismatch)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [activeConceptId]);

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
      timestamp: new Date(1730000000000),
      status: "open",
    },
  ]);

  // Initial tutor greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content: `Welcome to **AI Teacher**! Grounded in **OpenStax** peer-reviewed curricula and calibrated by **Bloom's Taxonomy**.

I continuously monitor your learning pace, deliberation latency, and cognitive gaps in real time to deliver **measurable score improvements**.

Currently focused on **The Chain Rule**. What is your immediate intuition regarding how composite rates of change multiply?`,
      timestamp: new Date(1730000000000),
      scaffoldQuestion:
        "If u(x) and v(x) are both growing, does (u * v)' simply equal u' * v', or is something else happening?",
      suggestedQuickReplies: [
        "Explain with an analogy",
        "Show OpenStax textbook excerpt",
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
    // Calculate response latency safely
    const now = Date.now();
    const latency = questionStartTime > 0 ? Math.max(2, Math.round((now - questionStartTime) / 1000)) : 15;
    setAverageLatencySeconds((prev) => Math.round((prev * 2 + latency) / 3));

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
          bloomsLevel: currentBloomsLevel,
          latencySeconds: latency,
          eslLanguage,
        }),
      });

      const data = await res.json();

      if (data.bloomsLevelDemonstrated) {
        setCurrentBloomsLevel(data.bloomsLevelDemonstrated);
      }

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
      setQuestionStartTime(Date.now());
    }
  };

  // Handle diagnostic quiz answer
  const handleAnswerSubmitted = (
    isCorrect: boolean,
    identifiedMisconception?: string
  ) => {
    if (isCorrect) {
      // Measurable score improvement boost
      setCurrentScore((prev) => Math.min(99, prev + 4));

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
    setActiveTab("tutor");
    handleSendMessage(
      `I'd like to switch focus to "${node.title}". Could you introduce this concept with relevant OpenStax curriculum grounding?`,
      "explain"
    );
  };

  const handleRemediateGap = (
    concept: ConceptNode,
    misconceptionText: string
  ) => {
    setActiveConceptId(concept.id);
    setActiveTab("tutor");
    handleSendMessage(
      `I need targeted remediation resolving this misconception in ${concept.title}: "${misconceptionText}". Please break down where students get trapped and how to avoid it.`,
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
        content: `Switched subject to **${subject.name}**!\n\n${subject.description}\n\nOur active focus node is **${firstActive.title}**. Calibrating to Bloom's Level: **${currentBloomsLevel}**.`,
        timestamp: new Date(),
        scaffoldQuestion: `What prior familiarity do you have with ${firstActive.title}?`,
        suggestedQuickReplies: [
          "I'm a complete beginner",
          "I need a refresher",
          "Test my knowledge with a quiz",
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Measurable Score Gain & Profiling Telemetry Bar */}
        <ScoreImprovementBar
          baselineScore={baselineScore}
          currentScore={currentScore}
          averageLatencySeconds={averageLatencySeconds}
          currentBloomsLevel={currentBloomsLevel}
          eslLanguage={eslLanguage}
          onEslLanguageChange={setEslLanguage}
          onBloomsSelect={(lvl) => {
            setCurrentBloomsLevel(lvl);
            handleSendMessage(
              `Please calibrate our questions to Bloom's Taxonomy cognitive level: ${lvl}.`,
              "socratic"
            );
          }}
        />

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("tutor")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "tutor"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Socratic AI Tutor</span>
          </button>
          <button
            onClick={() => setActiveTab("visual_math")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "visual_math"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Visual Math Inspector (Handwritten AI)</span>
          </button>
          <button
            onClick={() => setActiveTab("flipped_classroom")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "flipped_classroom"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Flipped Classroom (Teach the AI)</span>
          </button>
          <button
            onClick={() => setActiveTab("career_path")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "career_path"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Career-Integrated Paths</span>
          </button>
          <button
            onClick={() => setActiveTab("radar")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === "radar"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Curriculum Map & Gaps</span>
          </button>
        </div>

        {/* Tab 1: Socratic AI Tutor + Practice Arena */}
        {activeTab === "tutor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

            <div className="lg:col-span-5 space-y-6">
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

              <ConceptRoadmap
                concepts={currentSubject.concepts}
                activeConceptId={activeConcept.id}
                onSelectConcept={handleSelectConcept}
                onRemediateGap={handleRemediateGap}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Visual AI Math Inspector */}
        {activeTab === "visual_math" && (
          <div className="space-y-6">
            <VisualMathCanvas
              currentTopic={activeConcept.title}
              subject={currentSubject.name}
              onSendToChat={(text) => {
                setActiveTab("tutor");
                handleSendMessage(text, "explain");
              }}
            />
          </div>
        )}

        {/* Tab 3: Flipped Classroom (Feynman Technique) */}
        {activeTab === "flipped_classroom" && (
          <div className="space-y-6">
            <FlippedClassroom
              currentTopic={activeConcept.title}
              subject={currentSubject.name}
            />
          </div>
        )}

        {/* Tab 4: Career-Integrated Path Generator */}
        {activeTab === "career_path" && (
          <div className="space-y-6">
            <CareerPathPlanner
              onSelectModuleTopic={(modTopic) => {
                setActiveTab("tutor");
                handleSendMessage(
                  `Let's start the career-integrated module on "${modTopic}". Ground it in industry requirements and practical code/problem exercises.`,
                  "socratic"
                );
              }}
            />
          </div>
        )}

        {/* Tab 5: Standalone Knowledge Map & Gap Radar */}
        {activeTab === "radar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <ConceptRoadmap
              concepts={currentSubject.concepts}
              activeConceptId={activeConcept.id}
              onSelectConcept={handleSelectConcept}
              onRemediateGap={handleRemediateGap}
            />
          </div>
        )}
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
