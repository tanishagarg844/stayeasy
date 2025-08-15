export const API_BASE = "https://staging.travelyatra.com/api/unsecure/dummy/hotels";

function generateTraceId() {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function postJSON(url, body, destinationId = null) {
  const payload = {
    ...body,
    traceId: generateTraceId()
  };

  let fullUrl = url;
  if (destinationId) {
    const separator = url.includes('?') ? '&' : '?';
    fullUrl = `${url}${separator}destinationId=${encodeURIComponent(destinationId)}`;
  }

  const res = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": "pml",
    },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`HTTP ${res.status}: ${errorData.detail || errorData.title || await res.text()}`);
  }
  
  return res.json();
}
