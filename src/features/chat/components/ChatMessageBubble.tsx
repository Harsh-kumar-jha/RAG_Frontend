"use client";

import { Bot, User } from "lucide-react";
import { ChatMessage } from "@/types";
import { AdvisoryCard } from "./AdvisoryCard";
import { MarkdownContent } from "./MarkdownContent";

export const ChatMessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";

  return (
    <article className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          <Bot size={16} />
        </div>
      )}

      <div className={`max-w-[min(760px,85%)] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-md bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
              : "max-w-none rounded-2xl rounded-tl-md bg-white px-1 py-2 text-sm leading-7 text-slate-800"
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : message.advisory ? (
            <AdvisoryCard advisory={message.advisory} confidence={message.confidence} />
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
          <User size={16} />
        </div>
      )}
    </article>
  );
};
