import { apiJson, apiRequest } from "@/lib/auth";
import { appConfig, buildApiUrl, buildTemplatedPath } from "@/lib/config";

export interface ApplicationDocument {
  id?: number | string;
  type: string;
  status?: string;
  review_status?: string;
  reviewStatus?: string;
  decision?: string;
  decision_status?: string;
  decisionStatus?: string;
  rejected_reason?: string;
  rejectedReason?: string;
  manual_review_reason?: string;
  manualReviewReason?: string;
  review_reason?: string;
  reviewReason?: string;
  reasoning?: string;
  ai_reasoning?: string;
  aiReasoning?: string;
  download_url?: string;
  downloadUrl?: string;
  url?: string;
  access_url?: string;
  accessUrl?: string;
  download_path?: string;
  downloadPath?: string;
  object_key?: string;
  objectKey?: string;
  key?: string;
  filename?: string;
  name?: string;
  [key: string]: unknown;
}

interface PresignUploadResponse {
  uploadUrl: string;
  method?: string;
  headers?: Record<string, string>;
  fields?: Record<string, string>;
  finalizePayload?: Record<string, unknown>;
}

interface ResolveDownloadResponse {
  downloadUrl?: string;
  url?: string;
  accessUrl?: string;
  access_url?: string;
}

const resolveInlineDownloadUrl = (document: ApplicationDocument) => {
  const candidate =
    document.download_url ??
    document.downloadUrl ??
    document.url ??
    document.access_url ??
    document.accessUrl;

  if (typeof candidate === "string" && candidate.trim()) return candidate;

  const path = document.download_path ?? document.downloadPath;
  if (typeof path === "string" && path.trim()) {
    return buildApiUrl(path);
  }

  return null;
};

export const listApplicationDocuments = (applicationId: number) =>
  apiJson<ApplicationDocument[]>(`/documents/application/${applicationId}`, {
    method: "GET",
  }).then((documents) => (Array.isArray(documents) ? documents : []));

export const resolveDocumentDownloadUrl = async (
  document: ApplicationDocument
) => {
  const inlineUrl = resolveInlineDownloadUrl(document);
  if (inlineUrl) return inlineUrl;

  if (document.id && appConfig.documentResolveDownloadPath) {
    const resolved = await apiJson<ResolveDownloadResponse>(
      buildTemplatedPath(appConfig.documentResolveDownloadPath, {
        id: document.id,
      }),
      { method: "GET" }
    );

    const resolvedUrl =
      resolved.downloadUrl ??
      resolved.url ??
      resolved.accessUrl ??
      resolved.access_url;

    if (resolvedUrl) return resolvedUrl;
  }

  if (document.id) {
    return buildApiUrl(
      buildTemplatedPath(appConfig.documentDownloadPathTemplate, {
        id: document.id,
      })
    );
  }

  throw new Error(
    "Document is missing a downloadable URL and no resolver endpoint is configured."
  );
};

export const uploadDocument = async ({
  applicationId,
  type,
  file,
}: {
  applicationId: number;
  type: string;
  file: File;
}) => {
  if (appConfig.documentUploadMode === "presigned") {
    if (!appConfig.documentPresignUploadPath) {
      throw new Error(
        "Presigned uploads are enabled but NEXT_PUBLIC_DOCUMENT_PRESIGN_UPLOAD_PATH is not configured."
      );
    }

    const presignResponse = await apiJson<PresignUploadResponse>(
      appConfig.documentPresignUploadPath,
      {
        method: "POST",
        jsonBody: {
          applicationId,
          type,
          filename: file.name,
          contentType: file.type || "application/pdf",
          size: file.size,
        },
      }
    );

    const method = (presignResponse.method ?? "PUT").toUpperCase();
    if (method === "POST" && presignResponse.fields) {
      const body = new FormData();
      Object.entries(presignResponse.fields).forEach(([key, value]) =>
        body.append(key, value)
      );
      body.append("file", file);

      const uploadResponse = await fetch(presignResponse.uploadUrl, {
        method,
        body,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload document to object storage.");
      }
    } else {
      const uploadResponse = await fetch(presignResponse.uploadUrl, {
        method,
        headers: presignResponse.headers,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload document to object storage.");
      }
    }

    if (appConfig.documentFinalizeUploadPath) {
      await apiJson(appConfig.documentFinalizeUploadPath, {
        method: "POST",
        jsonBody: {
          applicationId,
          type,
          filename: file.name,
          ...(presignResponse.finalizePayload ?? {}),
        },
      });
    }

    return;
  }

  const uploadData = new FormData();
  uploadData.append("application_id", String(applicationId));
  uploadData.append("type", type);
  uploadData.append("file", file);

  const response = await apiRequest("/documents/upload", {
    method: "POST",
    body: uploadData,
    auth: true,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      String(
        (payload &&
          typeof payload === "object" &&
          "error" in payload &&
          payload.error) ||
          "Failed to upload document."
      )
    );
  }
};
