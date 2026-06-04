export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || null;

export function getApiBaseUrl(): string | null {
  if (!apiBaseUrl) {
    const message =
      "Missing VITE_API_BASE_URL environment variable. " +
      "Set VITE_API_BASE_URL to your backend base URL before building the frontend.";
    if (import.meta.env.DEV) {
      console.warn(message);
    } else {
      console.error(message);
    }
    return null;
  }
  return apiBaseUrl;
}

export function getBackendErrorDescription(err: unknown): string {
  const message =
    err && typeof err === "object" && "message" in err && typeof (err as any).message === "string"
      ? (err as any).message
      : String(err ?? "");

  if (
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("operation timed out") ||
    message.includes("Failed to fetch")
  ) {
    return "Unable to reach the backend API. Confirm VITE_API_BASE_URL is set to your Render backend URL and the backend is live.";
  }

  return message;
}
