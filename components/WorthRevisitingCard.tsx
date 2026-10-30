"use client";

import React, { useState } from "react";

interface WorthRevisitingCardProps {
  topic?: string;
  misconception?: string;
  onWorkWithMaya: () => void;
  onDismiss?: () => void;
}

export function WorthRevisitingCard({
  topic = "The chain rule",
  misconception = "I noticed you've been skipping the derivative of the inner function. It's a common slip, and an easy one to fix. Want to go through it together?",
  onWorkWithMaya,
  onDismiss,
}: WorthRevisitingCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-[#141416] border border-neutral-800/80 rounded-2xl p-5 my-6 shadow-md">
      <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
        WORTH REVISITING
      </div>

      <h3 className="font-serif text-lg text-white font-medium mt-1">
        {topic}
      </h3>

      <p className="text-xs text-neutral-400 leading-relaxed mt-2">
        {misconception}
      </p>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={onWorkWithMaya}
          className="bg-[#E8B288] hover:bg-[#d9a47a] text-neutral-950 text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          Work on it with Maya
        </button>
        <button
          type="button"
          onClick={() => {
            setIsDismissed(true);
            onDismiss?.();
          }}
          className="text-xs text-neutral-400 hover:text-neutral-200 px-2 py-2 transition-colors cursor-pointer"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
