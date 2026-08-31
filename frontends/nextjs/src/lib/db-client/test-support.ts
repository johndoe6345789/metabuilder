import { vi } from 'vitest'

export interface FetchCall {
  url: string
  method: string
  body?: string
}

/** Stubs global fetch to answer `body` (or a 500 when `ok` is false) and
 *  records every call it received, for asserting URL/method/body shape. */
export function mockFetch(body: unknown, ok = true): FetchCall[] {
  const calls: FetchCall[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      // Real Response methods return promises -- callers may chain
      // .catch() off res.json() directly rather than always awaiting it.
      const response = {
        ok,
        status: ok ? 200 : 500,
        json: () => Promise.resolve(body),
        text: () => Promise.resolve(JSON.stringify(body)),
      }
      return Promise.resolve(response as unknown as Response)
    })
  )
  return calls
}
