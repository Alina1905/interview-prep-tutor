const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || "";

export function buildApiPath(path) {
  const normalizedBase = API_BASE_PATH ? `/${API_BASE_PATH.replace(/^\/+|\/+$/g, "")}` : "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}` || "/";
}

export async function readJsonResponse(res, endpoint = "request") {
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const snippet = text.trim().replace(/\s+/g, " ").slice(0, 200);
      const apiHint =
        res.status === 404 && snippet.startsWith("<!DOCTYPE html>")
          ? ` The ${endpoint} endpoint returned a Vercel/Next HTML 404 page, which usually means the route is missing in the deployed build or the app is deployed under a different base path.`
          : "";

      throw new Error(
        `Expected JSON but received ${res.status} ${res.statusText}${snippet ? `: ${snippet}` : ""}.${apiHint}`
      );
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with ${res.status} ${res.statusText}`);
  }

  return data;
}
