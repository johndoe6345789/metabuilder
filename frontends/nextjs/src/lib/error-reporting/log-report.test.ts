import { afterEach, describe, expect, it, vi } from 'vitest'

import { logReport } from './log-report'
import type { ErrorReport } from './types'

const report: ErrorReport = {
  id: 'err_1',
  message: 'boom',
  category: 'server',
  context: {},
  timestamp: new Date(),
  isDevelopment: false,
  isRetryable: true,
}

describe('logReport', () => {
  const original = process.env.NODE_ENV

  afterEach(() => {
    vi.restoreAllMocks()
    process.env.NODE_ENV = original
  })

  it('logs full detail to the console in development', () => {
    process.env.NODE_ENV = 'development'
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logReport(report)
    expect(spy).toHaveBeenCalledWith(
      '[ErrorReporting]',
      expect.objectContaining({ id: 'err_1' })
    )
  })

  it('sends to monitoring in production instead', () => {
    process.env.NODE_ENV = 'production'
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logReport(report)
    expect(spy).toHaveBeenCalledWith('[monitoring]', expect.any(String))
  })

  it('stays quiet in test/other environments', () => {
    process.env.NODE_ENV = 'test'
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logReport(report)
    expect(spy).not.toHaveBeenCalled()
  })
})
