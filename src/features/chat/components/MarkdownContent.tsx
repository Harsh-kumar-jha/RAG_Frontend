"use client";

import ReactMarkdown from "react-markdown";
import { formatStoredAssistantContent } from "../utils/assistantContent";

export const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>,
      li: ({ children }) => <li className="pl-1">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-slate-950">{children}</strong>,
      em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
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
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-700 mb-3">
          {children}
        </blockquote>
      ),
      h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>,
      h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
      h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>,
      a: ({ href, children }) => (
        <a href={href} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
      table: ({ children }) => (
        <div className="mb-3 overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm">{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-slate-100 border-b border-slate-200">{children}</thead>
      ),
      tbody: ({ children }) => <tbody>{children}</tbody>,
      tr: ({ children }) => <tr className="border-b border-slate-200 last:border-0">{children}</tr>,
      th: ({ children }) => (
        <th className="px-3 py-2 text-left font-semibold text-slate-800">{children}</th>
      ),
      td: ({ children }) => <td className="px-3 py-2 text-slate-700">{children}</td>,
    }}
  >
    {formatStoredAssistantContent(content)}
  </ReactMarkdown>
);
