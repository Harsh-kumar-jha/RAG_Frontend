"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Zap } from "lucide-react";

interface RiskFlagsProps {
  flags: string[];
  compact?: boolean;
}

const getRiskIcon = (flag: string) => {
  const lower = flag.toLowerCase();
  if (lower.includes("insufficient") || lower.includes("evidence")) {
    return AlertCircle;
  }
  if (lower.includes("hallucination")) {
    return Zap;
  }
  return AlertTriangle;
};

export const RiskFlags: React.FC<RiskFlagsProps> = ({ flags, compact = false }) => {
  if (!flags || flags.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {flags.map((flag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200"
          >
            <AlertTriangle size={12} />
            {flag}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-orange-600 flex-shrink-0" />
        <h3 className="font-semibold text-sm text-orange-900">Risk Flags</h3>
      </div>
      <ul className="space-y-1 ml-6">
        {flags.map((flag, idx) => (
          <li key={idx} className="text-sm text-orange-800 list-disc">
            {flag}
          </li>
        ))}
      </ul>
    </div>
  );
};
