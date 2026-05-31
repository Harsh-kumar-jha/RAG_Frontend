"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FileText,
  Database,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Shield,
  BookOpen,
  Gavel,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { knowledgeBaseApi } from "@/features/knowledge-base/api/knowledgeBase.api";
import { KBStatus } from "@/types";

const SAMPLE_QUERIES = [
  {
    icon: BookOpen,
    text: "What is the HSN classification for a frequency converter?",
    type: "Classification",
  },
  {
    icon: FileText,
    text: "What documents are required for a first-time importer?",
    type: "Documentation",
  },
  {
    icon: Gavel,
    text: "What penalty risk applies for incorrect classification?",
    type: "Compliance",
  },
  {
    icon: Shield,
    text: "Compliance requirements for packaged drinking water import?",
    type: "Regulation",
  },
];

export default function DashboardPage() {
  const { data: kbStatus } = useQuery<KBStatus>({
    queryKey: ["knowledge-base", "status"],
    queryFn: knowledgeBaseApi.getStatus,
    staleTime: 30_000,
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Customs Advisory AI
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            RAG-powered intelligence for HSN classification, customs compliance, and trade
            regulations. Ask anything about tariffs, duties, and import/export procedures.
          </p>
        </div>

        {/* Quick stats */}
        {kbStatus && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: "Indexed Docs",
                value: kbStatus.documents.indexed,
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Total Vectors",
                value: kbStatus.vectorStore.vectorCount.toLocaleString(),
                icon: Database,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Text Chunks",
                value: kbStatus.documents.totalChunks.toLocaleString(),
                icon: FileText,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Processing",
                value: kbStatus.documents.processing,
                icon: TrendingUp,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-8 h-8 ${ bg } rounded-lg flex items-center justify-center mb-2`}>
                  <Icon size={16} className={color} />
                </div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-lg font-bold ${ color }`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              href: "/documents",
              icon: FileText,
              title: "Upload Documents",
              desc: "Add customs circulars, tariffs, case laws, and regulations",
            },
            {
              href: "/knowledge-base",
              icon: Database,
              title: "Knowledge Base",
              desc: "Monitor indexing progress and document processing queue",
            },
            {
              href: "/chat",
              icon: MessageSquare,
              title: "Advisory Chat",
              desc: "Ask questions and get responses grounded in source documents",
            },
          ].map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                <Icon size={20} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-indigo-600 font-medium group-hover:gap-2 transition-all">
                Open
                <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Sample queries */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Zap size={18} className="text-indigo-600" />
              Try These Queries
            </h2>
            <p className="text-sm text-slate-600">
              Click any to pre-fill and get started with advisory queries
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {SAMPLE_QUERIES.map(({ icon: Icon, text, type }) => (
              <Link
                key={text}
                href={`/chat?q=${ encodeURIComponent(text) }`}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
              >
                <Icon size={16} className="text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                <span className="text-sm text-slate-700 flex-1 group-hover:text-indigo-700">
                  {text}
                </span>
                <span className="text-xs text-slate-500 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  {type}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-2">How It Works</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">1.</span>
              <span>
                Upload customs documents (PDFs, regulations, case laws, tariff schedules)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">2.</span>
              <span>Documents are automatically indexed into the vector knowledge base</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">3.</span>
              <span>
                Ask questions in the advisory chat - responses are grounded in your documents
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
