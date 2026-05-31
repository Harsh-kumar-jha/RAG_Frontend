import { apiClient } from "@/lib/api.client";
import {
  ApiResponse,
  Document,
  DocumentType,
  DocumentStatus,
  DocumentVersion,
  ListDocumentsQuery,
  ListDocumentsResponse,
  DocumentStats,
  UploadDocumentRequest,
  BulkUploadRequest,
} from "@/types";

// Backward compatibility alias
export interface UploadDocumentPayload extends UploadDocumentRequest {
  file: File;
  documentType: DocumentType;
  tags?: string;
  description?: string;
}

export const documentsApi = {
  /**
   * Upload a new document
   * POST /documents/upload
   */
  upload: async (payload: UploadDocumentPayload | UploadDocumentRequest): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", (payload as any).file);
    formData.append("documentType", (payload as any).documentType);
    if ((payload as any).tags) formData.append("tags", (payload as any).tags);
    if ((payload as any).description) formData.append("description", (payload as any).description);
    if ((payload as any).source) formData.append("source", (payload as any).source);
    if ((payload as any).sourceOwner) formData.append("sourceOwner", (payload as any).sourceOwner);
    if ((payload as any).jurisdiction) formData.append("jurisdiction", (payload as any).jurisdiction);
    if ((payload as any).documentDate) formData.append("documentDate", (payload as any).documentDate);
    if ((payload as any).effectiveFrom) formData.append("effectiveFrom", (payload as any).effectiveFrom);
    if ((payload as any).hsnCodes) formData.append("hsnCodes", (payload as any).hsnCodes);
    if ((payload as any).confidentiality) formData.append("confidentiality", (payload as any).confidentiality);
    if ((payload as any).reviewStatus) formData.append("reviewStatus", (payload as any).reviewStatus);
    if ((payload as any).trustScore) formData.append("trustScore", (payload as any).trustScore);
    if ((payload as any).metadata) {
      const metadata = typeof (payload as any).metadata === "string"
        ? (payload as any).metadata
        : JSON.stringify((payload as any).metadata);
      formData.append("metadata", metadata);
    }
    if ((payload as any).previousVersionId) formData.append("previousVersionId", (payload as any).previousVersionId);

    const res = await apiClient.post<ApiResponse<Document>>("/documents/upload", formData);

    if (!res.data.data) {
      throw new Error(res.data.message || "Upload failed");
    }

    return res.data.data;
  },

  /**
   * Bulk upload multiple documents
   * POST /documents/upload/bulk
   */
  bulkUpload: async (payload: BulkUploadRequest): Promise<Document[]> => {
    const formData = new FormData();

    // Append files
    payload.files.forEach((file) => {
      formData.append("files", file);
    });

    // Append metadata
    formData.append("documentType", payload.documentType);
    if (payload.tags) formData.append("tags", payload.tags);
    if (payload.description) formData.append("description", payload.description);
    if (payload.sourceOwner) formData.append("sourceOwner", payload.sourceOwner);
    if (payload.jurisdiction) formData.append("jurisdiction", payload.jurisdiction);
    if (payload.documentDate) formData.append("documentDate", payload.documentDate);
    if (payload.effectiveFrom) formData.append("effectiveFrom", payload.effectiveFrom);
    if (payload.hsnCodes) formData.append("hsnCodes", payload.hsnCodes);
    if (payload.confidentiality) formData.append("confidentiality", payload.confidentiality);
    if (payload.reviewStatus) formData.append("reviewStatus", payload.reviewStatus);
    if (payload.metadata) {
      const metadata = typeof payload.metadata === "string"
        ? payload.metadata
        : JSON.stringify(payload.metadata);
      formData.append("metadata", metadata);
    }
    if (payload.previousVersionId) formData.append("previousVersionId", payload.previousVersionId);

    const res = await apiClient.post<ApiResponse<Document[]>>("/documents/upload/bulk", formData);

    if (!res.data.data) {
      throw new Error(res.data.message || "Bulk upload failed");
    }

    return res.data.data;
  },

  /**
   * List documents with filters and pagination
   * GET /documents
   */
  list: async (params?: ListDocumentsQuery) => {
    const res = await apiClient.get<ApiResponse<ListDocumentsResponse>>("/documents", {
      params: params || {}
    });
    return res.data.data || { documents: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
  },

  /**
   * Get a single document by ID
   * GET /documents/:id
   */
  getOne: async (id: string): Promise<Document> => {
    const res = await apiClient.get<ApiResponse<Document>>(`/documents/${ id }`);

    if (!res.data.data) {
      throw new Error(res.data.message || "Document not found");
    }

    return res.data.data;
  },

  /**
   * Get collection statistics
   * GET /documents/stats
   */
  stats: async (): Promise<DocumentStats> => {
    const res = await apiClient.get<ApiResponse<DocumentStats>>("/documents/stats");

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get statistics");
    }

    return res.data.data;
  },

  /**
   * Re-index a document (delete vectors and re-index)
   * POST /documents/:id/reindex
   */
  reindex: async (id: string): Promise<void> => {
    const res = await apiClient.post(`/documents/${ id }/reindex`, {});

    if (!res.data.status) {
      throw new Error(res.data.message || "Re-indexing failed");
    }
  },

  /**
   * Delete a document (soft or hard delete)
   * DELETE /documents/:id
   */
  delete: async (id: string, hard: boolean = false): Promise<void> => {
    const res = await apiClient.delete(`/documents/${ id }`, {
      params: { hard }
    });

    if (!res.data.status) {
      throw new Error(res.data.message || "Delete failed");
    }
  },

  /**
   * Get document version history
   * GET /documents/:id/versions
   */
  getVersions: async (id: string): Promise<DocumentVersion[]> => {
    const res = await apiClient.get<ApiResponse<DocumentVersion[]>>(`/documents/${ id }/versions`);

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get document versions");
    }

    return res.data.data;
  },

  /**
   * Get latest version of a document
   * GET /documents/:id/latest
   */
  getLatestVersion: async (id: string): Promise<DocumentVersion> => {
    const res = await apiClient.get<ApiResponse<DocumentVersion>>(`/documents/${ id }/latest`);

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to get latest version");
    }

    return res.data.data;
  },

  /**
   * Restore a document to a previous version
   * POST /documents/:id/restore
   */
  restoreVersion: async (id: string): Promise<DocumentVersion> => {
    const res = await apiClient.post<ApiResponse<DocumentVersion>>(`/documents/${ id }/restore`, {});

    if (!res.data.data) {
      throw new Error(res.data.message || "Failed to restore document version");
    }

    return res.data.data;
  },

  /**
   * Alias for backward compatibility
   */
  reIndex: async (id: string): Promise<void> => {
    return documentsApi.reindex(id);
  },

  /**
   * Alias for backward compatibility
   */
  remove: async (id: string): Promise<void> => {
    return documentsApi.delete(id, false);
  },
};
