// ─── Document Types ────────────────────────────────────────────────────────────

export type DocumentType =
  | "circular"
  | "tariff"
  | "case-law"
  | "classification"
  | "regulation"
  | "notification"
  | "other";

export type DocumentStatus =
  | "uploaded"
  | "extracting"
  | "chunking"
  | "embedding"
  | "processing"
  | "indexed"
  | "failed";

export type ReviewStatus = "pending" | "approved" | "rejected" | "needs-review";
export type ConfidentialityLevel = "public" | "internal" | "confidential" | "restricted";

export interface Document {
  _id: string;
  name: string;
  originalName?: string;
  documentType: DocumentType;
  status: DocumentStatus;
  totalChunks: number;
  indexedChunks: number;
  fileSize: number;
  uploadedAt: string;
  indexedAt?: string;
  tags: string[];
  description?: string;
  sourceOwner?: string;
  jurisdiction?: string;
  documentDate?: string;
  effectiveFrom?: string;
  hsnCodes?: string[];
  confidentiality?: ConfidentialityLevel;
  reviewStatus?: ReviewStatus;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility
export type DocumentRecord = Document;

export interface UploadDocumentRequest {
  file: File;
  documentType: DocumentType;
  tags?: string; // comma-separated
  description?: string;
  source?: string;
  sourceOwner?: string;
  jurisdiction?: string;
  documentDate?: string;
  effectiveFrom?: string;
  hsnCodes?: string;
  confidentiality?: ConfidentialityLevel;
  reviewStatus?: ReviewStatus;
  metadata?: Record<string, unknown> | string;
}

export interface ListDocumentsQuery {
  status?: DocumentStatus;
  documentType?: DocumentType;
  tags?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListDocumentsResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DocumentStats {
  totalDocuments: number;
  byStatus: Record<DocumentStatus, number>;
  byType: Record<DocumentType, number>;
  totalSize: number;
  totalChunks: number;
  indexedChunks: number;
  lastIndexedAt: string;
}

export interface DocumentVersion extends Document {
  version: number;
  previousVersionId?: string;
  latestVersionFlag: boolean;
  documentGroupId?: string;
}

export interface BulkUploadRequest {
  files: File[];
  documentType: DocumentType;
  tags?: string;
  description?: string;
  previousVersionId?: string;
  sourceOwner?: string;
  jurisdiction?: string;
  documentDate?: string;
  effectiveFrom?: string;
  hsnCodes?: string;
  confidentiality?: ConfidentialityLevel;
  reviewStatus?: ReviewStatus;
  metadata?: Record<string, unknown> | string;
}

// ─── Advisory Types ────────────────────────────────────────────────────────────

export interface SourceReference {
  documentId: string;
  documentName?: string;
  documentType?: DocumentType;
  pageNumber?: number;
  sheetName?: string;
  rowNumber?: number;
  snippet?: string;
  relevanceScore?: number;
  score?: number;
  chunkId?: string;
  vectorId?: string;
  chunkIndex?: number;
  version?: number;
  uploadedAt?: string;
  documentDate?: string;
  trustScore?: number;
  freshnessScore?: number;
  sourceConfidence?: number;
}

export interface ConfidenceMetadata {
  score?: number;
  finalScore?: number;
  label?: "highly_confident" | "confident" | "partial_confidence" | "low_confidence" | string;
  retrievalScore?: number;
  rerankerScore?: number;
  groundednessScore?: number;
  processingTimeMs?: number;
  sources?: SourceReference[];
  groundedness?: {
    isGrounded?: boolean;
    hallucinations?: Array<{
      claim: string;
      confidence?: number;
      reason?: string;
    }>;
    supportedClaims?: Array<{
      claim: string;
      supportingChunks?: string[];
      confidence?: number;
    }>;
  };
  hallucinations?: Array<{
    claim: string;
    confidence?: number;
    reason?: string;
  }>;
  supportedClaims?: Array<{
    claim: string;
    supportingChunks?: string[];
    confidence?: number;
  }>;
}

export interface AdvisoryResponse {
  shortAnswer: string;
  recommendedClassification?: string;
  reasoning: string;
  sourceReferences: SourceReference[];
  alternateViews: string[];
  riskFlags: string[];
  confidenceScore: number;
  confidenceLabel?: string;
  humanReviewRequired: boolean;
  queryType?: "classification" | "compliance" | "penalty" | "documentation" | "general";
}

// ─── Chat Types ────────────────────────────────────────────────────────────────

export interface ChatSession {
  _id: string;
  title: string;
  messageCount: number;
  filters?: {
    documentTypes?: DocumentType[];
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  advisory?: AdvisoryResponse;
  retrievedChunkIds?: string[];
  confidence?: ConfidenceMetadata;
  createdAt: string;
  updatedAt?: string;
}

export interface ListSessionsQuery {
  page?: number;
  limit?: number;
}

export interface ListSessionsResponse {
  sessions: ChatSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StreamAdvisoryRequest {
  query: string;
  filters?: {
    documentTypes?: DocumentType[];
    tags?: string[];
    documentIds?: string[];
  };
}

// ─── SSE Stream Events ─────────────────────────────────────────────────────────

export interface SourcesEvent {
  sources: SourceReference[];
  totalFound: number;
}

export interface ChunkEvent {
  content: string;
}

export interface AdvisoryEvent {
  advisory: AdvisoryResponse;
}

export interface ConfidenceEvent extends ConfidenceMetadata { }

export interface CompleteEvent {
  sessionId: string;
  title?: string;
  messageCount: number;
}

export interface ErrorEvent {
  message: string;
}

export interface ThinkingEvent {
  thinking: string;
}

export type StreamEventType = "sources" | "thinking" | "chunk" | "advisory" | "confidence" | "error" | "complete";

// ─── Knowledge Base Types ──────────────────────────────────────────────────────

export interface KBStatus {
  vectorStore: {
    status: "connected" | "disconnected";
    vectorCount: number;
    indexedSegments: number;
    diskUsageMb: number;
  };
  documents: {
    indexed: number;
    processing: number;
    failed: number;
    pending: number;
    totalChunks: number;
  };
}

export interface RetrievalDiagnostics {
  vectorCandidates: number;
  keywordCandidates: number;
  fusedCandidates: number;
  retrievalConsistency: number;
  cacheHit: boolean;
  queryVariants?: string[];
  rewrittenQuery?: string;
  hydeUsed?: boolean;
  correctivePasses?: number;
}

export interface SourcesEventData {
  sources: SourceReference[];
  totalFound: number;
  diagnostics?: RetrievalDiagnostics;
}

export interface EvaluationResult {
  id: string;
  query: string;
  sourceHit: boolean;
  citationHit: boolean;
  keyFactsConfigured: number;
  retrievedSources: Array<{
    documentName: string;
    pageNumber?: number;
    relevanceScore: number;
  }>;
  score: number;
  latencyMs: number;
  expectedUnsupported: boolean;
  unsupportedCorrect: boolean;
}

export interface KBEvaluation {
  status: "passed" | "failed";
  passThreshold: number;
  totalCases: number;
  passRate: number;
  metrics: {
    sourceHitRate: number;
    citationHitRate: number;
    recallAtK: number;
    precisionProxy: number;
    adversarialPassRate: number;
    averageLatencyMs: number;
    unsupportedAnswerRate: number;
    hallucinationTrackingRate: number;
    humanReviewCorrectness: number | null;
  };
  results: EvaluationResult[];
}

// ─── Confidence Analytics Types ────────────────────────────────────────────────

export interface ConfidenceMetricsResponse {
  totalQueries: number;
  averageConfidence: number;
  distributionByLabel: Record<
    "highly_confident" | "confident" | "partial_confidence" | "low_confidence",
    number
  >;
  averageComponentScores: {
    retrieval: number;
    reranker: number;
    groundedness: number;
  };
  hallucinations: {
    average: number;
    queries: string[];
  };
  topHallucinations: Array<{
    claim: string;
    count: number;
    avgConfidence: number;
  }>;
}

export interface LowConfidenceQuery {
  query: string;
  confidence: number;
  label: "low_confidence" | "partial_confidence";
  sessionId: string;
  createdAt: string;
}

export interface LowConfidenceResponse {
  threshold: number;
  queries: LowConfidenceQuery[];
  total: number;
}

export interface ConfidenceTrendData {
  date: string;
  averageConfidence: number;
  queryCount: number;
}

export interface ConfidenceTrendResponse {
  period: {
    days: number;
    intervalDays: number;
  };
  trend: ConfidenceTrendData[];
}

export interface ConfidenceCorrelation {
  positive: number;
  negative: number;
  neutral: number;
  avgConfidenceByRating: Record<string, number>;
}

export interface ConfidenceFeedback {
  rating: number;
  feedback: string;
}

// ─── API Response Wrapper ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  code?: string;
  data?: T;
  details?: Record<string, any>;
  errors?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// ─── Error Types ───────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}
