"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "@/types";
import { StreamingState } from "../hooks/useChat";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { EmptyChatState } from "./EmptyChatState";
import { StreamingAssistantMessage } from "./StreamingAssistantMessage";

export const MessageList = ({
  messages,
  streaming,
  isLoading,
  onPickQuery,
}: {
  messages: ChatMessage[];
  streaming: StreamingState;
  isLoading: boolean;
  onPickQuery: (query: string) => void;
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0 && !streaming.isStreaming;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, streaming.streamedText, streaming.status]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyChatState onPickQuery={onPickQuery} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      {messages.map((message) => (
        <ChatMessageBubble key={message._id} message={message} />
      ))}
      <StreamingAssistantMessage streaming={streaming} />
      <div ref={endRef} />
    </div>
  );
};
