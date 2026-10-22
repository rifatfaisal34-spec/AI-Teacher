"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  PenTool,
  Eraser,
  RotateCcw,
  Sparkles,
  Upload,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  RefreshCw,
  Camera,
} from "lucide-react";

interface StepAnalysisItem {
  step: number;
  content: string;
  status: "valid" | "error" | "corrected";
  feedback: string;
}

interface VisualInspectionResult {
  transcription: string;
  isCorrect: boolean;
  errorStepNumber: number | null;
  detectedMisconception: string | null;
  stepAnalysis: StepAnalysisItem[];
  correctedDerivation: string;
  pedagogicalEncouragement: string;
}

interface VisualMathCanvasProps {
  currentTopic: string;
  subject: string;
  onSendToChat?: (explanation: string) => void;
}

export function VisualMathCanvas({
  currentTopic,
  subject,
  onSendToChat,
}: VisualMathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#818cf8");
  const [lineWidth, setLineWidth] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisualInspectionResult | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with dark canvas background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle graph grid lines for notebook feel
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let x = 20; x < canvas.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 20; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? "#090d16" : color;

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let x = 20; x < canvas.width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 20; y < canvas.height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    setResult(null);
    setActivePreset(null);
  };

  const loadSampleProblem = (title: string, problemText: string, handwrittenLines: string[]) => {
    clearCanvas();
    setActivePreset(title);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw stylized handwritten text on canvas
    ctx.font = "italic 20px 'Comic Sans MS', cursive, sans-serif";
    ctx.fillStyle = "#93c5fd";
    ctx.fillText(`Target: ${problemText}`, 30, 45);

    ctx.font = "19px 'Courier New', monospace";
    ctx.fillStyle = "#e2e8f0";

    handwrittenLines.forEach((line, index) => {
      ctx.fillText(line, 40, 95 + index * 45);
    });
  };

  const handleAnalyzeCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch("/api/tutor/visual-math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: dataUrl,
          topic: currentTopic,
          userPrompt: `Analyze this handwritten student step-by-step derivation for ${currentTopic}.`,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        clearCanvas();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Camera className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-100">
              Visual AI Math & Derivation Inspector
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Write your step-by-step math solution on the scratchpad or upload a photo of your notebook.
          </p>
        </div>

        {/* Sample presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Presets:</span>
          <button
            onClick={() =>
              loadSampleProblem(
                "Chain Rule Trap",
                "d/dx (3x^2 + 5)^4",
                [
                  "Step 1: let u = 3x^2 + 5",
                  "Step 2: h'(x) = 4 * u^3 = 4(3x^2 + 5)^3  <-- [Trap]",
                  "Step 3: final answer = 4(3x^2 + 5)^3"
                ]
              )
            }
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              activePreset === "Chain Rule Trap"
                ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            Chain Rule Trap
          </button>
          <button
            onClick={() =>
              loadSampleProblem(
                "Product Rule Error",
                "d/dx [x^3 * sin(x)]",
                [
                  "Step 1: u = x^3, v = sin(x)",
                  "Step 2: u' = 3x^2, v' = cos(x)",
                  "Step 3: d/dx = u' * v' = 3x^2 * cos(x) <-- [Trap]"
                ]
              )
            }
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              activePreset === "Product Rule Error"
                ? "bg-indigo-600/30 border-indigo-500 text-indigo-200"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            Product Rule Trap
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              tool === "pen"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Pen"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              tool === "eraser"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          {/* Color picks */}
          <div className="flex items-center gap-1">
            {["#818cf8", "#38bdf8", "#34d399", "#fbbf24", "#f43f5e"].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setTool("pen");
                }}
                style={{ backgroundColor: c }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  color === c && tool === "pen"
                    ? "scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900"
                    : "opacity-70 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          {/* Line width */}
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300 px-1.5 py-0.5 focus:outline-none"
          >
            <option value="2">Fine (2px)</option>
            <option value="3">Normal (3px)</option>
            <option value="5">Thick (5px)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Upload image */}
          <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
            <Upload className="w-3 h-3 text-indigo-400" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Clear canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAnalyzeCanvas}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Diagnosing Pixels...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inspect Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-[#090d16] touch-none">
        <canvas
          ref={canvasRef}
          width={750}
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[260px] sm:h-[300px] cursor-crosshair block"
        />
        <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] text-slate-600 font-mono">
          AI Visual Layer • Multimodal Vision Active
        </div>
      </div>

      {/* Inspection Results */}
      {result && (
        <div
          className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${
            result.isCorrect
              ? "bg-emerald-950/20 border-emerald-500/40"
              : "bg-amber-950/20 border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    Handwritten Solution 100% Mathematically Sound!
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    Cognitive Error Detected at Step {result.errorStepNumber || "2"}
                  </span>
                </>
              )}
            </div>
            {result.detectedMisconception && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Cognitive Gap Identified
              </span>
            )}
          </div>

          {/* Transcribed math preview */}
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 font-mono block mb-1">
              AI OCR Transcription:
            </span>
            <div className="font-mono text-slate-200">{result.transcription}</div>
          </div>

          {/* Line by line step breakdown */}
          {result.stepAnalysis && result.stepAnalysis.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Line-by-Line Mathematical Audit:
              </span>
              {result.stepAnalysis.map((item) => (
                <div
                  key={item.step}
                  className={`p-2 rounded-lg text-xs flex items-start gap-2.5 border ${
                    item.status === "error"
                      ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                      : item.status === "corrected"
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                      item.status === "error"
                        ? "bg-rose-500 text-white"
                        : item.status === "corrected"
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Step {item.step}
                  </span>
                  <div className="flex-1">
                    <div className="font-mono font-medium">{item.content}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {item.feedback}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Corrected derivation */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-xs">
            <span className="font-semibold text-indigo-300 flex items-center gap-1 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Corrected Conceptual Derivation:
            </span>
            <p className="whitespace-pre-wrap text-slate-300 font-mono leading-relaxed">
              {result.correctedDerivation}
            </p>
          </div>

          {/* Encouragement */}
          <div className="text-xs text-slate-400 italic">
            &ldquo;{result.pedagogicalEncouragement}&rdquo;
          </div>
        </div>
      )}
    </div>
  );
}
