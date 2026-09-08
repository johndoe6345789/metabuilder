import { describe, expect, it } from 'vitest'

import { neverConnected, unreachableMessage } from './never-connected'

/**
 * `error instanceof Error ? error.message : fallback` shows the raw text
 * for the one failure that happens most -- a service that is not running
 * -- and never reaches the friendly fallback, which is how "Failed to
 * fetch" reached a founder's screen.
 */
describe('neverConnected', () => {
  it.each([
    'Failed to fetch',
    'fetch failed',
    'NetworkError when attempting to fetch resource.',
    'Load failed',
  ])('recognises %p as nothing listening', message => {
    expect(neverConnected(new TypeError(message))).toBe(true)
  })

  it.each(['TimeoutError', 'AbortError'])('recognises a %s', name => {
    expect(neverConnected(new DOMException('gone', name))).toBe(true)
  })

  it.each([
    new Error('HTTP 500'),
    new TypeError('x is not a function'),
    new DOMException('nope', 'SyntaxError'),
    'a string',
    null,
  ])('leaves %p to the caller', error => {
    expect(neverConnected(error)).toBe(false)
  })
})

describe('unreachableMessage', () => {
  it('names the service and where it was looked for', () => {
    expect(unreachableMessage('the media service', 'http://x:8090')).toBe(
      'Could not reach the media service at http://x:8090. Is it running?'
    )
  })
})
