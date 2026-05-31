"use client";

import { Bot, Loader2 } from "lucide-react";
import { StreamingState } from "../hooks/useChat";
import { TypewriterText } from "./TypewriterText";
import { RagSourcesPanel } from "./RagSourcesPanel";
import { ThinkingPanel } from "./ThinkingPanel";
import { AdvisoryCard } from "./AdvisoryCard";
import { ConfidenceBadge } from "@/components/shared/confidence/ConfidenceBadge";

const statusLabel: Record<StreamingState["status"], string> = {
  idle: "",
  retrieving: "Searching knowledge base...",
  generating: "Generating advisory...",
  complete: "Finalizing advisory...",
  stopped: "Response stopped.",
  error: "Stream error.",
};

const formatConfidencePercent = (score?: number) => {
  if (typeof score !== "number" || Number.isNaN(score)) return null;

  const normalized = score > 1 ? score : score * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

export const StreamingAssistantMessage = ({
  streaming,
}: {
  streaming: StreamingState;
}) => {
  if (!streaming.isStreaming) return null;

  const hasText = streaming.streamedText.trim().length > 0;
  const confidencePct = formatConfidencePercent(
    streaming.confidence?.score ?? streaming.confidence?.finalScore
  );

  return (
    <article className="flex w-full justify-start gap-3">
      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
        <Bot size={16} />
      </div>

      <div className="max-w-[min(760px,88%)] space-y-3 rounded-2xl rounded-tl-md bg-white px-1 py-2 text-sm text-slate-800">
        {/* Thinking Panel */}
        <ThinkingPanel
          thinking={streaming.thinkingText}
          isStreaming={streaming.isStreaming}
          streamedAnswer={streaming.streamedText}
        />

        {/* Confidence Badge */}
        {confidencePct !== null && (
          <div className="px-3">
            <ConfidenceBadge score={confidencePct} size="sm" showAnimation={true} />
          </div>
        )}

        {/* Sources */}
        {streaming.sources.length > 0 && (
          <div className="px-3">
            <RagSourcesPanel sources={streaming.sources} />
          </div>
        )}

        {/* Loading Indicator */}
        {!hasText && !streaming.advisory && (
          <div className="flex items-center gap-2 text-sm text-slate-500 px-3">
            <Loader2 size={15} className="animate-spin text-indigo-500" />
            <span>{statusLabel[streaming.status]}</span>
          </div>
        )}

        {/* Streamed Text */}
        {hasText && !streaming.advisory && (
          <div className="px-3">
            <TypewriterText
              content={streaming.streamedText}
              isStreaming={streaming.isStreaming}
            />
          </div>
        )}

        {/* Final Advisory */}
        {streaming.advisory && (
          <div className="px-3">
            <AdvisoryCard
              advisory={streaming.advisory}
              confidence={streaming.confidence || undefined}
              isStreaming={false}
            />
          </div>
        )}
      </div>
    </article>
  );
};
