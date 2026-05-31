"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { LowConfidenceQuery } from "@/types";

interface LowConfidenceQueriesDisplayProps {
  queries: LowConfidenceQuery[];
  threshold: number;
}

export const LowConfidenceQueriesDisplay: React.FC<LowConfidenceQueriesDisplayProps> = ({
  queries,
  threshold,
}) => {
  if (queries.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <AlertTriangle className="text-green-600" size={24} />
          </div>
        </div>
        <h3 className="font-semibold text-green-900 mb-1">No Low Confidence Queries</h3>
        <p className="text-sm text-green-800">
          All queries are above the {threshold}% confidence threshold!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-600" />
          Low Confidence Queries ({queries.length})
        </h3>
        <span className="text-xs text-slate-500">Below {threshold}%</span>
      </div>

      <div className="space-y-2">
        {queries.map((query, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">{query.query}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(query.createdAt).toLocaleDateString()} -{" "}
                  Session: {query.sessionId.slice(0, 8)}...
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span
                  className={`inline-block text-sm font-bold px-2.5 py-1 rounded-full ${ query.confidence >= threshold
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {query.confidence}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
