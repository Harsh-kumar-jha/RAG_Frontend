"use client";

import { AdvisoryResponse, ConfidenceMetadata, SourceReference } from "@/types";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Brain, Scale, Eye } from "lucide-react";
import { useState } from "react";
import { ConfidenceBadge } from "@/components/shared/confidence/ConfidenceBadge";
import { RiskFlags } from "@/components/shared/confidence/RiskFlags";
import { CitationPanel } from "@/components/shared/confidence/CitationPanel";
import { InsufficientEvidenceState } from "@/components/shared/confidence/InsufficientEvidenceState";

interface AdvisoryCardProps {
  advisory: AdvisoryResponse;
  confidence?: ConfidenceMetadata;
  isStreaming?: boolean;
}

export const AdvisoryCard = ({ advisory, confidence, isStreaming }: AdvisoryCardProps) => {
  const [showAlternates, setShowAlternates] = useState(false);
  const confidenceScore =
    confidence?.score ?? confidence?.finalScore ?? advisory.confidenceScore;

  // Check if this is an insufficient evidence response
  const isInsufficientEvidence = advisory.shortAnswer.includes("Insufficient evidence");

  if (isInsufficientEvidence) {
    return <InsufficientEvidenceState showDocumentLink />;
  }

  return (
    <div className="space-y-4">
      {/* Header row with badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <ConfidenceBadge score={confidenceScore} size="md" />
        {advisory.humanReviewRequired && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Eye size={12} /> Human Review Needed
          </span>
        )}
        {advisory.queryType && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            {advisory.queryType.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* Short Answer */}
      <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-500" /> Answer
        </p>
        <p className="text-slate-800 text-sm leading-relaxed">{advisory.shortAnswer}</p>
      </div>

      {/* Recommended Classification */}
      {advisory.recommendedClassification && (
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5">
            <Scale size={12} /> Recommended Classification
          </p>
          <p className="text-indigo-900 font-mono text-base font-bold">{advisory.recommendedClassification}</p>
        </div>
      )}

      {/* Risk Flags */}
      {advisory.riskFlags && advisory.riskFlags.length > 0 && (
        <RiskFlags flags={advisory.riskFlags} compact={false} />
      )}

      {/* Reasoning */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
          <Brain size={14} className="text-blue-500" /> Reasoning
        </p>
        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{advisory.reasoning}</p>
      </div>

      {/* Alternate Views */}
      {advisory.alternateViews && advisory.alternateViews.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAlternates((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-600">
              Alternate Views ({advisory.alternateViews.length})
            </span>
            {showAlternates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showAlternates && (
            <div className="p-4 space-y-2 bg-white">
              {advisory.alternateViews.map((view, idx) => (
                <p key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-slate-400 flex-shrink-0 mt-0.5 font-bold">•</span>
                  {view}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Source Citations */}
      {advisory.sourceReferences && advisory.sourceReferences.length > 0 && (
        <CitationPanel sources={advisory.sourceReferences} compact={false} />
      )}

      {/* Confidence Details */}
      {confidence && (
        <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">Confidence Components</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {confidence.retrievalScore && (
              <div className="text-center">
                <p className="text-slate-500">Retrieval</p>
                <p className="font-semibold text-slate-700">{confidence.retrievalScore}%</p>
              </div>
            )}
            {confidence.rerankerScore && (
              <div className="text-center">
                <p className="text-slate-500">Reranker</p>
                <p className="font-semibold text-slate-700">{confidence.rerankerScore}%</p>
              </div>
            )}
            {confidence.groundednessScore && (
              <div className="text-center">
                <p className="text-slate-500">Groundedness</p>
                <p className="font-semibold text-slate-700">{confidence.groundednessScore}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
