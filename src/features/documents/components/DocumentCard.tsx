"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText, Trash2, RefreshCw, CheckCircle2, Clock, AlertCircle,
  Loader2, Tag, Calendar, Layers, ChevronDown, ChevronUp
} from "lucide-react";
import { DocumentRecord, DocumentStatus, DocumentType } from "@/types";
import { documentsApi } from "../api/documents.api";

const PROCESSING_STATUS = {
  icon: Loader2,
  className: "text-blue-600 bg-blue-50 border-blue-200",
  label: "Processing",
  spin: true,
};

const STATUS_CONFIG: Record<
  DocumentStatus,
  {
    icon: typeof CheckCircle2;
    className: string;
    label: string;
    spin?: boolean;
  }
> = {
  indexed: {
    icon: CheckCircle2,
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
    label: "Indexed",
  },
  extracting: { ...PROCESSING_STATUS, label: "Extracting" },
  chunking: { ...PROCESSING_STATUS, label: "Chunking" },
  embedding: { ...PROCESSING_STATUS, label: "Embedding" },
  processing: PROCESSING_STATUS,
  uploaded: {
    icon: Clock,
    className: "text-amber-600 bg-amber-50 border-amber-200",
    label: "Pending",
  },
  failed: {
    icon: AlertCircle,
    className: "text-red-600 bg-red-50 border-red-200",
    label: "Failed",
  },
};

const TYPE_COLORS: Record<DocumentType, string> = {
  circular: "bg-blue-100 text-blue-700",
  tariff: "bg-purple-100 text-purple-700",
  "case-law": "bg-orange-100 text-orange-700",
  classification: "bg-green-100 text-green-700",
  regulation: "bg-indigo-100 text-indigo-700",
  notification: "bg-pink-100 text-pink-700",
  other: "bg-slate-100 text-slate-700",
};

const formatSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

interface DocumentCardProps {
  document: DocumentRecord;
  onDelete: (id: string) => void;
  onReIndex: (id: string) => void;
}

export const DocumentCard = ({ document: doc, onDelete, onReIndex }: DocumentCardProps) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<"delete" | "reindex" | null>(null);

  const statusCfg = STATUS_CONFIG[doc.status];
  const StatusIcon = statusCfg.icon;

  const progress =
    doc.totalChunks > 0 ? Math.round((doc.indexedChunks / doc.totalChunks) * 100) : 0;
  const isProcessing = ["extracting", "chunking", "embedding", "processing"].includes(doc.status);

  const deleteMutation = useMutation({
    mutationFn: () => documentsApi.remove(doc._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      onDelete(doc._id);
    },
  });

  const reindexMutation = useMutation({
    mutationFn: () => documentsApi.reIndex(doc._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      onReIndex(doc._id);
    },
  });

  const handleDelete = async () => {
    if (!confirm(`Delete "${doc.name}"? This will remove all indexed vectors.`)) return;
    setActionLoading("delete");
    try {
      await deleteMutation.mutateAsync();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReIndex = async () => {
    setActionLoading("reindex");
    try {
      await reindexMutation.mutateAsync();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Progress bar for processing */}
      {isProcessing && doc.totalChunks > 0 && (
        <div className="h-1 bg-slate-100">
          <div
            className="h-1 bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <FileText size={20} className="text-slate-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800 truncate" title={doc.name}>
                {doc.name}
              </p>
              <span
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.className}`}
              >
                <StatusIcon
                  size={10}
                  className={statusCfg.spin ? "animate-spin" : ""}
                />
                {statusCfg.label}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[doc.documentType]}`}>
                {doc.documentType}
              </span>
              <span className="text-[10px] text-slate-400">{formatSize(doc.fileSize)}</span>
              {doc.totalChunks > 0 && (
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Layers size={9} />
                  {doc.indexedChunks}/{doc.totalChunks} chunks
                </span>
              )}
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Calendar size={9} /> {formatDate(doc.uploadedAt)}
              </span>
            </div>

            {doc.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                <Tag size={9} className="text-slate-400" />
                {doc.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {doc.status === "failed" && doc.errorMessage && (
              <p className="text-[10px] text-red-600 mt-1.5 bg-red-50 px-2 py-1 rounded">
                {doc.errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* Expand / collapse description */}
        {doc.description && (
          <div className="mt-3 border-t border-slate-100 pt-2">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700"
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? "Hide" : "Show"} description
            </button>
            {expanded && (
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{doc.description}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={handleReIndex}
            disabled={!!actionLoading || isProcessing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {actionLoading === "reindex"
              ? <Loader2 size={12} className="animate-spin" />
              : <RefreshCw size={12} />}
            Re-Index
          </button>
          <button
            onClick={handleDelete}
            disabled={!!actionLoading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
          >
            {actionLoading === "delete"
              ? <Loader2 size={12} className="animate-spin" />
              : <Trash2 size={12} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
