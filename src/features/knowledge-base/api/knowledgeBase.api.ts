import { apiClient } from "@/lib/api.client";
import { ApiResponse, KBStatus, KBEvaluation, QdrantHealth, QdrantMetrics } from "@/types";

export const knowledgeBaseApi = {
  /**
   * Get knowledge base status
   * GET /knowledge-base/status
   */
  getStatus: async (): Promise<KBStatus> => {
    const res = await apiClient.get<ApiResponse<KBStatus>>("/knowledge-base/status");
    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get knowledge base status");
    }
    return res.data.data;
  },

  /**
   * Get processing queue
   * GET /knowledge-base/queue
   */
  getQueue: async (): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>("/knowledge-base/queue");
    return res.data.data || [];
  },

  /**
   * Get failed documents
   * GET /knowledge-base/failed
   */
  getFailed: async (): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>("/knowledge-base/failed");
    return res.data.data || [];
  },

  /**
   * Get Qdrant health
   * GET /knowledge-base/qdrant/health
   */
  getQdrantHealth: async (): Promise<QdrantHealth> => {
    const res = await apiClient.get<ApiResponse<QdrantHealth>>("/knowledge-base/qdrant/health");
    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get Qdrant health");
    }
    return res.data.data;
  },

  /**
   * Get Qdrant metrics
   * GET /knowledge-base/qdrant/metrics
   */
  getQdrantMetrics: async (): Promise<QdrantMetrics> => {
    const res = await apiClient.get<ApiResponse<QdrantMetrics>>("/knowledge-base/qdrant/metrics");
    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get Qdrant metrics");
    }
    return res.data.data;
  },

  /**
   * Get knowledge base evaluation metrics
   * GET /knowledge-base/evaluation
   */
  getEvaluation: async (): Promise<KBEvaluation> => {
    const res = await apiClient.get<ApiResponse<KBEvaluation>>("/knowledge-base/evaluation");
    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get evaluation metrics");
    }
    return res.data.data;
  },
};
