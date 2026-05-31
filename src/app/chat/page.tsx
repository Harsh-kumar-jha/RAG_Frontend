"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Menu } from "lucide-react";
import { ChatInterface } from "@/features/chat/components/ChatInterface";
import { ChatHistorySidebar } from "@/features/chat/components/ChatHistorySidebar";
import { chatApi } from "@/features/chat/api/chat.api";

function ChatPageInner() {
  const searchParams = useSearchParams();
  const prefillQuery = searchParams.get("q") || "";
  const queryClient = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["chat", "sessions", { limit: 30 }],
    queryFn: () => chatApi.listSessions({ limit: 30 }),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: chatApi.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
    },
  });

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setChatKey((prev) => prev + 1);
    setSidebarOpen(false);
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setChatKey((prev) => prev + 1);
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSessionMutation.mutateAsync(id);
    if (activeSessionId === id) handleNewSession();
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex h-full overflow-hidden bg-white">
        <div
          className={`fixed inset-y-0 left-0 z-40 h-full transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ChatHistorySidebar
            sessions={sessionsData?.sessions ?? []}
            activeId={activeSessionId}
            onSelect={handleSelectSession}
            onNew={handleNewSession}
            onDelete={handleDeleteSession}
            loading={sessionsLoading}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
              title="Open chat history"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-slate-800">Customs Advisory</h1>
            <div className="w-10" />
          </div>

          <ChatInterface
            key={chatKey}
            initialSessionId={activeSessionId}
            prefillQuery={prefillQuery}
            onSessionCreated={(id) => {
              setActiveSessionId(id);
              queryClient.invalidateQueries({ queryKey: ["chat", "sessions"] });
            }}
          />
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}
