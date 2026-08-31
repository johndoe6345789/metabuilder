import 'server-only'
import { headers } from 'next/headers'

const INTERNAL_APP_URL =
  process.env.METABUILDER_INTERNAL_URL ?? 'http://127.0.0.1:3000/app'

/**
 * Call this application's authenticated API from a Server Component.
 * Node's fetch does not accept relative URLs, and it does not forward the
 * incoming session cookie automatically.
 */
export async function entityApiFetch(
  path: string,
  init: RequestInit
): Promise<Response> {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get('cookie')
  const outgoingHeaders = new Headers(init.headers)
  if (cookie !== null) {
    outgoingHeaders.set('cookie', cookie)
  }

  return fetch(`${INTERNAL_APP_URL}${path}`, {
    ...init,
    headers: outgoingHeaders,
  })
}
