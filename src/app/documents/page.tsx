"use client";

import { useState } from "react";
import { DocumentUpload } from "@/features/documents/components/DocumentUpload";
import { DocumentList } from "@/features/documents/components/DocumentList";
import { FileText, Upload } from "lucide-react";

export default function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Document Management
              </h1>
              <p className="text-slate-600 mt-1">
                Upload and manage customs documents for the knowledge base
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload section */}
          <div className="lg:col-span-1">
            <DocumentUpload onSuccess={() => setRefreshTrigger((p) => p + 1)} />
          </div>

          {/* Documents list */}
          <div className="lg:col-span-2">
            <DocumentList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </div>
  );
}
