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
import { ScoreImprovementBar } from "@/components/ScoreImprovementBar";
import { WorthRevisitingCard } from "@/components/WorthRevisitingCard";
import { GapRadar } from "@/components/GapRadar";
import { CustomTopicModal } from "@/components/CustomTopicModal";
import { VisualMathCanvas } from "@/components/VisualMathCanvas";
import { FlippedClassroom } from "@/components/FlippedClassroom";
import { CareerPathPlanner } from "@/components/CareerPathPlanner";

export default function Home() {
  const [subjects, setSubjects] = useState<SubjectCurriculum[]>(PRESET_CURRICULA);
  const [currentSubject, setCurrentSubject] = useState<SubjectCurriculum>(
    PRESET_CURRICULA[0]
  );
  // Default to calc-product-rule as shown in the screenshot
  const [activeConceptId, setActiveConceptId] = useState<string>(
    PRESET_CURRICULA[0].concepts[2].id // calc-product-rule: Product & Quotient Rules
  );
  const [pace, setPace] = useState<"scaffolded" | "balanced" | "accelerated">(
    "balanced"
  );
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Active view tab: defaults to the lesson view shown in screenshot
  const [activeTab, setActiveTab] = useState<
    "tutor" | "visual_math" | "flipped_classroom" | "career_path" | "radar"
  >("tutor");

  // Measurable score improvement metrics matching screenshot
  const [baselineScore, setBaselineScore] = useState(58);
  const [currentScore, setCurrentScore] = useState(79);
  const [averageLatencySeconds, setAverageLatencySeconds] = useState(18);
  const [currentBloomsLevel, setCurrentBloomsLevel] = useState("Apply");
  const [eslLanguage, setEslLanguage] = useState<
    "none" | "spanish" | "mandarin" | "hindi" | "arabic"
  >("none");

  // Deliberation latency tracking
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
      topic: "The chain rule",
      misconception:
        "I noticed you've been skipping the derivative of the inner function. It's a common slip, and an easy one to fix. Want to go through it together?",
      timestamp: new Date(1730000000000),
      status: "open",
    },
  ]);

  // Initial messages matching the screenshot conversation flow
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "assistant",
      content:
        "You've got power rule down. Now two functions are multiplying each other and both are changing. Before I show you anything, I'd like to hear your instinct.",
      timestamp: new Date(1730000000000),
      scaffoldQuestion:
        "If u(x) and v(x) are both growing, does (u·v)' simply equal u'·v'... or is something else happening?",
      suggestedQuickReplies: [
        "Try an analogy",
        "Show me a worked example",
        "Explain it simpler",
      ],
    },
    {
      id: "msg-2",
      role: "user",
      content:
        "Can we make the questions a bit harder? I want to be pushed on this.",
      timestamp: new Date(1730000010000),
    },
    {
      id: "msg-3",
      role: "assistant",
      content:
        "Happy to. I'll raise the bar — here's one that asks you to apply the rule, not just recall it. Take your time.",
      timestamp: new Date(1730000020000),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const activeConcept =
    currentSubject.concepts.find((c) => c.id === activeConceptId) ||
    currentSubject.concepts[0];

  const currentQuestion: PracticeQuestion | undefined =
    currentSubject.questions.find((q) => q.conceptId === activeConcept.id) ||
    currentSubject.questions[0];

  // Send message to Socratic tutor
  const handleSendMessage = async (
    userText: string,
    mode: "socratic" | "explain" | "analogy" | "practice" = "socratic"
  ) => {
    const now = Date.now();
    const latency =
      questionStartTime > 0
        ? Math.max(2, Math.round((now - questionStartTime) / 1000))
        : 18;
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
      console.error("Chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `Let's focus on **${activeConcept.title}**. What is your intuition for how the rate of change behaves here?`,
        timestamp: new Date(),
        suggestedQuickReplies: [
          "Try an analogy",
          "Show me a worked example",
          "Explain it simpler",
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setQuestionStartTime(Date.now());
    }
  };

  // Handle Quick Check submission
  const handleAnswerSubmitted = (
    isCorrect: boolean,
    identifiedMisconception?: string
  ) => {
    if (isCorrect) {
      setCurrentScore((prev) => Math.min(99, prev + 3));

      setCurrentSubject((prevSub) => ({
        ...prevSub,
        concepts: prevSub.concepts.map((c) =>
          c.id === activeConcept.id ? { ...c, status: "mastered" } : c
        ),
      }));

      setDiagnosedGaps((prev) =>
        prev.map((g) =>
          g.topic.toLowerCase() === activeConcept.title.toLowerCase()
            ? { ...g, status: "resolved" }
            : g
        )
      );
    } else if (identifiedMisconception) {
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
      `I'd like to switch focus to "${node.title}". Could you introduce this concept with intuition?`,
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
      `I'd like to work on "${concept.title}" with you. Specifically regarding: "${misconceptionText}". Can you guide me through it?`,
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
        id: `msg-sub-${Date.now()}`,
        role: "assistant",
        content: `We're now studying **${subject.name}**.\n\n${subject.description}\n\nOur current focus is **${firstActive.title}**. What's your immediate intuition here?`,
        timestamp: new Date(),
        suggestedQuickReplies: [
          "Try an analogy",
          "Show me a worked example",
          "Explain it simpler",
        ],
      },
    ]);
  };

  const openGaps = diagnosedGaps.filter((g) => g.status === "open");
  const topGap = openGaps[0];
  const masteredCount = currentSubject.concepts.filter(
    (c) => c.status === "mastered"
  ).length;
  const totalConcepts = currentSubject.concepts.length;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F4F4F5] flex flex-col font-sans selection:bg-[#E8B288]/30 selection:text-[#E8B288]">
      {/* Top Header */}
      <Header
        currentSubject={currentSubject}
        subjects={subjects}
        onSelectSubject={handleSubjectChange}
        pace={pace}
        onPaceChange={setPace}
        gapCount={openGaps.length}
        masteredCount={masteredCount}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        eslLanguage={eslLanguage}
        onEslLanguageChange={setEslLanguage}
        bloomsLevel={currentBloomsLevel}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Main Lesson View (Matches the screenshot layout) */}
        {activeTab === "tutor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Lesson Stream & Quick Check */}
            <div className="lg:col-span-8">
              <TutorChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeConcept={activeConcept}
                pace={pace}
                currentQuestion={currentQuestion}
                onAnswerSubmitted={handleAnswerSubmitted}
                onSelectConceptGap={(gapText) => {
                  handleSendMessage(
                    `Can you explain the gap "${gapText}" in detail and guide me through fixing it?`,
                    "explain"
                  );
                }}
              />
            </div>

            {/* Right Column: Score progress, Worth Revisiting card, Your Path */}
            <div className="lg:col-span-4 space-y-2 sticky top-24">
              {/* Score Improvement Widget */}
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
                masteredCount={masteredCount}
                totalConcepts={totalConcepts}
              />

              {/* Worth Revisiting Card */}
              {topGap && (
                <WorthRevisitingCard
                  topic={topGap.topic}
                  misconception={topGap.misconception}
                  onWorkWithMaya={() => {
                    const matching =
                      currentSubject.concepts.find(
                        (c) =>
                          c.title.toLowerCase() === topGap.topic.toLowerCase()
                      ) ||
                      currentSubject.concepts.find((c) => c.status === "gap") ||
                      activeConcept;
                    handleRemediateGap(matching, topGap.misconception);
                  }}
                  onDismiss={() => {
                    setDiagnosedGaps((prev) =>
                      prev.map((g) =>
                        g.id === topGap.id ? { ...g, status: "resolved" } : g
                      )
                    );
                  }}
                />
              )}

              {/* Concept Roadmap (YOUR PATH) */}
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
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h2 className="font-serif text-2xl text-white">
                  Visual Math Canvas
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Draw equations or diagrams by hand. Gemini analyzes geometric steps and derivations in real time.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("tutor")}
                className="text-xs text-[#E8B288] hover:underline"
              >
                Back to Lesson
              </button>
            </div>
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
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h2 className="font-serif text-2xl text-white">
                  Teach Maya (Flipped Classroom)
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Test your mastery using the Feynman Technique. Explain the concept to Maya and let her probe your logic.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("tutor")}
                className="text-xs text-[#E8B288] hover:underline"
              >
                Back to Lesson
              </button>
            </div>
            <FlippedClassroom
              currentTopic={activeConcept.title}
              subject={currentSubject.name}
            />
          </div>
        )}

        {/* Tab 4: Career-Integrated Path Generator */}
        {activeTab === "career_path" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h2 className="font-serif text-2xl text-white">
                  Career-Integrated Paths
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Connect theoretical calculus, physics, and algorithms to industry applications like Robotics, ML, and Financial Modeling.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("tutor")}
                className="text-xs text-[#E8B288] hover:underline"
              >
                Back to Lesson
              </button>
            </div>
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
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h2 className="font-serif text-2xl text-white">
                  Curriculum Map & Knowledge Gaps
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Track cognitive bottlenecks, diagnosed misconceptions, and OpenStax alignment.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("tutor")}
                className="text-xs text-[#E8B288] hover:underline"
              >
                Back to Lesson
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

              <div className="bg-[#121214] border border-neutral-800 rounded-2xl p-6">
                <ConceptRoadmap
                  concepts={currentSubject.concepts}
                  activeConceptId={activeConcept.id}
                  onSelectConcept={handleSelectConcept}
                  onRemediateGap={handleRemediateGap}
                />
              </div>
            </div>
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
