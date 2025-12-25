import { describe, it, expect } from 'vitest'
import { summarizeWorkflowLogs } from './analyze-workflow-logs'

describe('summarizeWorkflowLogs', () => {
  it('extracts error signals and job error hints', () => {
    const logs = [
      '=================================================',
      'WORKFLOW RUN: Build',
      'RUN ID: 123',
      '=================================================',
      '',
      'JOB: test',
      'STATUS: completed',
      'CONCLUSION: failure',
      'Error: Something bad happened',
      'npm ERR! code ELIFECYCLE',
      '',
      'JOB: lint',
      'STATUS: completed',
      'CONCLUSION: success',
      'All good here',
    ].join('\n')

    const summary = summarizeWorkflowLogs(logs)

    expect(summary.totalJobs).toBe(2)
    expect(summary.jobsWithErrors).toBe(1)
    expect(summary.errorSignals).toEqual(
      expect.arrayContaining(['Error: Something bad happened', 'npm ERR! code ELIFECYCLE'])
    )
    expect(summary.jobErrors[0]).toEqual({
      job: 'test',
      error: 'Error: Something bad happened',
    })
  })

  it('returns empty signals when no errors are present', () => {
    const logs = [
      'JOB: build',
      'STATUS: completed',
      '0 errors',
      'All tasks completed successfully',
    ].join('\n')

    const summary = summarizeWorkflowLogs(logs)

    expect(summary.totalJobs).toBe(1)
    expect(summary.jobsWithErrors).toBe(0)
    expect(summary.errorSignals).toEqual([])
    expect(summary.jobErrors).toEqual([])
  })
})
