/**
 * Microsoft Graph JSON Batch utility.
 *
 * Chunks an arbitrary number of sub-requests into groups of ≤20
 * (Graph hard limit), sends each group as a single POST /$batch,
 * and handles per-item 429 responses by waiting for Retry-After
 * and retrying that chunk.
 */

const BATCH_URL = 'https://graph.microsoft.com/v1.0/$batch';
const MAX_BATCH_SIZE = 20;

export interface BatchRequest {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  url: string; // relative, e.g. "/me/messages/ABC"
  body?: unknown;
  headers?: Record<string, string>;
}

export interface BatchResponse {
  id: string;
  status: number;
  body: unknown;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function sendChunk(
  accessToken: string,
  requests: BatchRequest[],
  attempt = 0,
): Promise<BatchResponse[]> {
  const res = await fetch(BATCH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: requests.map((r) => ({
        id: r.id,
        method: r.method,
        url: r.url,
        ...(r.body ? { body: r.body, headers: { 'Content-Type': 'application/json', ...r.headers } } : {}),
      })),
    }),
  });

  if (!res.ok) {
    // Outer 429 on the batch call itself
    if (res.status === 429 && attempt < 3) {
      const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10);
      await sleep((isNaN(retryAfter) ? 2 : retryAfter) * 1000);
      return sendChunk(accessToken, requests, attempt + 1);
    }
    throw new Error(`Batch request failed: ${res.status}`);
  }

  const json = await res.json();
  const responses: BatchResponse[] = json.responses ?? [];

  // Check for per-item 429s — retry just the throttled items
  const throttled = responses.filter((r) => r.status === 429);
  if (throttled.length > 0 && attempt < 3) {
    // Find the max Retry-After across throttled items
    let waitSec = Math.pow(2, attempt) * 1; // 1s, 2s, 4s fallback
    for (const t of throttled) {
      const headers = (t.body as Record<string, unknown>)?.['headers'] as Record<string, string> | undefined;
      const ra = parseInt(headers?.['Retry-After'] ?? '', 10);
      if (!isNaN(ra)) waitSec = Math.max(waitSec, ra);
    }
    await sleep(waitSec * 1000);

    const throttledIds = new Set(throttled.map((r) => r.id));
    const retryRequests = requests.filter((r) => throttledIds.has(r.id));
    const retried = await sendChunk(accessToken, retryRequests, attempt + 1);

    // Merge: replace throttled responses with retried ones
    const retryMap = new Map(retried.map((r) => [r.id, r]));
    return responses.map((r) => retryMap.get(r.id) ?? r);
  }

  return responses;
}

/**
 * Execute a list of Graph sub-requests using the $batch endpoint.
 * Returns a Map<requestId, BatchResponse>.
 */
export async function graphBatch(
  accessToken: string,
  requests: BatchRequest[],
): Promise<Map<string, BatchResponse>> {
  const chunks = chunk(requests, MAX_BATCH_SIZE);
  const allResponses: BatchResponse[] = [];

  // Send chunks sequentially to avoid hammering the API
  for (const c of chunks) {
    const responses = await sendChunk(accessToken, c);
    allResponses.push(...responses);
  }

  return new Map(allResponses.map((r) => [r.id, r]));
}
