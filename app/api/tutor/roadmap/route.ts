import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { topic, gradeLevel = "College", learnerGoal = "" } = await req.json();

    const gemini = getGeminiClient();

    if (gemini) {
      const systemInstruction = `You are a curriculum architect specializing in adaptive learning and diagnostic pedagogy.
Generate a structured learning roadmap with 4 to 6 sequential concept nodes tailored for the requested topic.
For each concept, identify prerequisite dependencies, typical student misconceptions (so the adaptive engine can detect them), and difficulty.

RESPOND ONLY IN VALID JSON matching this format:
{
  "title": "Roadmap title",
  "category": "Discipline category",
  "badge": "Short 2-5 char symbol",
  "description": "Brief 1-2 sentence overview",
  "concepts": [
    {
      "id": "slug-id",
      "title": "Concept Name",
      "description": "What is learned and intuitive mental model",
      "prerequisites": ["prerequisite-slug-id"],
      "difficulty": "beginner" | "intermediate" | "advanced",
      "commonMisconceptions": ["Misconception A", "Misconception B"]
    }
  ],
  "sampleQuestion": {
    "question": "An insightful conceptual question",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why Option A is correct",
    "hint": "Gentle nudge"
  }
}`;

      const prompt = `Generate an adaptive curriculum roadmap for:
Topic: ${topic}
Level: ${gradeLevel}
Learner Goal: ${learnerGoal || "Deep conceptual mastery and fixing gaps"}`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return NextResponse.json(parsed);
    }

    // Default template fallback for custom roadmaps
    return NextResponse.json({
      title: topic,
      category: "Personalized Study",
      badge: "AI",
      description: `Custom adaptive mastery roadmap for ${topic}.`,
      concepts: [
        {
          id: "foundations",
          title: `Foundations of ${topic}`,
          description: "Core terminology, atomic units, and primary axioms.",
          prerequisites: [],
          difficulty: "beginner",
          commonMisconceptions: ["Confusing definitions with derived properties"],
        },
        {
          id: "mechanisms",
          title: `Core Dynamics & Mechanisms`,
          description: "How components interact and influence downstream behavior.",
          prerequisites: ["foundations"],
          difficulty: "intermediate",
          commonMisconceptions: ["Assuming linear scaling without feedback loops"],
        },
        {
          id: "problem-solving",
          title: `Applied Problem Solving & Edge Cases`,
          description: "Synthesizing principles to solve realistic scenarios.",
          prerequisites: ["mechanisms"],
          difficulty: "advanced",
          commonMisconceptions: ["Overlooking boundary constraints"],
        },
      ],
      sampleQuestion: {
        question: `When approaching a new problem in ${topic}, what is the most critical first step?`,
        options: [
          "Identify knowns, unknowns, and core governing constraints",
          "Immediately jump to complex calculations",
          "Ignore edge conditions until the end",
          "Apply memorized formulas without verifying prerequisites",
        ],
        correctIndex: 0,
        explanation:
          "Formulating the problem space and verifying prerequisite conditions ensures you avoid common conceptual traps.",
        hint: "Think about setting up the foundation before diving into mechanics.",
      },
    });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
