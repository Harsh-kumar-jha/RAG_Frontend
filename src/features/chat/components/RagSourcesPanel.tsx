"use client";

import { Bookmark } from "lucide-react";
import { SourceReference } from "@/types";
import { getSourceDisplayName, getSourceIdentity } from "../utils/sources";

export const RagSourcesPanel = ({ sources }: { sources: SourceReference[] }) => {
  if (!sources.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
      <Bookmark size={14} className="text-blue-700 flex-shrink-0" />
      <span className="font-semibold">{sources.length} source{sources.length > 1 ? "s" : ""}</span>
      {sources.slice(0, 4).map((source, index) => (
        <span
          key={`${ getSourceIdentity(source) }-${ index }`}
          className="max-w-[180px] truncate rounded-md border border-blue-200 bg-white px-2 py-1 text-blue-800"
          title={getSourceDisplayName(source)}
        >
          {getSourceDisplayName(source)}
        </span>
      ))}
    </div>
  );
};
