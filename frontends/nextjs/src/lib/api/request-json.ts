export type ApiError = {
  error?: string
  details?: string
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_DBAL_API_KEY
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-dbal-api-key': apiKey } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let payload: ApiError | null = null
    try {
      payload = (await response.json()) as ApiError
    } catch {
      payload = null
    }

    const message = payload?.error || `Request failed (${response.status})`
    throw new Error(message)
  }

  return (await response.json()) as T
}
