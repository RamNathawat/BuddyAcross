const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FetchOptions extends RequestInit {
  token?: string;
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

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
