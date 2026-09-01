import { describe, expect, it } from 'vitest'
import { parseWorkflowRunLogsOptions } from './parse-workflow-run-logs-options'

describe('parseWorkflowRunLogsOptions', () => {
  it('defaults everything when no params are given', () => {
    expect(parseWorkflowRunLogsOptions('')).toEqual({
      tailLines: undefined,
      failedOnly: false,
      runName: undefined,
      includeLogs: false,
      jobLimit: undefined,
    })
  })

  it('parses every field from a query string', () => {
    const result = parseWorkflowRunLogsOptions(
      'tailLines=50&failedOnly=true&runName=build&includeLogs=true&jobLimit=5'
    )
    expect(result).toEqual({
      tailLines: 50,
      failedOnly: true,
      runName: 'build',
      includeLogs: true,
      jobLimit: 5,
    })
  })

  it('accepts URLSearchParams directly', () => {
    const params = new URLSearchParams({ runName: 'deploy' })
    expect(parseWorkflowRunLogsOptions(params).runName).toBe('deploy')
  })

  it('treats an empty runName as absent', () => {
    expect(
      parseWorkflowRunLogsOptions('runName=').runName
    ).toBeUndefined()
  })

  it('treats any non-"true" value as false for the boolean flags', () => {
    const result = parseWorkflowRunLogsOptions('failedOnly=yes&includeLogs=1')
    expect(result.failedOnly).toBe(false)
    expect(result.includeLogs).toBe(false)
  })
})
