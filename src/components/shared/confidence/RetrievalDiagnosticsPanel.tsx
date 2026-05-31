"use client";

import React, { useState } from "react";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { RetrievalDiagnostics } from "@/types";

interface RetrievalDiagnosticsPanelProps {
  diagnostics: RetrievalDiagnostics;
  showByDefault?: boolean;
}

export const RetrievalDiagnosticsPanel: React.FC<RetrievalDiagnosticsPanelProps> = ({
  diagnostics,
  showByDefault = false,
}) => {
  const [expanded, setExpanded] = useState(showByDefault);

  if (!diagnostics) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-slate-600" />
          <span className="font-medium text-slate-900">Retrieval Diagnostics</span>
          <span className="text-xs text-slate-500 ml-2">(Admin/Debug)</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-600" />
        ) : (
          <ChevronDown size={16} className="text-slate-600" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-200 px-4 py-3 space-y-3 bg-white">
          {/* Candidates */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Candidate Retrieval</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-slate-50 p-2">
                <span className="text-slate-500">Vector</span>
                <p className="font-semibold text-slate-900">{diagnostics.vectorCandidates}</p>
              </div>
              <div className="rounded bg-slate-50 p-2">
                <span className="text-slate-500">Keyword</span>
                <p className="font-semibold text-slate-900">{diagnostics.keywordCandidates}</p>
              </div>
              <div className="rounded bg-slate-50 p-2">
                <span className="text-slate-500">Fused</span>
                <p className="font-semibold text-slate-900">{diagnostics.fusedCandidates}</p>
              </div>
            </div>
          </div>

          {/* Consistency */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-1">Consistency</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${ diagnostics.retrievalConsistency >= 0.8
                      ? "bg-green-500"
                      : diagnostics.retrievalConsistency >= 0.6
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  style={{
                    width: `${ Math.round(diagnostics.retrievalConsistency * 100) }%`,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-900 min-w-fit">
                {Math.round(diagnostics.retrievalConsistency * 100)}%
              </span>
            </div>
          </div>

          {/* Query Processing */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Query Processing</h4>
            <div className="space-y-1 text-xs">
              {diagnostics.cacheHit && (
                <div className="flex items-center gap-2 p-1.5 bg-blue-50 rounded border border-blue-100">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-blue-700">Cache hit</span>
                </div>
              )}
              {diagnostics.hydeUsed && (
                <div className="flex items-center gap-2 p-1.5 bg-purple-50 rounded border border-purple-100">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-purple-700">HyDE enabled</span>
                </div>
              )}
              {diagnostics.correctivePasses && diagnostics.correctivePasses > 0 && (
                <div className="flex items-center gap-2 p-1.5 bg-amber-50 rounded border border-amber-100">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-amber-700">
                    {diagnostics.correctivePasses} corrective pass
                    {diagnostics.correctivePasses > 1 ? "es" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Query Details */}
          {(diagnostics.rewrittenQuery || diagnostics.queryVariants) && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Query Variants</h4>
              <div className="space-y-1.5 text-xs">
                {diagnostics.rewrittenQuery && (
                  <div className="p-2 bg-slate-100 rounded border border-slate-200">
                    <span className="text-slate-500">Rewritten:</span>
                    <p className="text-slate-900 mt-0.5 font-mono">{diagnostics.rewrittenQuery}</p>
                  </div>
                )}
                {diagnostics.queryVariants && diagnostics.queryVariants.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-slate-500">Variants:</span>
                    {diagnostics.queryVariants.map((variant, idx) => (
                      <div key={idx} className="pl-2 text-slate-700 border-l-2 border-slate-300">
                        {variant}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
