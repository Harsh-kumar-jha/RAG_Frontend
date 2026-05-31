"use client";

import React, { useState, useRef } from "react";
import { Upload, FileUp, AlertCircle, CheckCircle, X } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { BulkUploadRequest, DocumentType } from "@/types";

const DOCUMENT_TYPES: { label: string; value: DocumentType }[] = [
  { label: "Circular", value: "circular" },
  { label: "Tariff", value: "tariff" },
  { label: "Case Law", value: "case-law" },
  { label: "Classification", value: "classification" },
  { label: "Regulation", value: "regulation" },
  { label: "Notification", value: "notification" },
  { label: "Other", value: "other" },
];

interface BulkDocumentUploadProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export const BulkDocumentUpload: React.FC<BulkDocumentUploadProps> = ({
  onSuccess,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [documentType, setDocumentType] = useState<DocumentType>("circular");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { uploadDocument } = useDocuments();

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).map((file) => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-blue-50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-blue-50");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-50");
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onError?.("No files selected");
      return;
    }

    setIsUploading(true);

    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      for (let i = 0; i < files.length; i++) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading" as const } : f
          )
        );

        try {
          await uploadDocument({
            file: files[i].file,
            documentType,
            tags: tagArray.join(","),
            description: description || undefined,
          });

          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "success" as const, progress: 100 } : f
            )
          );
        } catch (error) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                  ...f,
                  status: "error" as const,
                  error: (error as Error).message || "Upload failed",
                }
                : f
            )
          );
        }
      }

      onSuccess?.();
    } catch (error) {
      onError?.((error as Error).message || "Bulk upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="space-y-4">
      {/* File Input Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6 transition-colors hover:bg-blue-100 cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 text-center"
        >
          <Upload size={32} className="text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">Click to upload or drag and drop</p>
            <p className="text-sm text-blue-700">PDF, DOC, DOCX, XLS, XLSX, TXT</p>
          </div>
        </button>
      </div>

      {/* Metadata */}
      {files.length > 0 && (
        <div className="space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isUploading}
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., customs, tariff, electronics"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isUploading}
            />
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              Files ({files.length})
            </h3>
            <div className="flex gap-2 text-xs">
              {pendingCount > 0 && (
                <span className="text-slate-600">
                  {pendingCount} pending
                </span>
              )}
              {uploadingCount > 0 && (
                <span className="text-blue-600 font-medium">
                  {uploadingCount} uploading
                </span>
              )}
              {successCount > 0 && (
                <span className="text-green-600 font-medium">
                  {successCount} success
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600 font-medium">
                  {errorCount} error
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((fileItem, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded border border-slate-200 bg-white"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                {fileItem.status === "pending" && (
                  <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                    Pending
                  </span>
                )}
                {fileItem.status === "uploading" && (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${ fileItem.progress }%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-600 font-medium w-10">
                      {fileItem.progress}%
                    </span>
                  </div>
                )}
                {fileItem.status === "success" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="text-xs font-medium">Done</span>
                  </div>
                )}
                {fileItem.status === "error" && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle size={16} />
                      <span className="text-xs font-medium">Error</span>
                    </div>
                  </div>
                )}

                {!isUploading && fileItem.status !== "success" && (
                  <button
                    onClick={() => removeFile(index)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {fileItem.status === "error" && fileItem.error && (
            <p className="text-xs text-red-600">{fileItem.error}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {files.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            <FileUp size={16} />
            {isUploading ? "Uploading..." : "Upload All"}
          </button>
          <button
            onClick={() => setFiles([])}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
