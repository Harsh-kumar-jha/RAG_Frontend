"use client";

import { useCallback, useRef, useState } from "react";
import { createSSEStream, retryWithBackoff } from "@/lib/api.client";
import {
  AdvisoryResponse,
  ApiError,
  ChatMessage,
  ChatSession,
  ConfidenceMetadata,
  SourceReference,
  StreamAdvisoryRequest,
} from "@/types";
import { chatApi } from "../api/chat.api";
import { formatStoredAssistantContent } from "../utils/assistantContent";
import { dedupeSourcesByDocument } from "../utils/sources";

export type StreamStatus =
  | "idle"
  | "retrieving"
  | "generating"
  | "complete"
  | "stopped"
  | "error";

export interface StreamingState {
  isStreaming: boolean;
  status: StreamStatus;
  requestId: string | null;
  thinkingText: string;
  streamedText: string;
  sources: SourceReference[];
  confidence: ConfidenceMetadata | null;
  advisory: AdvisoryResponse | null;
  error?: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  streaming: StreamingState;
  sessionId: string | null;
  session: ChatSession | null;
  error: string | null;
  isLoading: boolean;
  sendMessage: (
    query: string,
    filters?: StreamAdvisoryRequest["filters"],
    sessionIdOverride?: string
  ) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  createNewSession: () => Promise<string>;
  deleteSession: (sessionId?: string) => Promise<void>;
  listSessions: (page?: number, limit?: number) => Promise<void>;
  abortStream: () => void;
  clearError: () => void;
}

const createTempId = (prefix: string) =>
  `${ prefix }-${ globalThis.crypto?.randomUUID?.() ?? Date.now() }`;

const initialStreamingState: StreamingState = {
  isStreaming: false,
  status: "idle",
  requestId: null,
  thinkingText: "",
  streamedText: "",
  sources: [],
  confidence: null,
  advisory: null,
};

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState<StreamingState>(initialStreamingState);

  const abortRef = useRef<(() => void) | null>(null);
  const inFlightRef = useRef(false);
  const activeRequestIdRef = useRef<string | null>(null);
  const fullTextRef = useRef("");
  const pendingChunkRef = useRef("");
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advisoryRef = useRef<AdvisoryResponse | null>(null);
  const confidenceRef = useRef<ConfidenceMetadata | null>(null);
  const thinkingTextRef = useRef("");

  const clearFlushTimer = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const isActiveRequest = useCallback(
    (requestId: string) =>
      inFlightRef.current && activeRequestIdRef.current === requestId,
    []
  );

  const flushPendingChunks = useCallback(
    (requestId: string) => {
      if (!isActiveRequest(requestId) || !pendingChunkRef.current) return;

      const nextText = fullTextRef.current + pendingChunkRef.current;
      fullTextRef.current = nextText;
      pendingChunkRef.current = "";
      flushTimerRef.current = null;

      setStreaming((prev) =>
        prev.requestId === requestId
          ? {
            ...prev,
            status: "generating",
            streamedText: nextText,
          }
          : prev
      );
    },
    [isActiveRequest]
  );

  const scheduleChunkFlush = useCallback(
    (requestId: string) => {
      if (flushTimerRef.current) return;

      flushTimerRef.current = setTimeout(() => {
        flushPendingChunks(requestId);
      }, 35);
    },
    [flushPendingChunks]
  );

  const resetStreamRefs = useCallback(() => {
    clearFlushTimer();
    abortRef.current = null;
    inFlightRef.current = false;
    activeRequestIdRef.current = null;
    fullTextRef.current = "";
    pendingChunkRef.current = "";
    thinkingTextRef.current = "";
    advisoryRef.current = null;
    confidenceRef.current = null;
  }, [clearFlushTimer]);

  const stopActiveStream = useCallback(
    (preservePartial = false) => {
      const requestId = activeRequestIdRef.current;
      if (requestId) flushPendingChunks(requestId);

      abortRef.current?.();

      const partialText = fullTextRef.current.trim();
      const currentSessionId = sessionId;
      resetStreamRefs();

      if (preservePartial && partialText && currentSessionId) {
        setMessages((prev) => [
          ...prev,
          {
            _id: createTempId("stopped-ai"),
            sessionId: currentSessionId,
            role: "assistant",
            content: `${ partialText }\n\n_Response stopped._`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      setStreaming({
        ...initialStreamingState,
        status: preservePartial ? "stopped" : "idle",
      });
    },
    [flushPendingChunks, resetStreamRefs, sessionId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createNewSession = useCallback(async (): Promise<string> => {
    stopActiveStream(false);
    setIsLoading(true);
    setError(null);

    try {
      const newSession = await retryWithBackoff(() => chatApi.createSession(), 3);

      setSession(newSession);
      setSessionId(newSession._id);
      setMessages([]);

      return newSession._id;
    } catch (err) {
      const errorMessage = (err as ApiError).message || "Failed to create session";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [stopActiveStream]);

  const loadSession = useCallback(
    async (sid: string): Promise<void> => {
      stopActiveStream(false);
      setIsLoading(true);
      setError(null);

      try {
        const result = await retryWithBackoff(() => chatApi.getMessages(sid), 3);

        setSessionId(sid);
        setMessages(result.messages);
        setStreaming(initialStreamingState);
      } catch (err) {
        const errorMessage = (err as ApiError).message || "Failed to load session";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [stopActiveStream]
  );

  const listSessions = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      await chatApi.listSessions({ page, limit });
    } catch (err) {
      setError((err as ApiError).message || "Failed to list sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSession = useCallback(
    async (sid?: string) => {
      const targetId = sid || sessionId;
      if (!targetId) {
        setError("No session to delete");
        return;
      }

      setError(null);

      try {
        await chatApi.deleteSession(targetId);

        if (targetId === sessionId) {
          stopActiveStream(false);
          setSessionId(null);
          setSession(null);
          setMessages([]);
        }
      } catch (err) {
        setError((err as ApiError).message || "Failed to delete session");
      }
    },
    [sessionId, stopActiveStream]
  );

  const sendMessage = useCallback(
    async (
      query: string,
      filters?: StreamAdvisoryRequest["filters"],
      sessionIdOverride?: string
    ): Promise<void> => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setError("Please enter a message");
        return;
      }

      if (inFlightRef.current) return;

      inFlightRef.current = true;
      setError(null);

      let sid = sessionIdOverride || sessionId;

      try {
        if (!sid) {
          const newSession = await chatApi.createSession();
          sid = newSession._id;
          setSessionId(sid);
          setSession(newSession);
        }

        const requestId = createTempId("stream");
        activeRequestIdRef.current = requestId;
        fullTextRef.current = "";
        pendingChunkRef.current = "";
        advisoryRef.current = null;
        confidenceRef.current = null;

        setMessages((prev) => [
          ...prev,
          {
            _id: createTempId("user"),
            sessionId: sid!,
            role: "user",
            content: trimmedQuery,
            createdAt: new Date().toISOString(),
          },
        ]);

        setStreaming({
          isStreaming: true,
          status: "retrieving",
          requestId,
          thinkingText: "",
          streamedText: "",
          sources: [],
          confidence: null,
          advisory: null,
        });

        const { abort } = createSSEStream(
          `/chat/sessions/${ sid }/stream`,
          { query: trimmedQuery, filters },
          {
            onSources: (data) => {
              if (!isActiveRequest(requestId)) return;

              const sources = dedupeSourcesByDocument(data.sources || []);

              setStreaming((prev) =>
                prev.requestId === requestId
                  ? {
                    ...prev,
                    status: prev.streamedText ? "generating" : "retrieving",
                    sources,
                  }
                  : prev
              );
            },
            onThinking: (data) => {
              if (!isActiveRequest(requestId)) return;

              thinkingTextRef.current = (thinkingTextRef.current + (data.thinking || "")).trim();
              setStreaming((prev) =>
                prev.requestId === requestId
                  ? { ...prev, thinkingText: thinkingTextRef.current }
                  : prev
              );
            },
            onChunk: (data) => {
              if (!isActiveRequest(requestId)) return;

              pendingChunkRef.current += data.content || "";
              scheduleChunkFlush(requestId);
            },
            onAdvisory: (data) => {
              if (!isActiveRequest(requestId)) return;

              advisoryRef.current = data.advisory || null;
              setStreaming((prev) =>
                prev.requestId === requestId
                  ? { ...prev, advisory: advisoryRef.current }
                  : prev
              );
            },
            onConfidence: (data) => {
              if (!isActiveRequest(requestId)) return;

              const confidence = data || null;
              confidenceRef.current = confidence;
              const sources = dedupeSourcesByDocument(confidence?.sources || []);

              setStreaming((prev) =>
                prev.requestId === requestId
                  ? {
                    ...prev,
                    confidence,
                    sources: sources.length ? sources : prev.sources,
                  }
                  : prev
              );
            },
            onComplete: (data) => {
              if (!isActiveRequest(requestId)) return;

              flushPendingChunks(requestId);

              const advisory = advisoryRef.current;
              const content =
                advisory
                  ? formatStoredAssistantContent(fullTextRef.current.trim()) || advisory.shortAnswer
                  : formatStoredAssistantContent(fullTextRef.current.trim()) ||
                "No response returned.";

              setMessages((prev) => [
                ...prev,
                {
                  _id: createTempId("assistant"),
                  sessionId: sid!,
                  role: "assistant",
                  content,
                  advisory: advisory || undefined,
                  confidence: confidenceRef.current || undefined,
                  createdAt: new Date().toISOString(),
                },
              ]);

              if (data?.messageCount || data?.title) {
                setSession((prev) =>
                  prev
                    ? {
                      ...prev,
                      messageCount: data.messageCount ?? prev.messageCount,
                      title: data.title ?? prev.title,
                    }
                    : prev
                );
              }

              resetStreamRefs();
              setStreaming(initialStreamingState);
            },
            onError: (data) => {
              if (!isActiveRequest(requestId)) return;

              const errorMessage = data?.message || "Stream error occurred";
              resetStreamRefs();
              setError(errorMessage);
              setStreaming({
                ...initialStreamingState,
                status: "error",
                error: errorMessage,
              });
            },
          },
          { requestId }
        );

        abortRef.current = abort;
      } catch (err) {
        resetStreamRefs();
        const errorMessage = (err as ApiError).message || "Failed to send message";
        setError(errorMessage);
        setStreaming({
          ...initialStreamingState,
          status: "error",
          error: errorMessage,
        });
      }
    },
    [
      flushPendingChunks,
      isActiveRequest,
      resetStreamRefs,
      scheduleChunkFlush,
      sessionId,
    ]
  );

  const abortStream = useCallback(() => {
    setError("Stream stopped");
    stopActiveStream(true);
  }, [stopActiveStream]);

  return {
    messages,
    streaming,
    sessionId,
    session,
    error,
    isLoading,
    sendMessage,
    loadSession,
    createNewSession,
    deleteSession,
    listSessions,
    abortStream,
    clearError,
  };
};
