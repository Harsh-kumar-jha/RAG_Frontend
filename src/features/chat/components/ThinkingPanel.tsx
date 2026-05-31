"use client";

import { useState } from "react";
import { ChevronDown, Zap, Sparkles } from "lucide-react";
import { TypewriterText } from "./TypewriterText";

interface ThinkingPanelProps {
  thinking: string;
  isStreaming: boolean;
  streamedAnswer?: string;
}

/**
 * Collapsible panel to show backend processing logs and LLM generation.
 * Displays processing status and streaming answer in a hidden dropdown.
 * Shows backend logs like indexing, embedding, retrieval, and the generated response.
 */
export const ThinkingPanel = ({
  thinking,
  isStreaming,
  streamedAnswer,
}: ThinkingPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!thinking.trim() && !streamedAnswer?.trim()) return null;

  // Parse thinking text to identify log types
  const lines = thinking.split("\n").filter((line) => line.trim());
  const isErrorLog = thinking.toLowerCase().includes("error");
  const isProcessingLog =
    thinking.toLowerCase().includes("indexing") ||
    thinking.toLowerCase().includes("processing") ||
    thinking.toLowerCase().includes("searching") ||
    thinking.toLowerCase().includes("embedding") ||
    thinking.toLowerCase().includes("retrieving");

  const hasGeneratedAnswer = streamedAnswer?.trim() && streamedAnswer.trim().length > 0;

  // Determine colors based on log type
  const getBorderColor = () => {
    if (isErrorLog) return "border-red-200";
    if (isProcessingLog || hasGeneratedAnswer) return "border-indigo-200";
    return "border-slate-200";
  };

  const getBgColor = () => {
    if (isErrorLog) return "bg-red-50";
    if (isProcessingLog || hasGeneratedAnswer) return "bg-indigo-50";
    return "bg-slate-50";
  };

  const getHoverColor = () => {
    if (isErrorLog) return "hover:bg-red-100";
    if (isProcessingLog || hasGeneratedAnswer) return "hover:bg-indigo-100";
    return "hover:bg-slate-100";
  };

  const getTextColor = () => {
    if (isErrorLog) return "text-red-700";
    if (isProcessingLog || hasGeneratedAnswer) return "text-indigo-700";
    return "text-slate-700";
  };

  const getIconColor = () => {
    if (isErrorLog) return "text-red-600";
    if (hasGeneratedAnswer) return "text-indigo-600";
    if (isProcessingLog) return "text-amber-600";
    return "text-indigo-600";
  };

  const getChevronColor = () => {
    if (isErrorLog) return "text-red-500";
    if (isProcessingLog || hasGeneratedAnswer) return "text-indigo-500";
    return "text-slate-500";
  };

  return (
    <div
      className={`mb-3 rounded-lg border overflow-hidden transition-colors ${ getBorderColor() } ${ getBgColor() }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-2 px-3 py-2 transition-colors text-sm ${ getHoverColor() }`}
      >
        <div className="flex items-center gap-2">
          {hasGeneratedAnswer ? (
            <Sparkles size={14} className={`flex-shrink-0 ${ getIconColor() }`} />
          ) : (
            <Zap size={14} className={`flex-shrink-0 ${ getIconColor() }`} />
          )}
          <span className={`font-medium ${ getTextColor() }`}>
            {isStreaming ? (
              <>
                <span className="inline-block animate-pulse">●</span>{" "}
                {hasGeneratedAnswer ? "Generating Response..." : "Processing..."}
              </>
            ) : isErrorLog ? (
              "Processing Errors"
            ) : hasGeneratedAnswer ? (
              "Response Generated"
            ) : (
              "Processing Details"
            )}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform ${ getChevronColor() } ${ isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {isOpen && (
        <div
          className={`border-t px-3 py-2 bg-white ${ isErrorLog
              ? "border-red-200"
              : isProcessingLog || hasGeneratedAnswer
                ? "border-indigo-200"
                : "border-slate-200"
            }`}
        >
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Processing Logs Section */}
            {lines.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Processing Logs
                </div>
                <div
                  className={`text-xs leading-relaxed font-mono ${ isErrorLog
                      ? "text-red-800"
                      : isProcessingLog
                        ? "text-amber-900"
                        : "text-slate-700"
                    }`}
                >
                  {lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`pl-2 ${ line.toLowerCase().includes("error")
                          ? "text-red-700 font-semibold"
                          : line.toLowerCase().includes("success") ||
                            line.toLowerCase().includes("complete")
                            ? "text-emerald-700 font-semibold"
                            : line.toLowerCase().includes("info") ||
                              line.toLowerCase().includes("starting")
                              ? "text-slate-600"
                              : ""
                        }`}
                    >
                      <span className="opacity-50">›</span> {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LLM Response Generation Section */}
            {hasGeneratedAnswer && (
              <>
                {lines.length > 0 && <div className="border-t border-slate-200" />}
                <div>
                  <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">
                    ✨ LLM Generation
                  </div>
                  <div className="text-sm leading-relaxed text-slate-800">
                    <TypewriterText
                      content={streamedAnswer ?? ""}
                      isStreaming={isStreaming}
                    />
                  </div>
                </div>
              </>
            )}

            {lines.length === 0 && !hasGeneratedAnswer && (
              <div className="text-slate-500 italic text-xs">Processing...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
