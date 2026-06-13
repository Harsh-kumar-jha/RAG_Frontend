import { KBStatus, QdrantHealth, QdrantMetrics } from "@/types";

const firstPositiveNumber = (...values: Array<number | null | undefined>) => {
  const value = values.find((item) => typeof item === "number" && item > 0);
  return value ?? 0;
};

export const getQdrantVectorCount = (
  status?: KBStatus,
  health?: QdrantHealth | null,
  metrics?: QdrantMetrics | null
) =>
  firstPositiveNumber(
    health?.pointsCount,
    health?.vectorsCount,
    health?.indexedVectorsCount,
    metrics?.vectorCount,
    metrics?.chunkCount,
    status?.vectorStore.vectorCount
  );

export const getQdrantConnectionStatus = (
  status?: KBStatus,
  health?: QdrantHealth | null
) => {
  if (health) return health.ok ? "connected" : "disconnected";
  return status?.vectorStore.status ?? "disconnected";
};
