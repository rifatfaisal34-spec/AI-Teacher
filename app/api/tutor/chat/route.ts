import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export interface TutorChatPayload {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  subject?: string;
  currentTopic?: string;
  pace?: "scaffolded" | "balanced" | "accelerated";
  identifiedGaps?: string[];
  mode?: "socratic" | "explain" | "analogy" | "practice";
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
    } = body || {};

    const gemini = getGeminiClient();

    if (gemini) {
      const paceInstructions = {
        scaffolded:
          "The learner needs foundational scaffolding. Speak with maximum clarity, break each concept into micro-steps (one at a time), use relatable real-world analogies, and never skip prerequisite algebra/logic.",
        balanced:
          "The learner has steady pace. Balance conceptual depth with concrete worked examples. Ask engaging check-ins without over-explaining trivial details.",
        accelerated:
          "The learner is fast-tracking. Be concise, highlight rigorous definitions, theoretical proofs, edge cases, and challenge them with higher-order implications.",
      }[pace];

      const modeInstructions = {
        socratic:
          "Adopt a Socratic coaching style. Rather than lecturing with a wall of text, guide the student with thoughtful questions, highlighting their reasoning steps.",
        explain:
          "Provide a crystal-clear, structured explanation with visual bullet points and code/math formatting where appropriate.",
        analogy:
          "Provide an intuitive, memorable real-world analogy to demystify this concept (e.g., gears, factory assembly lines, cooking recipes, city traffic).",
        practice:
          "Pose an active practice challenge for the student to solve right now, giving encouraging hints.",
      }[mode];

      const systemInstruction = `You are "AI Teacher", an empathetic, highly adaptive pedagogical AI tutor.
Your core mission is to personalize to learner pace and identify/repair knowledge gaps in real-time.

CONTEXT:
- Subject: ${subject}
- Current Active Concept: ${currentTopic}
- Learner Current Pace: ${pace.toUpperCase()} (${paceInstructions})
- Mode: ${mode.toUpperCase()} (${modeInstructions})
- Known Knowledge Gaps Previously Identified: ${
        identifiedGaps.length > 0 ? identifiedGaps.join("; ") : "None yet recorded."
      }

RESPONSE FORMAT:
You MUST respond with valid JSON containing the following structure:
{
  "reply": "Your primary markdown teaching response to the student.",
  "detectedGap": "A specific misconception or gap in understanding detected in the student's message (e.g., 'Confused scalar product with inner chain derivative', or null if no gap detected)",
  "scaffoldQuestion": "A targeted 1-sentence checkpoint question to test their understanding right now.",
  "paceRecommendation": "maintain" | "slow_down" | "speed_up",
  "suggestedQuickReplies": ["Short reply option 1", "Short reply option 2", "Short reply option 3"]
}
Keep "reply" engaging, formatted nicely with markdown (bolding, code blocks, lists). Keep suggestedQuickReplies short (<6 words each).`;

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
          paceRecommendation: parsed.paceRecommendation || "maintain",
          suggestedQuickReplies: parsed.suggestedQuickReplies || [
            "Explain with an analogy",
            "Give me a practice problem",
            "Why does this work?",
          ],
        });
      } catch {
        return NextResponse.json({
          reply: responseText,
          detectedGap: null,
          scaffoldQuestion: "Does that concept feel clear, or would you like to explore another example?",
          paceRecommendation: "maintain",
          suggestedQuickReplies: [
            "Explain simpler",
            "Test my understanding",
            "Show another example",
          ],
        });
      }
    }

    // Fallback adaptive response if GEMINI_API_KEY is not yet configured
    const fallbackResponse = generateAdaptiveFallback({
      message,
      subject,
      currentTopic,
      pace,
      mode,
    });

    return NextResponse.json(fallbackResponse);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Tutor chat API error:", errorMsg);
    return NextResponse.json(
      {
        reply: `I encountered an unexpected issue while processing your question (${errorMsg}). Let's refocus on **${body?.currentTopic || "our topic"}**. Would you like to review the core definition or try a guided exercise?`,
        detectedGap: null,
        scaffoldQuestion: "What is your immediate intuition about this concept?",
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

function generateAdaptiveFallback({
  message,
  subject,
  currentTopic,
  pace,
  mode,
}: {
  message: string;
  subject: string;
  currentTopic: string;
  pace: string;
  mode: string;
}) {
  const lower = message.toLowerCase();

  let detectedGap: string | null = null;
  let reply = "";
  let scaffoldQuestion = "";
  let quickReplies = ["Try an example", "Give me a hint", "Simpler please"];

  if (lower.includes("why") || lower.includes("how") || mode === "explain") {
    reply = `### Exploring **${currentTopic}** (${subject})

When we look at **${currentTopic}**, think of it as peeling layers of an onion:
1. **Outer Behavior**: How the primary container responds to changes.
2. **Inner Mechanism**: How the underlying components shift internally.

At your **${pace}** pace:
${
  pace === "scaffolded"
    ? `* We take one element at a time.\n* Notice that if you change the inner part, the whole system scales by that rate of change.\n* Let's make sure we don't rush into formulas before the physical or geometric picture makes 100% sense.`
    : pace === "accelerated"
    ? `* Rigorously, this corresponds to the composition of linear transformations and differential forms.\n* The derivative satisfies the chain composition theorem $D(f \\circ g)(x) = Df(g(x)) \\circ Dg(x)$.`
    : `* The key is to keep the inside intact while differentiating the outside, and then multiply by the internal derivative.\n* Notice how $(3x+1)^2$ requires both the $2(3x+1)$ power drop and the factor of $3$.`
}

> **Key Rule of Thumb:** Never differentiate inside and outside simultaneously!`;
    scaffoldQuestion = `If you have $f(g(x))$, what role does $g'(x)$ play in the final rate?`;
    quickReplies = ["Show an analogy", "Give me a challenge", "I want a practice problem"];
  } else if (lower.includes("analogy") || mode === "analogy") {
    reply = `### Real-World Analogy: The Russian Nesting Dolls & Gear Train

Imagine a nested gear train in a Swiss watch or bicycle:
- **Gear A** turns **Gear B**, which turns **Gear C**.
- If Gear A spins twice as fast, and Gear B is geared 3:1 to Gear C, how much faster does Gear C turn?
- You don't add them; you **multiply their ratios**! $(2 \\times 3 = 6)$.

In **${currentTopic}**, the outer function is the big wheel, and the inner function is the small gear. The overall sensitivity is the product of both gears working together.`;
    scaffoldQuestion = `Can you see why we multiply the rates instead of adding them?`;
    quickReplies = ["That makes sense!", "Let's test this in math", "Show another example"];
  } else if (lower.includes("don't get") || lower.includes("confused") || lower.includes("hard")) {
    detectedGap = "Foundational prerequisite uncertainty in " + currentTopic;
    reply = `That is completely natural! A lot of learners feel stuck right here because traditional textbooks present the formulas without the visual intuition.

Let's pause and strip away the intimidating notation:
1. What does the *outer* part look like if you replace the whole messy inside with a single letter like $u$?
2. Once that outer derivative is done, we just multiply by what $u$ contributes.

You're making great progress by asking questions whenever something feels murky!`;
    scaffoldQuestion = "If we replace the complicated inner expression with 'u', what does the outer derivative become?";
    quickReplies = ["Walk me through it", "Let's do a concrete problem", "Explain with simpler terms"];
  } else {
    reply = `Great question regarding **${currentTopic}**! 

At our current **${pace}** pace, let's observe how this connects to what you've already mastered:
- You already know how single variables behave.
- Now, when functions are nested or interacting, the rate of change cascades.
- Every small nudge in the input causes a wave through each functional layer.

What part of this feels most intuitive so far, and where would you like to zoom in?`;
    scaffoldQuestion = `Do you want to see a step-by-step breakdown or jump into a quick diagnostic quiz?`;
    quickReplies = ["Step-by-step breakdown", "Test my knowledge", "Explain with an analogy"];
  }

  return {
    reply,
    detectedGap,
    scaffoldQuestion,
    paceRecommendation: "maintain",
    suggestedQuickReplies: quickReplies,
  };
}
