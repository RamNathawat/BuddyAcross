interface FetchOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

/**
 * Typed fetch wrapper for the Express API.
 * Automatically handles JSON serialization, auth headers, URL normalization, and HTML error pages.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers: customHeaders, body, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((customHeaders as Record<string, string>) || {}),
  };

  let authToken = token || (typeof window !== "undefined" ? localStorage.getItem("buddy_auth_token") || undefined : undefined);

  if (typeof window !== "undefined" && (!authToken || (!authToken.startsWith("BYPASS_") && !authToken.startsWith("TEST_")))) {
    try {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        authToken = data.session.access_token;
        localStorage.setItem("buddy_auth_token", authToken);
      }
    } catch (e) {
      // Ignore client error during SSR
    }
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");
  if (baseUrl.endsWith("/v1")) {
    baseUrl = baseUrl.slice(0, -3);
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}/v1${cleanEndpoint}`;

  const response = await fetch(fullUrl, {
    headers,
    body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    ...rest,
  });

  const rawText = await response.text();
  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (err) {
    if (rawText.trim().startsWith("<") || response.status >= 500) {
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error("Backend server is starting up or temporarily unavailable. Please wait 30 seconds and try again.");
      }
      if (response.status === 404) {
        throw new Error("API endpoint not found (404). Please verify server deployment URL.");
      }
      throw new Error("Server returned an invalid response. Please try again in a few moments.");
    }
    throw new Error("Received invalid data format from server.");
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `Server error (${response.status})`);
  }

  return data as T;
}
