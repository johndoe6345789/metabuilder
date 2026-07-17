import type { S3Credentials } from '@/types';

const STORAGE_KEY = 's3_credentials';

/** @brief Read stored S3 credentials. */
export function getCredentials():
  S3Credentials | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as S3Credentials;
}

/** @brief Save S3 credentials. */
export function saveCredentials(
  creds: S3Credentials,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(creds),
  );
}

/** @brief Clear stored credentials. */
export function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
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
