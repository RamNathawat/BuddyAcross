const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

/**
 * Typed fetch wrapper for the Express API.
 * Automatically handles JSON serialization and auth headers.
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

  const response = await fetch(`${API_BASE_URL}/v1${endpoint}`, {
    headers,
    body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    ...rest,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "An error occurred");
  }

  return data as T;
}
