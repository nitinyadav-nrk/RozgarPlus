import { getApiBaseUrl } from "@/lib/api";

export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl() ?? "";
  const token = typeof window !== "undefined" ? localStorage.getItem("rozgarplus_token") : null;
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}
