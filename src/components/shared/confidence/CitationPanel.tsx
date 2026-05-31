"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, ExternalLink, Bookmark } from "lucide-react";
import { SourceReference } from "@/types";

interface CitationPanelProps {
  sources: SourceReference[];
  compact?: boolean;
}

const getSourceLabel = (source: SourceReference): string => {
  let location = "";

  if (source.pageNumber) {
    location = `p. ${ source.pageNumber }`;
  } else if (source.sheetName) {
    location = source.rowNumber
      ? `${ source.sheetName } row ${ source.rowNumber }`
      : source.sheetName;
  } else {
    location = "location unavailable";
  }

  return `${ source.documentName || "Document" } · ${ location } · v${ source.version ?? 1 }`;
};

const SourceItem: React.FC<{ source: SourceReference; index: number }> = ({
  source,
  index,
}) => {
  const [expanded, setExpanded] = useState(false);
  const relevanceScore = Math.round((source.sourceConfidence ?? source.relevanceScore ?? 0.7) * 100);

  const confidenceColor =
    relevanceScore >= 80
      ? "bg-green-100 text-green-800"
      : relevanceScore >= 60
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";

  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">{getSourceLabel(source)}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {source.documentType && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
                  {source.documentType.replace("-", " ")}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${ confidenceColor } font-medium`}>
                {relevanceScore}% confident
              </span>
              {source.trustScore && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  Trust: {Math.round(source.trustScore * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-1"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
          {source.snippet && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Quote:</p>
              <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2 rounded border border-slate-100">
                "{source.snippet}"
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {source.documentDate && (
              <div>
                <span className="font-medium text-slate-600">Document Date:</span>
                <p className="text-slate-700">{new Date(source.documentDate).toLocaleDateString()}</p>
              </div>
            )}
            {source.uploadedAt && (
              <div>
                <span className="font-medium text-slate-600">Uploaded:</span>
                <p className="text-slate-700">{new Date(source.uploadedAt).toLocaleDateString()}</p>
              </div>
            )}
            {source.chunkId && (
              <div className="col-span-2">
                <span className="font-medium text-slate-600">Chunk ID:</span>
                <p className="text-slate-700 break-all font-mono text-[10px]">{source.chunkId}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CitationPanel: React.FC<CitationPanelProps> = ({ sources, compact = false }) => {
  if (!sources || sources.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
        <Bookmark size={14} className="text-blue-700" />
        <span className="font-semibold">{sources.length} source{sources.length > 1 ? "s" : ""}</span>
        {sources.slice(0, 3).map((source, index) => (
          <span
            key={`${ source.documentId }-${ index }`}
            className="max-w-[180px] truncate rounded-md border border-blue-200 bg-white px-2 py-1 text-blue-800"
            title={getSourceLabel(source)}
          >
            {source.documentName || "Document"}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-blue-600" />
        <h3 className="font-semibold text-blue-900">
          Sources ({sources.length})
        </h3>
      </div>
      <div className="space-y-2">
        {sources.map((source, idx) => (
          <SourceItem key={`${ source.documentId }-${ idx }`} source={source} index={idx} />
        ))}
      </div>
    </div>
  );
};
