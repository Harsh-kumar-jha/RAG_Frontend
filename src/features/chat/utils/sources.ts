import { SourceReference } from "@/types";

const getSourceScore = (source: SourceReference) =>
  source.relevanceScore ?? source.score ?? 0;

const normalizeSourceName = (source: SourceReference) =>
  source.documentName?.trim() ||
  (source.documentId ? `Document ${source.documentId}` : undefined) ||
  source.chunkId ||
  "Indexed document";

export const getSourceDisplayName = (source: SourceReference) =>
  normalizeSourceName(source);

export const getSourceMatchPercent = (source: SourceReference) => {
  const rawScore = getSourceScore(source);
  const normalized = rawScore > 1 ? rawScore : rawScore * 100;

  return Math.max(0, Math.min(100, Math.round(normalized)));
};

export const getSourceIdentity = (source: SourceReference) =>
  [
    source.documentId?.trim().toLowerCase(),
    source.documentName?.trim().toLowerCase(),
    source.vectorId?.trim().toLowerCase(),
    source.chunkId?.trim().toLowerCase(),
  ].find(Boolean) || "indexed-document";

export const dedupeSourcesByDocument = (sources: SourceReference[] = []) => {
  const uniqueSources = new Map<string, SourceReference>();

  sources.forEach((source) => {
    const key =
      source.documentId?.trim().toLowerCase() ||
      source.documentName?.trim().toLowerCase() ||
      source.vectorId?.trim().toLowerCase() ||
      source.chunkId?.trim().toLowerCase() ||
      "indexed-document";
    const existing = uniqueSources.get(key);

    if (!existing || getSourceScore(source) > getSourceScore(existing)) {
      uniqueSources.set(key, source);
    }
  });

  return Array.from(uniqueSources.values());
};
