"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { documentsApi } from "../api/documents.api";
import { DocumentType } from "@/types";

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "circular", label: "Customs Circular" },
  { value: "tariff", label: "Tariff Schedule" },
  { value: "case-law", label: "Case Law / Judgment" },
  { value: "classification", label: "Classification Ruling" },
  { value: "regulation", label: "Regulation / Act" },
  { value: "notification", label: "Notification" },
  { value: "other", label: "Other" },
];

interface UploadState {
  file: File | null;
  documentType: DocumentType;
  tags: string;
  description: string;
  status: "idle" | "uploading" | "success" | "error";
  message: string;
}

export const DocumentUpload = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<UploadState>({
    file: null,
    documentType: "other",
    tags: "",
    description: "",
    status: "idle",
    message: "",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setState((p) => ({ ...p, file: acceptedFiles[0], status: "idle", message: "" }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "text/markdown": [".md"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  const uploadMutation = useMutation({
    mutationFn: documentsApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    },
  });

  const handleUpload = async () => {
    if (!state.file) return;
    setState((p) => ({ ...p, status: "uploading" }));

    try {
      await uploadMutation.mutateAsync({
        file: state.file,
        documentType: state.documentType,
        tags: state.tags,
        description: state.description,
      });

      setState((p) => ({
        ...p,
        status: "success",
        message: "Document uploaded! Indexing started in background.",
        file: null,
        tags: "",
        description: "",
      }));

      onSuccess?.();

      setTimeout(() => setState((p) => ({ ...p, status: "idle", message: "" })), 4000);
    } catch (err: any) {
      setState((p) => ({ ...p, status: "error", message: err.message || "Upload failed" }));
    }
  };

  const clearFile = () => setState((p) => ({ ...p, file: null, status: "idle", message: "" }));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Upload Document</h2>
        <p className="text-xs text-slate-500 mt-0.5">Supported: PDF, DOCX, TXT, CSV, MD · Max 50MB</p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-indigo-400 bg-indigo-50"
            : state.file
            ? "border-emerald-300 bg-emerald-50"
            : "border-slate-300 hover:border-indigo-300 hover:bg-slate-50"
        }`}
      >
        <input {...getInputProps()} />

        {state.file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText size={28} className="text-emerald-600 flex-shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{state.file.name}</p>
              <p className="text-xs text-slate-500">{formatSize(state.file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="ml-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div>
            <Upload size={28} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-600">
              {isDragActive ? "Drop the file here…" : "Drag & drop or click to select"}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT, CSV, Markdown</p>
          </div>
        )}
      </div>

      {/* Metadata fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={state.documentType}
            onChange={(e) => setState((p) => ({ ...p, documentType: e.target.value as DocumentType }))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Tags</label>
          <input
            type="text"
            value={state.tags}
            onChange={(e) => setState((p) => ({ ...p, tags: e.target.value }))}
            placeholder="hsn, import, duty, textiles… (comma separated)"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            value={state.description}
            onChange={(e) => setState((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of this document's scope..."
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
      </div>

      {/* Status message */}
      {state.message && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg ${
          state.status === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {state.status === "success"
            ? <CheckCircle2 size={15} />
            : <AlertCircle size={15} />}
          {state.message}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!state.file || state.status === "uploading"}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
      >
        {state.status === "uploading" ? (
          <><Loader2 size={16} className="animate-spin" /> Uploading...</>
        ) : (
          <><Upload size={16} /> Upload & Index</>
        )}
      </button>
    </div>
  );
};
