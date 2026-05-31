"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { formatStreamingAssistantContent } from "../utils/assistantContent";

interface TypewriterTextProps {
  content: string;
  isStreaming: boolean;
}

/**
 * ChatGPT-style typewriter effect for streaming text.
 * Renders text character by character with a blinking cursor.
 */
export const TypewriterText = ({ content, isStreaming }: TypewriterTextProps) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const renderedContent = formatStreamingAssistantContent(
    isStreaming ? displayedContent : content
  );
  const renderedCursorVisible = isStreaming ? cursorVisible : true;

  // Handle character-by-character display
  useEffect(() => {
    if (!isStreaming) return;

    // Only update if new content is added
    if (displayedContent.length < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, displayedContent.length + 1));
      }, 12); // 12ms per character for smooth typing effect

      return () => clearTimeout(timer);
    }
  }, [content, displayedContent, isStreaming]);

  // Blinking cursor effect
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530); // Blink every 530ms (visible 530ms, invisible 530ms)

    return () => clearInterval(timer);
  }, [isStreaming]);

  // Markdown components styling
  const markdownComponents = {
    p: ({ children }: any) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: any) => (
      <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>
    ),
    li: ({ children }: any) => <li className="pl-1">{children}</li>,
    strong: ({ children }: any) => (
      <strong className="font-semibold text-slate-950">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-slate-700">{children}</em>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-slate-900 font-mono">
            {children}
          </code>
        );
      }
      return (
        <code className="font-mono text-sm text-slate-100" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: any) => (
      <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100 border border-slate-800" {...props}>
        {children}
      </pre>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-700 mb-3">
        {children}
      </blockquote>
    ),
    h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>,
    a: ({ href, children }: any) => (
      <a href={href} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="mb-3 overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-slate-100 border-b border-slate-200">{children}</thead>
    ),
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr className="border-b border-slate-200 last:border-0">{children}</tr>,
    th: ({ children }: any) => (
      <th className="px-3 py-2 text-left font-semibold text-slate-800">{children}</th>
    ),
    td: ({ children }: any) => <td className="px-3 py-2 text-slate-700">{children}</td>,
  };

  return (
    <div className="relative">
      {renderedContent ? (
        <div className="max-w-none leading-7">
          <ReactMarkdown components={markdownComponents}>
            {isStreaming
              ? renderedContent + (renderedCursorVisible ? "" : " ")
              : renderedContent}
          </ReactMarkdown>
        </div>
      ) : null}

      {/* Blinking cursor */}
      {isStreaming && renderedContent && (
        <span
          className={`inline-block h-[1.1em] w-0.5 bg-indigo-500 ml-0.5 align-text-bottom transition-opacity duration-100 ${ renderedCursorVisible ? "opacity-100" : "opacity-0"
            }`}
        />
      )}
    </div>
  );
};
