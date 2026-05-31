import { apiClient } from "@/lib/api.client";
import {
  ApiResponse,
  ChatSession,
  ChatMessage,
  ListSessionsQuery,
  ListSessionsResponse,
  ChatMessagesResponse,
  StreamAdvisoryRequest,
  DocumentType,
} from "@/types";

export interface CreateSessionRequest {
  filters?: {
    documentTypes?: DocumentType[];
    tags?: string[];
  };
}

export const chatApi = {
  /**
   * Create a new chat session with optional filters
   * POST /chat/sessions
   */
  createSession: async (request?: CreateSessionRequest): Promise<ChatSession> => {
    const res = await apiClient.post<ApiResponse<ChatSession>>(
      "/chat/sessions",
      request || {}
    );

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to create session");
    }

    return res.data.data;
  },

  /**
   * List all chat sessions with pagination
   * GET /chat/sessions
   */
  listSessions: async (query?: ListSessionsQuery): Promise<ListSessionsResponse> => {
    const res = await apiClient.get<ApiResponse<ListSessionsResponse>>("/chat/sessions", {
      params: query || {}
    });

    return res.data.data || {
      sessions: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 }
    };
  },

  /**
   * Get session details
   * GET /chat/sessions/:id
   */
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const res = await apiClient.get<ApiResponse<ChatSession>>(`/chat/sessions/${ sessionId }`);

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get session");
    }

    return res.data.data;
  },

  /**
   * Get all messages in a chat session
   * GET /chat/sessions/:id/messages
   */
  getMessages: async (sessionId: string, query?: { page?: number; limit?: number }): Promise<ChatMessagesResponse> => {
    const res = await apiClient.get<ApiResponse<ChatMessagesResponse>>(
      `/chat/sessions/${ sessionId }/messages`,
      { params: query || {} }
    );

    return res.data.data || {
      messages: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 }
    };
  },

  /**
   * Delete a chat session
   * DELETE /chat/sessions/:id
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    const res = await apiClient.delete(`/chat/sessions/${ sessionId }`);

    if (!res.data.status) {
      throw new Error(res.data.message || "Failed to delete session");
    }
  },

  /**
   * Stream advisory query (SSE)
   * POST /chat/sessions/:id/stream
   * 
   * This is typically handled by useChat hook or createSSEStream utility
   * This method just returns the endpoint for reference
   */
  getStreamEndpoint: (sessionId: string): string => {
    return `/chat/sessions/${ sessionId }/stream`;
  },

  /**
   * Backward compatibility method for old naming
   */
  getSessions: async (params?: { page?: number; limit?: number }): Promise<ListSessionsResponse> => {
    return chatApi.listSessions(params);
  },
};
