import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { OPENSTAX_KNOWLEDGE_BASE, RAGSource } from "@/lib/rag-data";

export interface TutorChatPayload {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  subject?: string;
  currentTopic?: string;
  pace?: "scaffolded" | "balanced" | "accelerated";
  identifiedGaps?: string[];
  mode?: "socratic" | "explain" | "analogy" | "practice";
  bloomsLevel?: string;
  latencySeconds?: number;
  eslLanguage?: "none" | "spanish" | "mandarin" | "hindi" | "arabic";
}

export async function POST(req: NextRequest) {
  let body: TutorChatPayload | null = null;
  try {
    body = await req.json();
    const {
      message = "",
      history = [],
      subject = "Calculus",
      currentTopic = "The Chain Rule",
      pace = "balanced",
      identifiedGaps = [],
      mode = "socratic",
      bloomsLevel = "Understand",
      latencySeconds = 15,
      eslLanguage = "none",
    } = body || {};

    const gemini = getGeminiClient();

    // RAG Retrieval: find matching textbook/curriculum sources
    const relevantRAGSources: RAGSource[] = OPENSTAX_KNOWLEDGE_BASE.filter(
      (source) =>
        source.subject.toLowerCase() === subject.toLowerCase() ||
        source.title.toLowerCase().includes(currentTopic.toLowerCase()) ||
        currentTopic.toLowerCase().split(" ").some((w) => source.snippet.toLowerCase().includes(w))
    );

    const ragContext =
      relevantRAGSources.length > 0
        ? relevantRAGSources
            .map(
              (s) =>
                `[Source: ${s.sourceType} - ${s.title}]\nCitation: ${s.citation}\nExcerpt: "${s.snippet}"`
            )
            .join("\n\n")
        : `[Source: OpenStax Open Curriculum]\nStandard peer-reviewed syllabus for ${subject}: ${currentTopic}.`;

    if (gemini) {
      const paceInstructions = {
        scaffolded:
          "The learner needs foundational scaffolding. Speak with maximum clarity, break each concept into micro-steps (one at a time), use relatable real-world analogies, and never skip prerequisite algebra/logic.",
        balanced:
          "The learner has steady pace. Balance conceptual depth with concrete worked examples. Ask engaging check-ins without over-explaining trivial details.",
        accelerated:
          "The learner is fast-tracking. Be concise, highlight rigorous definitions, theoretical proofs, edge cases, and challenge them with higher-order implications.",
      }[pace];

      const latencyFeedback =
        latencySeconds > 60
          ? "NOTE: The student hesitated for over 60 seconds before responding. This indicates high cognitive load or confusion. Acknowledge this gently and offer a supportive hint."
          : latencySeconds < 4
          ? "NOTE: The student responded in under 4 seconds, which may indicate quick guessing without deliberation. Check their foundational reasoning."
          : `Student response latency was ${latencySeconds}s (healthy deliberation time).`;

      const eslInstruction =
        eslLanguage !== "none"
          ? `ESL BILINGUAL CODE-SWITCHING ACTIVE: The student's primary language context is ${eslLanguage.toUpperCase()}. Code-switch naturally between English and key conceptual terms or clarifying phrases in ${eslLanguage.toUpperCase()} to bridge English language gaps while building English academic fluency.`
          : "";

      const systemInstruction = `You are "AI Teacher", an empathetic, highly adaptive pedagogical AI tutor grounded in OpenStax, Khan Academy, and ArXiv curriculum standards.
Your core mission is to personalize to learner pace, monitor response latency, calibrate Bloom's Taxonomy cognitive depth, and repair knowledge gaps in real-time.

CURRICULUM CONTEXT (RAG):
${ragContext}

LEARNER PROFILE:
- Subject: ${subject}
- Active Concept: ${currentTopic}
- Current Pace: ${pace.toUpperCase()} (${paceInstructions})
- Target Bloom's Taxonomy Level: ${bloomsLevel} (Remember -> Understand -> Apply -> Analyze -> Evaluate -> Create)
- Response Latency Signal: ${latencyFeedback}
${eslInstruction ? `- Multilingual Instruction: ${eslInstruction}` : ""}
- Known Knowledge Gaps Previously Identified: ${
        identifiedGaps.length > 0 ? identifiedGaps.join("; ") : "None yet recorded."
      }

RESPONSE FORMAT:
You MUST respond with valid JSON matching:
{
  "reply": "Your primary markdown teaching response to the student.",
  "detectedGap": "A specific misconception or gap in understanding detected in the student's message (e.g., 'Confused scalar product with inner chain derivative', or null if no gap detected)",
  "scaffoldQuestion": "A targeted 1-sentence checkpoint question at the target Bloom's level to test their understanding.",
  "bloomsLevelDemonstrated": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create",
  "ragCitations": ["OpenStax Section 3.6", "Khan Academy Calculus"],
  "paceRecommendation": "maintain" | "slow_down" | "speed_up",
  "suggestedQuickReplies": ["Short reply 1", "Short reply 2", "Short reply 3"]
}
Keep formatting clean, formatted nicely with markdown (LaTeX like $f'(x)$, bolding, bullet points).`;

      const promptHistory = history
        .slice(-6)
        .map((h) => `${h.role === "user" ? "Student" : "AI Teacher"}: ${h.content}`)
        .join("\n\n");

      const prompt = `${promptHistory ? promptHistory + "\n\n" : ""}Student: ${message}`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text?.trim() || "";
      try {
        const parsed = JSON.parse(responseText);
        return NextResponse.json({
          reply: parsed.reply || responseText,
          detectedGap: parsed.detectedGap || null,
          scaffoldQuestion: parsed.scaffoldQuestion || null,
          bloomsLevelDemonstrated: parsed.bloomsLevelDemonstrated || bloomsLevel,
          ragCitations: parsed.ragCitations || [
            relevantRAGSources[0]?.title || "OpenStax Peer-Reviewed Textbooks",
          ],
          paceRecommendation: parsed.paceRecommendation || "maintain",
          suggestedQuickReplies: parsed.suggestedQuickReplies || [
            "Explain with an analogy",
            "Give me an active practice problem",
            "Why does this work?",
          ],
        });
      } catch {
        return NextResponse.json({
          reply: responseText,
          detectedGap: null,
          scaffoldQuestion: "Does that concept feel clear, or would you like to explore another example?",
          bloomsLevelDemonstrated: bloomsLevel,
          ragCitations: [relevantRAGSources[0]?.title || "OpenStax Peer-Reviewed Textbooks"],
          paceRecommendation: "maintain",
          suggestedQuickReplies: [
            "Explain simpler",
            "Test my understanding",
            "Show another example",
          ],
        });
      }
    }

    // High quality fallback
    const citation = relevantRAGSources[0]
      ? relevantRAGSources[0].title
      : "OpenStax Open-Source Peer-Reviewed Textbooks";

    let reply = `### Exploring **${currentTopic}** (${subject})\n\n`;

    if (eslLanguage === "spanish") {
      reply += `*¡Hola!* En términos sencillos (*In simple terms*), analizamos **${currentTopic}** paso a paso.\n\n`;
    } else if (eslLanguage === "mandarin") {
      reply += `我们来深入了解 **${currentTopic}**（*Let's break down this concept*）:\n\n`;
    }

    reply += `According to **${citation}**:
When breaking down composite structures, we examine how the outer framework responds relative to inner shifts.

**Target Bloom's Level (${bloomsLevel}):**
* We move beyond simple memorization to actively diagnosing why the formula holds true.
* Remember: The internal rate behaves like a multiplier gear ($g'(x)$). Never drop the inner derivative!`;

    return NextResponse.json({
      reply,
      detectedGap: null,
      scaffoldQuestion: `At the ${bloomsLevel} level: How would you verify whether your derived result matches the physical rate of change?`,
      bloomsLevelDemonstrated: bloomsLevel,
      ragCitations: [citation],
      paceRecommendation: "maintain",
      suggestedQuickReplies: [
        "Explain with an analogy",
        "Give me a challenge problem",
        "Simpler explanation please",
      ],
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Tutor chat API error:", errorMsg);
    return NextResponse.json(
      {
        reply: `I encountered an unexpected issue while processing your question (${errorMsg}). Let's refocus on **${body?.currentTopic || "our topic"}**. Would you like to review the core definition or try a guided exercise?`,
        detectedGap: null,
        scaffoldQuestion: "What is your immediate intuition about this concept?",
        bloomsLevelDemonstrated: "Understand",
        ragCitations: ["OpenStax Open-Source Curriculum"],
        paceRecommendation: "maintain",
        suggestedQuickReplies: [
          "Break it down step-by-step",
          "Show a practical example",
          "Test me on the basics",
        ],
      },
      { status: 200 }
    );
  }
}
