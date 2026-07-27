export async function readJsonResponse(res) {
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const snippet = text.trim().replace(/\s+/g, " ").slice(0, 200);
      throw new Error(
        `Expected JSON but received ${res.status} ${res.statusText}${snippet ? `: ${snippet}` : ""}`
      );
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with ${res.status} ${res.statusText}`);
  }

  return data;
}
