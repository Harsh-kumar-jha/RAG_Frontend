"use client";

import React from "react";

interface ConfidenceBadgeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  label,
  size = "md",
  showAnimation = true,
}) => {
  const pct = Math.max(0, Math.min(100, Math.round(score > 1 ? score : score * 100)));

  const colorClasses =
    pct >= 90 ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
      pct >= 75 ? "bg-green-100 text-green-800 border-green-200" :
        pct >= 50 ? "bg-amber-100 text-amber-800 border-amber-200" :
          "bg-red-100 text-red-800 border-red-200";

  const dotColor =
    pct >= 90 ? "bg-emerald-600" :
      pct >= 75 ? "bg-green-600" :
        pct >= 50 ? "bg-amber-600" :
          "bg-red-600";

  const pingColor =
    pct >= 90 ? "bg-emerald-500" :
      pct >= 75 ? "bg-green-500" :
        pct >= 50 ? "bg-amber-500" :
          "bg-red-500";

  const sizeClasses =
    size === "sm" ? "px-2 py-1 text-xs" :
      size === "lg" ? "px-3.5 py-2 text-sm" :
        "px-2.5 py-1 text-xs";

  const confidenceLabel = label || `${ pct }% Confident`;

  return (
    <span className={`inline-flex items-center gap-1.5 ${ sizeClasses } rounded-full font-semibold border ${ colorClasses }`}>
      {showAnimation ? (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ pingColor }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${ dotColor }`} />
        </span>
      ) : (
        <span className={`inline-flex rounded-full h-2 w-2 ${ dotColor }`} />
      )}
      {confidenceLabel}
    </span>
  );
};
