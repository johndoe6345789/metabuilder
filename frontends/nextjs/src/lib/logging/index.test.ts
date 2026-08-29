import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { apiError } from './index'
import type * as Logging from './index'

type Logger = typeof Logging.logger

/** The development branch is chosen at import time, so each mode is a
 *  fresh module registry. */
const load = async (nodeEnv: string): Promise<Logger> => {
  vi.resetModules()
  vi.stubEnv('NODE_ENV', nodeEnv)
  return (await import('./index')).logger
}

const spies = () => ({
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
})

beforeEach(() => vi.clearAllMocks())
afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('apiError', () => {
  it('reads the message off an Error', () => {
    expect(apiError(new Error('boom'))).toBe('boom')
  })

  it('passes a string through', () => {
    expect(apiError('boom')).toBe('boom')
  })

  it.each([null, undefined, 42, {}])('describes %p generically', value => {
    expect(apiError(value)).toBe('Unknown error')
  })

  // The whole point of this helper: a stack trace never reaches a caller.
  it('never returns the stack', () => {
    const error = new Error('boom')
    expect(apiError(error)).not.toContain('at ')
  })
})

describe('formatting', () => {
  it('stamps the level and an ISO timestamp', async () => {
    const console = spies()
    const logger = await load('production')
    logger.info('hello')
    expect(console.log.mock.calls[0]?.[0]).toMatch(
      /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\] INFO: hello$/
    )
  })

  it('appends context as JSON', async () => {
    const console = spies()
    const logger = await load('production')
    logger.warn('careful', { id: 7 })
    expect(console.warn.mock.calls[0]?.[0]).toContain('{"id":7}')
  })

  it('adds no trailing space when there is no context', async () => {
    const console = spies()
    const logger = await load('production')
    logger.info('plain')
    expect(console.log.mock.calls[0]?.[0]).toMatch(/plain$/)
  })
})

describe('levels', () => {
  it('says nothing at debug level in production', async () => {
    const console = spies()
    const logger = await load('production')
    logger.debug('noise')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('says it in development', async () => {
    const console = spies()
    const logger = await load('development')
    logger.debug('noise')
    expect(console.log).toHaveBeenCalledOnce()
  })

  it('always logs info and warn', async () => {
    const console = spies()
    const logger = await load('production')
    logger.info('a')
    logger.warn('b')
    expect(console.log).toHaveBeenCalledOnce()
    expect(console.warn).toHaveBeenCalledOnce()
  })
})

describe('error', () => {
  it('folds the error message into the context', async () => {
    const console = spies()
    const logger = await load('production')
    logger.error('failed', new Error('boom'), { id: 7 })
    expect(console.error.mock.calls[0]?.[0]).toContain('"error":"boom"')
    expect(console.error.mock.calls[0]?.[0]).toContain('"id":7')
  })

  it('logs without an error at all', async () => {
    const console = spies()
    const logger = await load('production')
    logger.error('failed')
    expect(console.error.mock.calls[0]?.[0]).toContain('ERROR: failed')
  })

  // The reason this module exists: a production log line must not carry
  // a stack trace, which names paths and internal structure.
  it('does not print the stack in production', async () => {
    const console = spies()
    const logger = await load('production')
    logger.error('failed', new Error('boom'))
    expect(console.error).toHaveBeenCalledOnce()
  })

  it('prints the stack in development', async () => {
    const console = spies()
    const logger = await load('development')
    logger.error('failed', new Error('boom'))
    expect(console.error).toHaveBeenCalledTimes(2)
    expect(String(console.error.mock.calls[1]?.[0])).toContain('at ')
  })

  it('describes a non-Error failure generically', async () => {
    const console = spies()
    const logger = await load('production')
    logger.error('failed', { weird: true })
    expect(console.error.mock.calls[0]?.[0]).toContain('"Unknown error"')
  })
})
