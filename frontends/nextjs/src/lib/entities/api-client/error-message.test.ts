import { describe, expect, it } from 'vitest'

import { extractErrorMessage } from './error-message'

const response = (status: number, json: unknown) =>
  ({ status, json: () => Promise.resolve(json) }) as Response

const brokenResponse = (status: number) =>
  ({
    status,
    json: () => Promise.reject(new Error('not json')),
  }) as unknown as Response

describe('extractErrorMessage', () => {
  it('uses the body error field when present', async () => {
    expect(await extractErrorMessage(response(404, { error: 'Not found' }))).toBe(
      'Not found'
    )
  })

  it('falls back to "HTTP {status}" when the body has no error field', async () => {
    expect(await extractErrorMessage(response(500, {}))).toBe('HTTP 500')
  })

  it('falls back to "Unknown error" when the body is not JSON', async () => {
    expect(await extractErrorMessage(brokenResponse(502))).toBe('Unknown error')
  })
})
