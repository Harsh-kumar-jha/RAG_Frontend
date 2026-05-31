"use client";

import { FileText, Zap } from "lucide-react";

const quickQueries = [
  {
    icon: Zap,
    label: "Quick Classification",
    description: "Get HSN guidance",
    query: "What is the HSN classification for a frequency converter?",
  },
  {
    icon: FileText,
    label: "Import Requirements",
    description: "Documents and steps",
    query: "What documents are required for a first-time importer?",
  },
  {
    icon: Zap,
    label: "Compliance Check",
    description: "Penalty and risk review",
    query: "What penalty risk applies for incorrect classification?",
  },
  {
    icon: FileText,
    label: "Product Specific",
    description: "Rules for one product",
    query: "Compliance requirements for packaged drinking water import?",
  },
];

export const EmptyChatState = ({ onPickQuery }: { onPickQuery: (query: string) => void }) => (
  <div className="flex h-full flex-col items-center justify-center px-4 py-8">
    <div className="mb-8 max-w-2xl text-center">
      <h1 className="mb-2 text-3xl font-bold text-slate-950">
        Customs Advisory Assistant
      </h1>
      <p className="text-base leading-7 text-slate-600">
        Ask classification, compliance, duty, documentation, and case-law questions grounded in indexed customs documents.
      </p>
    </div>

    <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
      {quickQueries.map(({ icon: Icon, label, description, query }) => (
        <button
          key={query}
          onClick={() => onPickQuery(query)}
          className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          <div className="flex items-start gap-3">
            <Icon size={20} className="mt-0.5 flex-shrink-0 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);
