"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Search, RefreshCw, Loader2 } from "lucide-react";
import { DocumentCard } from "./DocumentCard";
import { documentsApi } from "../api/documents.api";
import { DocumentStatus, DocumentType } from "@/types";

const DOC_TYPE_OPTIONS: { value: "" | DocumentType; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "circular", label: "Circular" },
  { value: "tariff", label: "Tariff" },
  { value: "case-law", label: "Case Law" },
  { value: "classification", label: "Classification" },
  { value: "regulation", label: "Regulation" },
  { value: "notification", label: "Notification" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: { value: "" | DocumentStatus; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "indexed", label: "Indexed" },
  { value: "processing", label: "Processing" },
  { value: "extracting", label: "Extracting" },
  { value: "chunking", label: "Chunking" },
  { value: "embedding", label: "Embedding" },
  { value: "uploaded", label: "Pending" },
  { value: "failed", label: "Failed" },
];

export const DocumentList = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState<"" | DocumentType>("");
  const [status, setStatus] = useState<"" | DocumentStatus>("");
  const [page, setPage] = useState(1);

  const {
    data,
    error,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["documents", { search, docType, status, page, refreshTrigger }],
    queryFn: () =>
      documentsApi.list({
        search: search || undefined,
        documentType: docType || undefined,
        status: status || undefined,
        page,
        limit: 12,
      }),
    placeholderData: (previousData) => previousData,
  });

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message)
      : "Failed to load documents.";
  const documents = data?.documents ?? [];
  const pagination = data?.pagination ?? { page, limit: 12, total: 0, pages: 1 };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap gap-2 items-center shadow-sm">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
          value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={docType}
          onChange={(e) => {
            setDocType(e.target.value as "" | DocumentType);
            setPage(1);
          }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {DOC_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "" | DocumentStatus);
            setPage(1);
          }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>

        <span className="text-xs text-slate-400 ml-auto">{pagination.total} documents</span>
      </div>

      {/* Grid */}
      {isLoading && documents.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white rounded-xl border border-red-200">
          <AlertCircle size={32} className="mx-auto text-red-400 mb-3" />
          <p className="text-red-700 text-sm font-medium">Could not load documents.</p>
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 mt-4 px-3 py-2 text-sm border border-red-200 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Search size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">No documents found.</p>
          <p className="text-slate-400 text-xs mt-1">Upload your first document to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={() => refetch()}
              onReIndex={() => refetch()}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={pagination.page >= pagination.pages}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
