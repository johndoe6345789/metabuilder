import { describe, expect, it, vi } from 'vitest'

import { sendToMonitoring } from './send-to-monitoring'
import type { ErrorReport } from './types'

const report: ErrorReport = {
  id: 'err_1',
  message: 'boom',
  statusCode: 500,
  category: 'server',
  context: {},
  timestamp: new Date('2026-01-01'),
  isDevelopment: false,
  isRetryable: true,
}

describe('sendToMonitoring', () => {
  it('logs a structured, parseable record to the error console', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    sendToMonitoring(report)

    expect(spy).toHaveBeenCalledOnce()
    const [tag, payload] = spy.mock.calls[0] as [string, string]
    expect(tag).toBe('[monitoring]')
    expect(JSON.parse(payload)).toMatchObject({
      id: 'err_1',
      message: 'boom',
      category: 'server',
      statusCode: 500,
      isRetryable: true,
    })
    spy.mockRestore()
  })
})
