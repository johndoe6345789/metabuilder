/**
 * AWS Signature Version 4 for the object store, dependency-free.
 *
 * The store accepts SigV4 only (path-style, region us-east-1). This is the
 * pure part -- no I/O, no environment -- so it can be checked against the
 * worked examples in AWS's documentation.
 */

import 'server-only'

import { createHash, createHmac } from 'node:crypto'

export interface SignInput {
  method: string
  /** Absolute URL; its path must already be percent-encoded as sent. */
  url: string
  /** Extra headers to sign (content-type etc.); names are case-insensitive. */
  headers?: Record<string, string>
  body?: Uint8Array | string
  accessKey: string
  secretKey: string
  region: string
  service?: string
  now?: Date
}

const sha256 = (data: Uint8Array | string): string =>
  createHash('sha256').update(data).digest('hex')

const hmac = (key: Uint8Array | string, data: string): Buffer =>
  createHmac('sha256', key).update(data).digest()

/** RFC 3986 unreserved set, the encoding SigV4 requires. */
export const uriEncode = (value: string): string =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`
  )

/** Sorted, re-encoded query string in the form SigV4 canonicalises. */
export function canonicalQuery(params: URLSearchParams): string {
  return [...params.entries()]
    .map(([k, v]) => [uriEncode(k), uriEncode(v)] as const)
    .sort(([ak, av], [bk, bv]) => {
      if (ak !== bk) return ak < bk ? -1 : 1
      return av < bv ? -1 : av > bv ? 1 : 0
    })
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
}

const amzDate = (now: Date): string =>
  now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/**
 * Returns the headers to send: every input header plus host,
 * x-amz-date, x-amz-content-sha256 and Authorization.
 */
export function signRequest(input: SignInput): Record<string, string> {
  const url = new URL(input.url)
  const stamp = amzDate(input.now ?? new Date())
  const day = stamp.slice(0, 8)
  const service = input.service ?? 's3'
  const payloadHash = sha256(input.body ?? '')

  const headers: Record<string, string> = {}
  for (const [k, v] of Object.entries(input.headers ?? {})) {
    headers[k.toLowerCase()] = v.trim().replace(/\s+/g, ' ')
  }
  headers.host = url.host
  headers['x-amz-content-sha256'] = payloadHash
  headers['x-amz-date'] = stamp

  const names = Object.keys(headers).sort()
  const signedHeaders = names.join(';')
  const canonical = [
    input.method.toUpperCase(),
    url.pathname,
    canonicalQuery(url.searchParams),
    ...names.map(n => `${n}:${headers[n]}`),
    '',
    signedHeaders,
    payloadHash,
  ].join('\n')

  const scope = `${day}/${input.region}/${service}/aws4_request`
  const toSign = ['AWS4-HMAC-SHA256', stamp, scope, sha256(canonical)].join(
    '\n'
  )
  let key = hmac(`AWS4${input.secretKey}`, day)
  for (const part of [input.region, service, 'aws4_request']) {
    key = hmac(key, part)
  }
  const signature = createHmac('sha256', key).update(toSign).digest('hex')

  const { host: _host, ...sent } = headers
  return {
    ...sent,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${input.accessKey}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  }
}
