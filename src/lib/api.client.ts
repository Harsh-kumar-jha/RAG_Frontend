import axios, { AxiosError } from "axios";
import { ApiError } from "@/types";

export const apiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NEXT_PUBLIC_API_BASE_URL ? `${ process.env.NEXT_PUBLIC_API_BASE_URL }/api` : undefined) ||
    "http://localhost:5000/api",
  timeout: 180000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Response interceptor: Handle errors and extract error messages
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      "Request failed";

    const apiError: ApiError = {
      message,
      status: error.response?.status,
      code: (error.response?.data as any)?.code,
      details: (error.response?.data as any)?.details,
    };

    return Promise.reject(apiError);
  }
);

/**
 * Retry utility with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param delayMs Base delay in milliseconds
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * delayMs; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * SSE Stream handler for advisory queries
 * Supports streaming responses with proper event parsing
 */
export const createSSEStream = (
  url: string,
  body: object,
  handlers: {
    onSources?: (data: any) => void;
    onThinking?: (data: any) => void;
    onChunk?: (data: any) => void;
    onAdvisory?: (data: any) => void;
    onConfidence?: (data: any) => void;
    onComplete?: (data: any) => void;
    onError?: (data: any) => void;
  },
  options?: { requestId?: string }
): { abort: () => void; requestId: string } => {
  const controller = new AbortController();
  const requestId =
    options?.requestId ||
    (globalThis.crypto?.randomUUID?.() ?? `stream-${ Date.now() }`);
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NEXT_PUBLIC_API_BASE_URL ? `${ process.env.NEXT_PUBLIC_API_BASE_URL }/api` : undefined) ||
    "http://localhost:5000/api";

  const parseStreamEvent = (eventBlock: string) => {
    try {
      let eventType = "";
      const dataLines: string[] = [];

      for (const line of eventBlock.replace(/\r\n/g, "\n").split("\n")) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
      }

      if (!eventType || dataLines.length === 0) return null;

      const eventData = JSON.parse(dataLines.join("\n"));

      return { eventType, eventData };
    } catch {
      return null;
    }
  };

  const dispatchEvent = (eventBlock: string) => {
    const parsed = parseStreamEvent(eventBlock);
    if (!parsed) return;

    const { eventType, eventData } = parsed;

    if (eventType === "sources") handlers.onSources?.(eventData);
    else if (eventType === "thinking") handlers.onThinking?.(eventData);
    else if (eventType === "chunk") handlers.onChunk?.(eventData);
    else if (eventType === "advisory") handlers.onAdvisory?.(eventData);
    else if (eventType === "confidence") handlers.onConfidence?.(eventData);
    else if (eventType === "complete") handlers.onComplete?.(eventData);
    else if (eventType === "error") handlers.onError?.(eventData);
  };

  fetch(`${ baseUrl }${ url }`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream"
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        handlers.onError?.({
          message: error.message || `HTTP ${ res.status }`,
          status: res.status,
        });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        handlers.onError?.({ message: "Failed to read response stream" });
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            if (part.trim()) dispatchEvent(part);
          }
        }

        if (buffer.trim()) {
          dispatchEvent(buffer);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          handlers.onError?.({
            message: (err as Error).message || "Stream error"
          });
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        handlers.onError?.({ message: err.message || "Connection error" });
      }
    });

  return { abort: () => controller.abort(), requestId };
};

/**
 * Simple polling utility
 * @param fn Function to poll
 * @param checkFn Condition to check for completion
 * @param intervalMs Poll interval in milliseconds
 * @param maxDurationMs Maximum duration before giving up
 */
export async function pollUntil<T>(
  fn: () => Promise<T>,
  checkFn: (result: T) => boolean,
  intervalMs: number = 2000,
  maxDurationMs: number = 120000
): Promise<T> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxDurationMs) {
    const result = await fn();
    if (checkFn(result)) {
      return result;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error("Polling timeout exceeded");
}
