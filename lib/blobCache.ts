import { put, head, del } from '@vercel/blob';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const READ_TIMEOUT_MS = 2_000; // 2 second timeout for cache reads

function cacheKey(key: string): string {
  return `ical-cache/${key}.ics`;
}

export async function getCachedIcs(key: string): Promise<string | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), READ_TIMEOUT_MS)
  );

  const fetchPromise = (async (): Promise<string | null> => {
    try {
      const blob = await head(cacheKey(key));
      if (!blob) return null;

      const uploadedAt = new Date(blob.uploadedAt).getTime();
      if (Date.now() - uploadedAt > CACHE_TTL_MS) {
        // Fire-and-forget: delete expired blob to prevent unbounded storage growth.
        del(cacheKey(key)).catch(() => {});
        return null;
      }

      const response = await fetch(blob.url);
      if (!response.ok) return null;
      return await response.text();
    } catch (err) {
      console.log(JSON.stringify({ event: 'blob_cache_read_error', error: err instanceof Error ? err.message : String(err) }));
      return null;
    }
  })();

  return Promise.race([fetchPromise, timeoutPromise]);
}

export async function setCachedIcs(key: string, ics: string): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  try {
    await put(cacheKey(key), ics, {
      access: 'public',
      contentType: 'text/calendar; charset=utf-8',
      addRandomSuffix: false,
    });
  } catch (err) {
    console.log(JSON.stringify({ event: 'blob_cache_write_error', error: err instanceof Error ? err.message : String(err) }));
  }
}
