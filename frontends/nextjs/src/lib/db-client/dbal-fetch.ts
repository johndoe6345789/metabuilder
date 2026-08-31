export async function dbalFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`DBAL ${res.status}: ${body}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** Unwrap C++ DBAL envelope: { data: ..., success: bool } */
export function unwrap<T>(raw: unknown): T {
  if (
    raw !== null &&
    typeof raw === 'object' &&
    'success' in (raw as Record<string, unknown>)
  ) {
    return (raw as Record<string, unknown>).data as T
  }
  return raw as T
}
