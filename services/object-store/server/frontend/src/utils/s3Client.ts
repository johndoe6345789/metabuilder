import type { S3Credentials } from '@/types';

// Held in memory only for the lifetime of this tab. Secret keys must never
// be written to localStorage/sessionStorage/cookies in plaintext: Web
// Storage is readable by any script on the origin (XSS), browser
// extensions, and gets swept into disk-based session backups/crash
// reports. A hard page reload clears this, requiring re-login.
let currentCredentials: S3Credentials | null = null;

/** @brief Read in-memory S3 credentials. */
export function getCredentials():
  S3Credentials | null {
  return currentCredentials;
}

/** @brief Save S3 credentials (in memory only, for this tab's lifetime). */
export function saveCredentials(
  creds: S3Credentials,
): void {
  currentCredentials = creds;
}

/** @brief Clear stored credentials. */
export function clearCredentials(): void {
  currentCredentials = null;
}

/** @brief Build auth headers for S3 API. */
function authHeaders(): HeadersInit {
  const creds = getCredentials();
  if (!creds) return {};
  return {
    Authorization:
      `AWS ${creds.accessKey}:${creds.secretKey}`,
  };
}

/**
 * @brief Fetch wrapper with S3 auth headers.
 * @param path - API path (e.g. /api/s3/buckets).
 * @param init - Extra fetch options.
 * @returns Fetch Response.
 */
export async function s3Fetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = {
    ...authHeaders(),
    ...init?.headers,
  };
  return fetch(path, { ...init, headers });
}

/**
 * @brief Fetch S3 endpoint and return XML text.
 * @param path - API path returning XML.
 * @returns Raw XML string.
 */
export async function s3FetchXml(
  path: string,
): Promise<string> {
  const res = await s3Fetch(path);
  if (!res.ok) {
    throw new Error(
      `S3 request failed: ${res.status}`,
    );
  }
  return res.text();
}
