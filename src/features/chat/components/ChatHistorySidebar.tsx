"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Database,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ChatSession } from "@/types";

export const ChatHistorySidebar = ({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
  onClose,
}: {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
  onClose?: () => void;
}) => (
  <aside className="flex h-full w-72 flex-shrink-0 flex-col overflow-hidden border-r border-slate-900 bg-slate-950 text-white">
    <div className="space-y-4 border-b border-slate-800 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-white"
        >
          <ArrowLeft size={16} />
          CustomsAI
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            title="Close chat history"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/documents"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
        >
          <FileText size={14} />
          Documents
        </Link>
        <Link
          href="/knowledge-base"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
        >
          <Database size={14} />
          KB
        </Link>
      </div>

      <button
        onClick={onNew}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        <Plus size={14} />
        New Chat
      </button>
    </div>

    <div className="flex-1 space-y-1 overflow-y-auto p-3">
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={16} className="animate-spin text-slate-500" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="px-2 py-8 text-center text-xs text-slate-500">
          No chats yet. Start a new advisory session.
        </p>
      ) : (
        sessions.map((session) => (
          <div
            key={session._id}
            className={`group flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all ${
              activeId === session._id
                ? "border-slate-700 bg-slate-800"
                : "border-transparent hover:bg-slate-900"
            }`}
            onClick={() => onSelect(session._id)}
          >
            <MessageSquare
              size={12}
              className={activeId === session._id ? "flex-shrink-0 text-indigo-300" : "flex-shrink-0 text-slate-500"}
            />
            <p
              className={`flex-1 truncate text-xs font-medium ${
                activeId === session._id ? "text-white" : "text-slate-400"
              }`}
            >
              {session.title}
            </p>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onDelete(session._id);
              }}
              className="flex-shrink-0 p-1 text-slate-500 opacity-0 transition-all hover:text-red-300 group-hover:opacity-100"
              title="Delete chat"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))
      )}
    </div>
  </aside>
);
