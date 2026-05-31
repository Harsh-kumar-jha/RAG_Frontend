"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { ChatComposer } from "./ChatComposer";
import { MessageList } from "./MessageList";

interface ChatInterfaceProps {
  initialSessionId?: string | null;
  prefillQuery?: string;
  onSessionCreated?: (id: string) => void;
}

export const ChatInterface = ({
  initialSessionId,
  prefillQuery,
  onSessionCreated,
}: ChatInterfaceProps) => {
  const {
    messages,
    streaming,
    sessionId,
    sendMessage,
    loadSession,
    abortStream,
    isLoading,
    error,
  } = useChat();
  const [input, setInput] = useState(prefillQuery || "");
  const loadedSessionRef = useRef<string | null>(null);
  const notifiedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      initialSessionId &&
      initialSessionId !== sessionId &&
      loadedSessionRef.current !== initialSessionId
    ) {
      loadedSessionRef.current = initialSessionId;
      loadSession(initialSessionId);
    }
  });

  useEffect(() => {
    if (
      sessionId &&
      !initialSessionId &&
      notifiedSessionRef.current !== sessionId
    ) {
      notifiedSessionRef.current = sessionId;
      onSessionCreated?.(sessionId);
    }
  });

  const handleSend = async () => {
    const query = input.trim();
    if (!query || streaming.isStreaming) return;

    setInput("");
    await sendMessage(query, undefined, initialSessionId || undefined);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          streaming={streaming}
          isLoading={isLoading}
          onPickQuery={setInput}
        />
      </div>

      {error && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-center text-xs text-red-700">
          {error}
        </div>
      )}

      <ChatComposer
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onStop={abortStream}
        isStreaming={streaming.isStreaming}
        disabled={isLoading}
      />
    </div>
  );
};
