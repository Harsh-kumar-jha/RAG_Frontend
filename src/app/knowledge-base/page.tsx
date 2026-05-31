import { Database, BarChart3 } from "lucide-react";
import { IndexingStatus } from "@/features/knowledge-base/components/IndexingStatus";

export default function KnowledgeBasePage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Database size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Knowledge Base
              </h1>
              <p className="text-slate-600 mt-1">
                Monitor vector store health, indexing progress, and document processing status
              </p>
            </div>
          </div>
        </div>

        {/* Status component */}
        <IndexingStatus />
      </div>
    </div>
  );
}
