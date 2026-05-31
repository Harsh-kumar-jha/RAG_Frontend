"use client";

import React from "react";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { ConfidenceMetricsResponse } from "@/types";

interface ConfidenceMetricsDisplayProps {
  metrics: ConfidenceMetricsResponse;
}

export const ConfidenceMetricsDisplay: React.FC<ConfidenceMetricsDisplayProps> = ({
  metrics,
}) => {
  const avgConfidence = Math.round(metrics.averageConfidence);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Queries */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-600">Total Queries</h3>
          <BarChart3 size={16} className="text-slate-400" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{metrics.totalQueries}</p>
      </div>

      {/* Average Confidence */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-600">Avg Confidence</h3>
          <TrendingUp size={16} className="text-slate-400" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{avgConfidence}%</p>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${ avgConfidence >= 75
                ? "bg-green-500"
                : avgConfidence >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            style={{ width: `${ avgConfidence }%` }}
          />
        </div>
      </div>

      {/* Hallucinations */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-600">Hallucinations</h3>
          <AlertCircle size={16} className="text-slate-400" />
        </div>
        <p className="text-2xl font-bold text-slate-900">
          {Math.round(metrics.hallucinations.average * 100)}%
        </p>
        <p className="text-xs text-slate-500">
          {metrics.hallucinations.queries.length} queries affected
        </p>
      </div>

      {/* Component Scores */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
        <h3 className="text-sm font-medium text-slate-600 mb-2">Component Scores</h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600">Retrieval</span>
            <span className="font-semibold text-slate-900">
              {metrics.averageComponentScores.retrieval}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Reranker</span>
            <span className="font-semibold text-slate-900">
              {metrics.averageComponentScores.reranker}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Groundedness</span>
            <span className="font-semibold text-slate-900">
              {metrics.averageComponentScores.groundedness}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
