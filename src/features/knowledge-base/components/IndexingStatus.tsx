"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Database, Layers, CheckCircle2, AlertCircle, Loader2,
  Clock, RefreshCw, Zap, HardDrive, Activity
} from "lucide-react";
import { knowledgeBaseApi } from "../api/knowledgeBase.api";
import { DocumentRecord, KBStatus } from "@/types";

const StatCard = ({
  icon: Icon, label, value, sub, color,
}: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace("text-", "bg-").replace("-600", "-100").replace("-700", "-100")}`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  </div>
);

const QueueItem = ({ item }: { item: any }) => {
  const progress = item.totalChunks > 0 ? Math.round((item.indexedChunks / item.totalChunks) * 100) : 0;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <Loader2 size={14} className="animate-spin text-blue-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 flex-shrink-0">{progress}%</span>
        </div>
      </div>
      <span className="text-[10px] text-slate-400 capitalize">{item.documentType}</span>
    </div>
  );
};

export const IndexingStatus = () => {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery<{
    status: KBStatus;
    queue: DocumentRecord[];
    failed: DocumentRecord[];
  }>({
    queryKey: ["knowledge-base", "overview"],
    queryFn: async () => {
      const [status, queue, failed] = await Promise.all([
        knowledgeBaseApi.getStatus(),
        knowledgeBaseApi.getQueue(),
        knowledgeBaseApi.getFailed(),
      ]);

      return { status, queue, failed };
    },
    refetchInterval: 8000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data?.status) return null;

  const { status, queue, failed } = data;
  const { vectorStore, documents } = status;

  return (
    <div className="space-y-6">
      {/* Vector store connection badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            vectorStore.status === "connected"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              vectorStore.status === "connected" ? "bg-emerald-500" : "bg-red-500"
            }`} />
            Qdrant {vectorStore.status === "connected" ? "Connected" : "Disconnected"}
          </span>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          label="Indexed Documents"
          value={documents.indexed}
          sub="fully vectorized"
          color="text-emerald-600"
        />
        <StatCard
          icon={Zap}
          label="Total Vectors"
          value={vectorStore.vectorCount.toLocaleString()}
          sub="in Qdrant"
          color="text-indigo-600"
        />
        <StatCard
          icon={Database}
          label="Total Chunks"
          value={documents.totalChunks.toLocaleString()}
          sub="embedded text blocks"
          color="text-blue-600"
        />
        <StatCard
          icon={HardDrive}
          label="Disk Usage"
          value={`${vectorStore.diskUsageMb} MB`}
          sub="vector storage"
          color="text-slate-600"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3">
        {documents.processing > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-blue-700">{documents.processing}</p>
              <p className="text-[10px] text-blue-600">Processing</p>
            </div>
          </div>
        )}
        {documents.pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
            <Clock size={18} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-amber-700">{documents.pending}</p>
              <p className="text-[10px] text-amber-600">Pending</p>
            </div>
          </div>
        )}
        {documents.failed > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-red-700">{documents.failed}</p>
              <p className="text-[10px] text-red-600">Failed</p>
            </div>
          </div>
        )}
      </div>

      {/* Processing queue */}
      {queue.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-700">Indexing Queue</h3>
            <span className="ml-auto text-xs text-slate-400">{queue.length} items</span>
          </div>
          <div>
            {queue.map((item) => (
              <QueueItem key={item._id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Failed documents */}
      {failed.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-red-500" />
            <h3 className="text-sm font-semibold text-slate-700">Failed Documents</h3>
          </div>
          <div className="space-y-2">
            {failed.map((item) => (
              <div key={item._id} className="flex items-start gap-2 py-2 border-b border-slate-100 last:border-0">
                <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-700">{item.name}</p>
                  <p className="text-[10px] text-red-500 mt-0.5">{item.errorMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
