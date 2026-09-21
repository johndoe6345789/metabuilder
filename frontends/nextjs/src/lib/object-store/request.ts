/** One SigV4-signed request to the store (path-style: /{bucket}/{key}). */

import 'server-only'

import { signRequest, uriEncode } from './sigv4'
import { getStoreConfig } from './store-config'

export interface StoreRequest {
  method: 'GET' | 'PUT' | 'DELETE'
  bucket: string
  key?: string
  query?: Record<string, string>
  body?: BodyInit
  contentType?: string
  timeoutMs: number
}

/** Buffers any BodyInit: SigV4 needs the payload hash before sending. */
type Bytes = Uint8Array<ArrayBuffer>

async function toBytes(body: BodyInit | undefined): Promise<Bytes> {
  if (body === undefined) return new Uint8Array(0)
  if (typeof body === 'string') return new TextEncoder().encode(body)
  if (body instanceof ArrayBuffer) return new Uint8Array(body)
  if (ArrayBuffer.isView(body)) {
    // slice() copies into a plain ArrayBuffer-backed view.
    return new Uint8Array(body.buffer, body.byteOffset, body.byteLength).slice()
  }
  return new Uint8Array(await new Response(body).arrayBuffer())
}

export const objectPath = (bucket: string, key?: string): string =>
  `/${uriEncode(bucket)}` +
  (key === undefined ? '' : `/${key.split('/').map(uriEncode).join('/')}`)

export async function storeFetch(req: StoreRequest): Promise<Response> {
  const cfg = getStoreConfig()
  const url = new URL(cfg.endpoint + objectPath(req.bucket, req.key))
  // Built by hand: URLSearchParams would send spaces as '+', not %20.
  url.search = Object.entries(req.query ?? {})
    .map(([k, v]) => `${uriEncode(k)}=${uriEncode(v)}`)
    .join('&')
  const bytes = await toBytes(req.body)
  const headers = signRequest({
    method: req.method,
    url: url.toString(),
    headers:
      req.contentType === undefined ? {} : { 'content-type': req.contentType },
    body: bytes,
    accessKey: cfg.accessKey,
    secretKey: cfg.secretKey,
    region: cfg.region,
  })
  return fetch(url, {
    method: req.method,
    headers,
    body: req.method === 'PUT' && req.body !== undefined ? bytes : undefined,
    signal: AbortSignal.timeout(req.timeoutMs),
  })
}
