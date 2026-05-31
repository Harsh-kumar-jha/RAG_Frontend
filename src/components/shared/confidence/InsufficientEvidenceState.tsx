"use client";

import React from "react";
import { Search, FileX } from "lucide-react";

interface InsufficientEvidenceStateProps {
  query?: string;
  showDocumentLink?: boolean;
  onUploadClick?: () => void;
}

export const InsufficientEvidenceState: React.FC<InsufficientEvidenceStateProps> = ({
  query,
  showDocumentLink = true,
  onUploadClick,
}) => {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
          <FileX className="text-amber-600" size={24} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-amber-900">Insufficient Evidence</h3>
        <p className="text-sm text-amber-800">
          {query
            ? `No reliable information found in your knowledge base for: "${ query }"`
            : "No reliable information found in the available documents."}
        </p>
      </div>

      {showDocumentLink && (
        <p className="text-xs text-amber-700 mt-3">
          Try uploading relevant documents to the knowledge base to improve answer quality.
        </p>
      )}

      {onUploadClick && (
        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          <Search size={16} />
          Upload Documents
        </button>
      )}
    </div>
  );
};
