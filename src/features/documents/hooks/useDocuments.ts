"use client";

import { useState, useCallback, useRef } from "react";
import {
  Document,
  DocumentType,
  DocumentStatus,
  ListDocumentsQuery,
  DocumentStats,
  ApiError,
} from "@/types";
import { documentsApi, UploadDocumentPayload } from "../api/documents.api";
import { retryWithBackoff, pollUntil } from "@/lib/api.client";

interface UseDocumentsReturn {
  // State
  documents: Document[];
  selectedDocument: Document | null;
  stats: DocumentStats | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number; pages: number };

  // Methods
  listDocuments: (query?: ListDocumentsQuery) => Promise<void>;
  getDocument: (id: string) => Promise<void>;
  uploadDocument: (payload: UploadDocumentPayload) => Promise<Document>;
  waitForIndexing: (docId: string, maxDurationMs?: number) => Promise<Document>;
  reindexDocument: (id: string) => Promise<void>;
  deleteDocument: (id: string, hard?: boolean) => Promise<void>;
  getStats: () => Promise<void>;
  selectDocument: (doc: Document | null) => void;
  clearError: () => void;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * List documents with filters and pagination
   */
  const listDocuments = useCallback(async (query?: ListDocumentsQuery) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await retryWithBackoff(
        () => documentsApi.list(query),
        3
      );

      setDocuments(result.documents);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = (err as ApiError).message || "Failed to load documents";
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get a single document
   */
  const getDocument = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const doc = await retryWithBackoff(
        () => documentsApi.getOne(id),
        3
      );

      setSelectedDocument(doc);
    } catch (err) {
      const errorMessage = (err as ApiError).message || "Failed to load document";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Upload a new document
   */
  const uploadDocument = useCallback(
    async (payload: UploadDocumentPayload): Promise<Document> => {
      setIsUploading(true);
      setError(null);

      try {
        const doc = await retryWithBackoff(
          () => documentsApi.upload(payload),
          3
        );

        // Add to documents list
        setDocuments((prev) => [doc, ...prev]);

        return doc;
      } catch (err) {
        const errorMessage = (err as ApiError).message || "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  /**
   * Poll and wait for a document to be indexed
   * @param docId Document ID to wait for
   * @param maxDurationMs Maximum time to wait (default: 2 minutes)
   */
  const waitForIndexing = useCallback(
    async (docId: string, maxDurationMs: number = 120000): Promise<Document> => {
      try {
        const doc = await pollUntil(
          () => documentsApi.getOne(docId),
          (result) => result.status === "indexed" || result.status === "failed",
          2000, // Check every 2 seconds
          maxDurationMs
        );

        if (doc.status === "failed") {
          throw new Error(doc.errorMessage || "Indexing failed");
        }

        // Update in list
        setDocuments((prev) =>
          prev.map((d) => (d._id === docId ? doc : d))
        );

        if (selectedDocument?._id === docId) {
          setSelectedDocument(doc);
        }

        return doc;
      } catch (err) {
        const errorMessage = (err as ApiError).message || "Indexing timeout or error";
        setError(errorMessage);
        throw err;
      }
    },
    [selectedDocument]
  );

  /**
   * Re-index a document
   */
  const reindexDocument = useCallback(async (id: string) => {
    setError(null);

    try {
      await retryWithBackoff(
        () => documentsApi.reindex(id),
        3
      );

      // Update document status to processing
      setDocuments((prev) =>
        prev.map((d) =>
          d._id === id
            ? { ...d, status: "processing" as DocumentStatus }
            : d
        )
      );

      if (selectedDocument?._id === id) {
        setSelectedDocument((prev) =>
          prev ? { ...prev, status: "processing" } : null
        );
      }
    } catch (err) {
      const errorMessage = (err as ApiError).message || "Re-indexing failed";
      setError(errorMessage);
    }
  }, [selectedDocument]);

  /**
   * Delete a document
   */
  const deleteDocument = useCallback(async (id: string, hard: boolean = false) => {
    setError(null);

    try {
      await retryWithBackoff(
        () => documentsApi.delete(id, hard),
        3
      );

      // Remove from list
      setDocuments((prev) => prev.filter((d) => d._id !== id));

      if (selectedDocument?._id === id) {
        setSelectedDocument(null);
      }
    } catch (err) {
      const errorMessage = (err as ApiError).message || "Delete failed";
      setError(errorMessage);
    }
  }, [selectedDocument]);

  /**
   * Get collection statistics
   */
  const getStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await retryWithBackoff(
        () => documentsApi.stats(),
        3
      );

      setStats(data);
    } catch (err) {
      const errorMessage = (err as ApiError).message || "Failed to load statistics";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Select/deselect a document
   */
  const selectDocument = useCallback((doc: Document | null) => {
    setSelectedDocument(doc);
  }, []);

  return {
    // State
    documents,
    selectedDocument,
    stats,
    isLoading,
    isUploading,
    error,
    pagination,

    // Methods
    listDocuments,
    getDocument,
    uploadDocument,
    waitForIndexing,
    reindexDocument,
    deleteDocument,
    getStats,
    selectDocument,
    clearError,
  };
};
