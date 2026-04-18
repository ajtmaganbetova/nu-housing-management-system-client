import { appConfig, buildApiUrl } from "@/lib/config";

export interface AuthUser {
  id?: number | string;
  email?: string;
  role?: string;
  nu_id?: string;
  phone?: string | null;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface AuthSession {
  token: string | null;
  user: AuthUser | null;
}

const STORAGE_TOKEN_KEY = "token";
const STORAGE_USER_KEY = "user";

const isBrowser = () => typeof window !== "undefined";

const safeJsonParse = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const getStoredSession = (): AuthSession => {
  if (!isBrowser()) {
    return { token: null, user: null };
  }

  return {
    token: window.localStorage.getItem(STORAGE_TOKEN_KEY),
    user: safeJsonParse<AuthUser>(
      window.localStorage.getItem(STORAGE_USER_KEY)
    ),
  };
};

export const persistSession = (session: Partial<AuthSession>) => {
  if (!isBrowser()) return;

  if ("token" in session) {
    const token = session.token ?? null;
    if (token) window.localStorage.setItem(STORAGE_TOKEN_KEY, token);
    else window.localStorage.removeItem(STORAGE_TOKEN_KEY);
  }

  if ("user" in session) {
    const user = session.user ?? null;
    if (user) window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_USER_KEY);
  }
};

export const clearStoredSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_TOKEN_KEY);
  window.localStorage.removeItem(STORAGE_USER_KEY);
};

export const getDashboardPathForRole = (role?: string | null) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "housing") return "/dashboard/housing";
  return "/dashboard/student";
};

const createHeaders = (
  initHeaders?: HeadersInit,
  token?: string | null,
  isJsonBody = false
) => {
  const headers = new Headers(initHeaders);
  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export async function apiRequest(
  path: string,
  init: RequestInit & {
    auth?: boolean;
    jsonBody?: unknown;
    includeCredentials?: boolean;
  } = {}
) {
  const session = getStoredSession();
  const hasJsonBody = typeof init.jsonBody !== "undefined";
  const headers = createHeaders(
    init.headers,
    init.auth === false ? null : session.token,
    hasJsonBody
  );
  const url = buildApiUrl(path);

  try {
    return await fetch(url, {
      ...init,
      headers,
      body: hasJsonBody ? JSON.stringify(init.jsonBody) : init.body,
      credentials: init.includeCredentials ? "include" : "same-origin",
    });
  } catch {
    throw new Error(
      `Unable to reach the API at ${url}. Check NEXT_PUBLIC_API_BASE_URL and confirm the backend server is running.`,
    );
  }
}

export async function apiJson<T>(
  path: string,
  init: RequestInit & {
    auth?: boolean;
    jsonBody?: unknown;
  } = {}
): Promise<T> {
  const response = await apiRequest(path, init);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (init.auth !== false && response.status === 401) {
      clearStoredSession();
    }

    const message =
      (typeof data === "object" && data && "error" in data && data.error) ||
      response.statusText ||
      "Request failed";
    throw new Error(String(message));
  }

  return data as T;
}

export const normalizeAuthSession = (payload: unknown): AuthSession | null => {
  if (!payload || typeof payload !== "object") return null;

  const value = payload as Record<string, unknown>;
  const user =
    (value.user as AuthUser | undefined) ??
    (value.data as { user?: AuthUser } | undefined)?.user ??
    null;
  const token =
    typeof value.token === "string"
      ? value.token
      : typeof value.accessToken === "string"
        ? value.accessToken
        : typeof value.access_token === "string"
          ? value.access_token
        : null;

  if (!user) return null;

  return { token, user };
};

export const fetchCurrentUser = async () => {
  if (!appConfig.authMePath) {
    throw new Error("Current-user endpoint is not configured.");
  }

  const payload = await apiJson<AuthUser | { user: AuthUser }>(
    appConfig.authMePath,
    { method: "GET" }
  );

  const user =
    payload && typeof payload === "object" && "user" in payload
      ? (payload.user as AuthUser)
      : (payload as AuthUser);

  const session = {
    token: appConfig.authMode === "token" ? getStoredSession().token : null,
    user,
  };
  persistSession(session);
  return session;
};

export const signInWithCredentials = async (email: string, password: string) => {
  const payload = await apiJson<unknown>("/auth/login", {
    method: "POST",
    auth: false,
    jsonBody: { email, password },
  });

  const directSession = normalizeAuthSession(payload);
  if (directSession) {
    if (appConfig.authMode === "token" && !directSession.token) {
      throw new Error("Login response did not include an access token.");
    }

    persistSession(directSession);
    return directSession;
  }

  return fetchCurrentUser();
};

export const signInWithGoogleIdToken = async (idToken: string) => {
  const payload = await apiJson<unknown>("/auth/google", {
    method: "POST",
    auth: false,
    jsonBody: { id_token: idToken },
  });

  const session = normalizeAuthSession(payload);
  if (!session) {
    throw new Error("Google sign-in completed without a valid session.");
  }

  persistSession(session);
  return session;
};

export const registerStudent = async (payload: Record<string, unknown>) =>
  apiJson("/auth/register", {
    method: "POST",
    auth: false,
    jsonBody: payload,
  });

export const resolveSession = async (requiredRole?: string) => {
  const stored = getStoredSession();

  if (stored.user) {
    if (requiredRole && stored.user.role !== requiredRole) {
      return null;
    }

    if (appConfig.authMode === "token" && !stored.token) {
      clearStoredSession();
      return null;
    }

    return stored;
  }

  if (appConfig.authMode !== "token" && appConfig.authMePath) {
    try {
      const session = await fetchCurrentUser();
      if (requiredRole && session.user?.role !== requiredRole) return null;
      return session;
    } catch {
      return null;
    }
  }

  return null;
};
