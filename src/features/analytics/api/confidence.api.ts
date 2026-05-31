import { apiClient } from "@/lib/api.client";
import {
  ApiResponse,
  ConfidenceMetricsResponse,
  LowConfidenceResponse,
  ConfidenceTrendResponse,
  ConfidenceCorrelation,
  ConfidenceFeedback,
} from "@/types";

export interface ConfidenceMetricsQuery {
  startDate?: string;
  endDate?: string;
  sessionId?: string;
}

export interface LowConfidenceQuery {
  threshold?: number; // default 50
  limit?: number; // default 20
}

export interface ConfidenceTrendQuery {
  interval?: number; // days, default 1
  days?: number; // default 30
}

export const confidenceAnalyticsApi = {
  /**
   * Get confidence metrics for a date range
   * GET /analytics/confidence/metrics
   */
  getMetrics: async (query?: ConfidenceMetricsQuery): Promise<ConfidenceMetricsResponse> => {
    const res = await apiClient.get<ApiResponse<ConfidenceMetricsResponse>>(
      "/analytics/confidence/metrics",
      { params: query || {} }
    );

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get confidence metrics");
    }

    return res.data.data;
  },

  /**
   * Get low confidence queries
   * GET /analytics/confidence/low-confidence
   */
  getLowConfidenceQueries: async (query?: LowConfidenceQuery): Promise<LowConfidenceResponse> => {
    const res = await apiClient.get<ApiResponse<LowConfidenceResponse>>(
      "/analytics/confidence/low-confidence",
      { params: query || {} }
    );

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get low confidence queries");
    }

    return res.data.data;
  },

  /**
   * Get confidence trend over time
   * GET /analytics/confidence/trend
   */
  getTrend: async (query?: ConfidenceTrendQuery): Promise<ConfidenceTrendResponse> => {
    const res = await apiClient.get<ApiResponse<ConfidenceTrendResponse>>(
      "/analytics/confidence/trend",
      { params: query || {} }
    );

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get confidence trend");
    }

    return res.data.data;
  },

  /**
   * Submit feedback for a message
   * POST /analytics/confidence/feedback/:messageId
   */
  submitFeedback: async (messageId: string, feedback: ConfidenceFeedback): Promise<void> => {
    const res = await apiClient.post(
      `/analytics/confidence/feedback/${ messageId }`,
      feedback
    );

    if (!res.data.status) {
      throw new Error(res.data.message || "Failed to submit feedback");
    }
  },

  /**
   * Get confidence-feedback correlation
   * GET /analytics/confidence/correlation
   */
  getCorrelation: async (): Promise<ConfidenceCorrelation> => {
    const res = await apiClient.get<ApiResponse<ConfidenceCorrelation>>(
      "/analytics/confidence/correlation"
    );

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get correlation data");
    }

    return res.data.data;
  },
};
