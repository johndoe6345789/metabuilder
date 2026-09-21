import { describe, expect, it } from 'vitest'

import { signRequest, uriEncode } from './sigv4'

/** Worked examples from AWS's "Signature Calculations for the Authorization
 * Header" documentation (S3, us-east-1, 2013-05-24T00:00:00Z). */
const base = {
  accessKey: 'AKIAIOSFODNN7EXAMPLE',
  secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  region: 'us-east-1',
  now: new Date('2013-05-24T00:00:00Z'),
}
const host = 'https://examplebucket.s3.amazonaws.com'
const sig = (h: Record<string, string>): string =>
  /Signature=([0-9a-f]+)/.exec(h.Authorization ?? '')?.[1] ?? ''

describe('signRequest (AWS documentation vectors)', () => {
  it('GET Object with a Range header', () => {
    const h = signRequest({
      ...base,
      method: 'GET',
      url: `${host}/test.txt`,
      headers: { Range: 'bytes=0-9' },
    })
    expect(sig(h)).toBe(
      'f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41'
    )
    expect(h.Authorization).toContain(
      'Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request'
    )
    expect(h.Authorization).toContain(
      'SignedHeaders=host;range;x-amz-content-sha256;x-amz-date'
    )
  })

  it('PUT Object with a body and an encoded key', () => {
    const h = signRequest({
      ...base,
      method: 'PUT',
      url: `${host}/test%24file.text`,
      headers: {
        Date: 'Fri, 24 May 2013 00:00:00 GMT',
        'x-amz-storage-class': 'REDUCED_REDUNDANCY',
      },
      body: 'Welcome to Amazon S3.',
    })
    expect(sig(h)).toBe(
      '98ad721746da40c64f1a55b78f14c238d841ea1380cd77a1b5971af0ece108bd'
    )
  })

  it('GET Bucket lifecycle (empty-valued query parameter)', () => {
    const h = signRequest({ ...base, method: 'GET', url: `${host}/?lifecycle` })
    expect(sig(h)).toBe(
      'fea454ca298b7da1c68078a5d1bdbfbbe0d65c699e0f91ac7a200a0136783543'
    )
  })

  it('GET Bucket (list objects) with sorted query parameters', () => {
    const h = signRequest({
      ...base,
      method: 'GET',
      url: `${host}/?prefix=J&max-keys=2`,
    })
    expect(sig(h)).toBe(
      '34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69dc6f7'
    )
  })

  it('sends the payload hash and date but leaves Host to the transport', () => {
    const h = signRequest({ ...base, method: 'GET', url: `${host}/x` })
    expect(h['x-amz-date']).toBe('20130524T000000Z')
    expect(h['x-amz-content-sha256']).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    )
    expect(h).not.toHaveProperty('host')
  })
})

describe('uriEncode', () => {
  it('encodes everything outside the RFC 3986 unreserved set', () => {
    expect(uriEncode('a b/c$d!*()\'~-_.')).toBe(
      'a%20b%2Fc%24d%21%2A%28%29%27~-_.'
    )
  })
})
