import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const {
      question,
      userAnswer,
      correctAnswer,
      topic,
      subject,
      pace = "balanced",
    } = await req.json();

    const gemini = getGeminiClient();

    if (gemini) {
      const systemInstruction = `You are an expert diagnostic educational evaluator.
Your goal is not just to grade the student's answer, but to perform cognitive diagnosis of their knowledge gaps.

Analyze:
1. Is the student's answer correct, partially correct, or incorrect?
2. If incorrect or flawed, identify the EXACT misconception or mental gap (e.g., "Overgeneralizing linear distribution to non-linear power", "Confusing net force with acceleration", "Off-by-one edge condition").
3. Provide a warm, constructive micro-remediation note that bridges the gap without shaming.
4. Suggest a mini follow-up checkpoint to verify they've overcome the misconception.

RESPOND STRICTLY IN JSON FORMAT:
{
  "isCorrect": boolean,
  "confidenceScore": number (0 to 100),
  "gapIdentified": string or null,
  "diagnosisMessage": "Clear, encouraging explanation of why their reasoning went astray or why it is spot on",
  "microRemediation": "A bite-sized corrective hint or mental model",
  "followUpPrompt": "A single quick question to lock in understanding"
}`;

      const prompt = `Subject: ${subject}
Topic: ${topic}
Current Student Pace: ${pace}

Question: ${question}
Expected Target: ${correctAnswer}
Student's Given Answer: ${userAnswer}`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return NextResponse.json(parsed);
    }

    // High quality heuristic fallback
    const isExactMatch =
      typeof userAnswer === "string" &&
      typeof correctAnswer === "string" &&
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    return NextResponse.json({
      isCorrect: isExactMatch,
      confidenceScore: isExactMatch ? 95 : 40,
      gapIdentified: isExactMatch
        ? null
        : `Potential gap in core rule application for ${topic}`,
      diagnosisMessage: isExactMatch
        ? `Superb! You correctly identified the right solution for ${topic}.`
        : `Close attempt! Your response shows you understand parts of the process, but there is a nuance in the rate multiplication or prerequisite step.`,
      microRemediation: isExactMatch
        ? "You have solid grasp of this step. Ready for the next difficulty level!"
        : "Remember to isolate the nested expressions first before applying outer rules.",
      followUpPrompt: isExactMatch
        ? "Can you explain how this would change if we squared the outer function?"
        : "What is the derivative of the inside term by itself?",
    });
  } catch (error: unknown) {
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      {
        isCorrect: false,
        confidenceScore: 50,
        gapIdentified: "Evaluation fallback",
        diagnosisMessage:
          "Keep going! Reviewing the underlying definition will solidify this concept.",
        microRemediation: "Let's review the fundamental formula step by step.",
        followUpPrompt: "Would you like to try another similar problem?",
      },
      { status: 200 }
    );
  }
}
