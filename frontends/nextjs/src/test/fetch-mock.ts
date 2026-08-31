/**
 * Answering DBAL calls in a component test.
 *
 * Components fetch through absolute-ish paths (/api/dbal/...), so routes are
 * matched by substring rather than by exact URL, and an unmatched request is
 * a test failure rather than a silent empty response -- a component that
 * quietly renders nothing because its fetch 404'd is the failure mode this
 * exists to prevent.
 */

import { vi } from 'vitest'

export type Route = { match: string; body: unknown; status?: number }

export function installFetch(routes: Route[]) {
  const calls: string[] = []

  const impl = vi.fn((input: RequestInfo | URL) => {
    // A Request stringifies to [object Request]; take its url instead.
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    calls.push(url)

    const route = routes.find(r => url.includes(r.match))
    if (route === undefined) {
      return Promise.reject(new Error(`Unmocked fetch: ${url}`))
    }

    // Real Response methods return promises -- callers may chain .catch()
    // off res.json() directly rather than always awaiting it first.
    const response = {
      ok: (route.status ?? 200) < 400,
      status: route.status ?? 200,
      json: () => Promise.resolve(route.body),
      text: () => Promise.resolve(JSON.stringify(route.body)),
    }
    return Promise.resolve(response as unknown as Response)
  })

  vi.stubGlobal('fetch', impl)
  return { calls, impl }
}

/** DBAL list responses are wrapped; this is the shape callers unwrap. */
export const listBody = (data: unknown[]) => ({ data })
