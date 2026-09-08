import { describe, expect, it } from 'vitest'

import { storeErrorMessage } from './store-error'

/**
 * With no object store running, the Files tab said "fetch failed" -- the
 * bare text of Node's TypeError -- and nothing about what had failed to
 * be fetched or what to do about it.
 */
describe('storeErrorMessage', () => {
  it('names the store when the network call never connected', () => {
    const error = new TypeError('fetch failed', { cause: new Error('ECONN') })
    expect(storeErrorMessage(error, 'listing')).toBe(
      'Could not reach the file store at http://localhost:9000 -- is ' +
        'OBJECT_STORE_URL right and the store running?'
    )
  })

  it('names a timeout the same way', () => {
    const error = new DOMException('The operation was aborted', 'TimeoutError')
    expect(storeErrorMessage(error, 'listing')).toContain(
      'Could not reach the file store'
    )
  })

  it("passes the store's own refusal through", () => {
    expect(storeErrorMessage(new Error('HTTP 403'), 'listing')).toBe(
      'HTTP 403'
    )
  })

  it('falls back to what was being done for a non-Error', () => {
    expect(storeErrorMessage('boom', 'upload')).toBe('upload failed')
  })
})
