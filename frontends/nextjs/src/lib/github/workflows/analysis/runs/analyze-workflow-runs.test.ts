import { describe, it, expect } from 'vitest'
import {
  analyzeWorkflowRuns,
  parseWorkflowRuns,
  summarizeWorkflowRuns,
} from './analyze-workflow-runs'

describe('parseWorkflowRuns', () => {
  it('normalizes unknown entries and ignores items without numeric IDs', () => {
    const runs = [
      {
        id: 1,
        name: 'Build',
        status: 'completed',
        conclusion: 'success',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:10:00Z',
        head_branch: 'main',
        event: 'push',
      },
      { id: 'not-a-number' },
      {
        id: 2,
        name: '',
        status: '',
        conclusion: 'failure',
        created_at: '',
        updated_at: '',
        head_branch: '',
        event: '',
      },
    ]

    const parsed = parseWorkflowRuns(runs)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].name).toBe('Build')
    expect(parsed[1]).toEqual({
      id: 2,
      name: 'Unknown workflow',
      status: 'unknown',
      conclusion: 'failure',
      created_at: '',
      updated_at: '',
      head_branch: 'unknown',
      event: 'unknown',
    })
  })
})

describe('summarizeWorkflowRuns', () => {
  it('summarizes totals, success rate, and failure hotspots', () => {
    const runs = [
      {
        id: 1,
        name: 'Build',
        status: 'completed',
        conclusion: 'success',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:10:00Z',
        head_branch: 'main',
        event: 'push',
      },
      {
        id: 2,
        name: 'Build',
        status: 'completed',
        conclusion: 'failure',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:05:00Z',
        head_branch: 'feature-ci',
        event: 'pull_request',
      },
      {
        id: 3,
        name: 'Lint',
        status: 'in_progress',
        conclusion: null,
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:01:00Z',
        head_branch: 'main',
        event: 'push',
      },
    ]

    const summary = summarizeWorkflowRuns(runs)

    expect(summary.total).toBe(3)
    expect(summary.completed).toBe(2)
    expect(summary.successful).toBe(1)
    expect(summary.failed).toBe(1)
    expect(summary.inProgress).toBe(1)
    expect(summary.successRate).toBe(50)
    expect(summary.mostRecent?.id).toBe(3)
    expect(summary.topFailingWorkflows[0]).toEqual({ name: 'Build', failures: 1 })
    expect(summary.failingBranches[0]).toEqual({ branch: 'feature-ci', failures: 1 })
    expect(summary.failingEvents[0]).toEqual({ event: 'pull_request', failures: 1 })
  })

  it('handles empty input', () => {
    const summary = summarizeWorkflowRuns([])

    expect(summary.total).toBe(0)
    expect(summary.completed).toBe(0)
    expect(summary.successRate).toBe(0)
    expect(summary.recentRuns).toEqual([])
    expect(summary.mostRecent).toBeNull()
  })
})

describe('analyzeWorkflowRuns', () => {
  it('returns parsed summary and formatted output', () => {
    const result = analyzeWorkflowRuns([
      {
        id: 7,
        name: 'Deploy',
        status: 'completed',
        conclusion: 'success',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:05:00Z',
        head_branch: 'main',
        event: 'workflow_dispatch',
      },
    ])

    expect(result.summary.total).toBe(1)
    expect(result.formatted).toContain('Workflow Run Analysis')
    expect(result.formatted).toContain('Deploy')
  })
})
