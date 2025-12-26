import { describe, expect, it } from 'vitest'
import { parseWorkflowRunLogsOptions } from './parse-workflow-run-logs-options'

describe('parseWorkflowRunLogsOptions', () => {
  it('defaults when params are empty', () => {
    const params = new URLSearchParams()
    const result = parseWorkflowRunLogsOptions(params)

    expect(result).toEqual({
      runName: 'Workflow Run',
      includeLogs: true,
      jobLimit: undefined,
    })
  })

  it('parses includeLogs false values', () => {
    const params = new URLSearchParams({
      includeLogs: 'false',
    })
    const result = parseWorkflowRunLogsOptions(params)

    expect(result.includeLogs).toBe(false)
  })

  it('clamps jobLimit within bounds', () => {
    const params = new URLSearchParams({
      jobLimit: '250',
    })
    const result = parseWorkflowRunLogsOptions(params)

    expect(result.jobLimit).toBe(100)
  })

  it('trims runName and preserves includeLogs true', () => {
    const params = new URLSearchParams({
      runName: '  Deploy Pipeline  ',
      includeLogs: '1',
      jobLimit: '5',
    })
    const result = parseWorkflowRunLogsOptions(params)

    expect(result).toEqual({
      runName: 'Deploy Pipeline',
      includeLogs: true,
      jobLimit: 5,
    })
  })
})
