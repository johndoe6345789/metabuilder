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
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url: String(url),
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      return {
        ok,
        status: ok ? 200 : 500,
        json: async () => body,
        text: async () => JSON.stringify(body),
      } as Response
    })
  )
  return calls
}
