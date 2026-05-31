"use client";

import { useEffect, useRef } from "react";
import { Send, StopCircle } from "lucide-react";

export const ChatComposer = ({
  value,
  disabled,
  isStreaming,
  onChange,
  onSend,
  onStop,
}: {
  value: string;
  disabled?: boolean;
  isStreaming: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [value]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-3 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isStreaming}
            rows={1}
            placeholder="Ask about HSN classification, customs duty, import requirements..."
            className="max-h-36 min-h-11 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
              title="Stop generating"
            >
              <StopCircle size={18} />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!value.trim() || disabled}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200"
              title="Send message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
};
