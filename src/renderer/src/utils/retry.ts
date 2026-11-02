/**
 * Generic retry wrapper with exponential backoff.
 * Reads the `Retry-After` header (seconds) from Graph 429 responses when available.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;

      // Try to read Retry-After from Graph SDK error
      let waitMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s …
      const retryAfter = extractRetryAfter(err);
      if (retryAfter !== null) waitMs = retryAfter * 1000;

      await sleep(waitMs);
    }
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function extractRetryAfter(err: unknown): number | null {
  if (!err || typeof err !== 'object') return null;
  // Graph SDK wraps response in err.body or err.statusCode
  const e = err as Record<string, unknown>;
  if (e['statusCode'] === 429 || e['status'] === 429) {
    const headers = e['headers'] as Record<string, string> | undefined;
    const value = headers?.['Retry-After'] ?? headers?.['retry-after'];
    const parsed = value ? parseInt(value, 10) : NaN;
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}
