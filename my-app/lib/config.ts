const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const readString = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

const readOptionalString = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const readList = (value: string | undefined, fallback: string[]) => {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const appConfig = {
  apiBaseUrl: trimTrailingSlash(
    readString(process.env.NEXT_PUBLIC_API_BASE_URL, "http://localhost:8080")
  ),
  authMode: readString(process.env.NEXT_PUBLIC_AUTH_MODE, "auto"),
  authMePath: readOptionalString(process.env.NEXT_PUBLIC_AUTH_ME_PATH),
  oauthProviders: readList(process.env.NEXT_PUBLIC_OAUTH_PROVIDERS, ["google"]),
  googleClientId: readOptionalString(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  ),
  documentUploadMode: readString(
    process.env.NEXT_PUBLIC_DOCUMENT_UPLOAD_MODE,
    "proxy"
  ),
  documentPresignUploadPath: readOptionalString(
    process.env.NEXT_PUBLIC_DOCUMENT_PRESIGN_UPLOAD_PATH
  ),
  documentFinalizeUploadPath: readOptionalString(
    process.env.NEXT_PUBLIC_DOCUMENT_FINALIZE_UPLOAD_PATH
  ),
  documentResolveDownloadPath: readOptionalString(
    process.env.NEXT_PUBLIC_DOCUMENT_RESOLVE_DOWNLOAD_PATH
  ),
  documentDownloadPathTemplate: readString(
    process.env.NEXT_PUBLIC_DOCUMENT_DOWNLOAD_PATH_TEMPLATE,
    "/documents/{id}/download"
  ),
};

export const buildApiUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${appConfig.apiBaseUrl}${normalizedPath}`;
};

export const buildTemplatedPath = (
  template: string,
  replacements: Record<string, string | number>
) =>
  Object.entries(replacements).reduce(
    (current, [key, value]) =>
      current.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template
  );
