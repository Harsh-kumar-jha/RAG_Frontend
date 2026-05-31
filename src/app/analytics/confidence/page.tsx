"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { confidenceAnalyticsApi } from "@/features/analytics/api/confidence.api";
import { ConfidenceMetricsDisplay } from "@/features/analytics/components/ConfidenceMetricsDisplay";
import { LowConfidenceQueriesDisplay } from "@/features/analytics/components/LowConfidenceQueriesDisplay";
import {
  ConfidenceMetricsResponse,
  LowConfidenceResponse,
  ConfidenceCorrelation,
} from "@/types";

export default function ConfidenceAnalyticsPage() {
  const [metrics, setMetrics] = useState<ConfidenceMetricsResponse | null>(null);
  const [lowConfidence, setLowConfidence] = useState<LowConfidenceResponse | null>(null);
  const [correlation, setCorrelation] = useState<ConfidenceCorrelation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [metricsData, lowConfidenceData, correlationData] = await Promise.all([
          confidenceAnalyticsApi.getMetrics(),
          confidenceAnalyticsApi.getLowConfidenceQueries({ threshold: 50, limit: 20 }),
          confidenceAnalyticsApi.getCorrelation(),
        ]);

        setMetrics(metricsData);
        setLowConfidence(lowConfidenceData);
        setCorrelation(correlationData);
      } catch (err) {
        setError((err as Error).message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <AlertCircle className="inline-block text-red-600 mb-2" size={24} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Confidence Analytics
              </h1>
              <p className="text-slate-600 mt-1">
                Monitor answer confidence, hallucinations, and user feedback
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        {metrics && <ConfidenceMetricsDisplay metrics={metrics} />}

        {/* Distribution Chart */}
        {metrics && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" />
              Confidence Distribution
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(metrics.distributionByLabel).map(([label, count]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-4 text-center">
                  <p className="text-sm text-slate-600 capitalize mb-2">
                    {label.replace(/_/g, " ")}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {metrics.totalQueries > 0
                      ? `${ Math.round((count / metrics.totalQueries) * 100) }%`
                      : "0%"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Confidence Queries */}
        {lowConfidence && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <LowConfidenceQueriesDisplay
              queries={lowConfidence.queries}
              threshold={lowConfidence.threshold}
            />
          </div>
        )}

        {/* Correlation */}
        {correlation && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Feedback-Confidence Correlation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Positive</p>
                <p className="text-2xl font-bold text-blue-900">{correlation.positive}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <p className="text-sm text-slate-700 font-medium mb-1">Neutral</p>
                <p className="text-2xl font-bold text-slate-900">{correlation.neutral}</p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-700 font-medium mb-1">Negative</p>
                <p className="text-2xl font-bold text-red-900">{correlation.negative}</p>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                Average Confidence by Rating
              </h3>
              <div className="space-y-2">
                {Object.entries(correlation.avgConfidenceByRating)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([rating, confidence]) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700 w-20">
                        {rating} star{parseInt(rating) !== 1 ? "s" : ""}
                      </span>
                      <div className="flex-1 h-8 bg-slate-200 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all flex items-center justify-end pr-2"
                          style={{ width: `${ (confidence / 100) * 100 }%` }}
                        >
                          {(confidence / 100) * 100 > 10 && (
                            <span className="text-xs font-semibold text-white">
                              {Math.round(confidence)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 w-12 text-right">
                        {Math.round(confidence)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Hallucinations */}
        {metrics && metrics.topHallucinations.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-600" />
              Top Hallucinations
            </h2>
            <div className="space-y-2">
              {metrics.topHallucinations.map((hallucination, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm text-slate-900 font-medium">
                      "{hallucination.claim}"
                    </p>
                    <span className="text-xs font-semibold text-orange-800 bg-orange-100 px-2 py-1 rounded-full whitespace-nowrap">
                      {hallucination.count}x
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Avg Confidence: {Math.round(hallucination.avgConfidence)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
