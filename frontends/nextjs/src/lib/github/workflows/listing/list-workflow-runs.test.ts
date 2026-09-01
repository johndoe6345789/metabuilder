import { describe, expect, it, vi } from 'vitest'
import { listWorkflowRuns } from './list-workflow-runs'

function client(runs: unknown[]) {
  return {
    rest: {
      actions: {
        listWorkflowRunsForRepo: vi
          .fn()
          .mockResolvedValue({ data: { workflow_runs: runs } }),
      },
    },
  }
}

describe('listWorkflowRuns', () => {
  it('throws when no client is provided', async () => {
    await expect(
      listWorkflowRuns({ client: null, owner: 'acme', repo: 'widgets' })
    ).rejects.toThrow('GitHub client is required')
  })

  it('throws when the client is not an object', async () => {
    await expect(
      listWorkflowRuns({ client: 'nope', owner: 'acme', repo: 'widgets' })
    ).rejects.toThrow('GitHub client is required')
  })

  it('maps each run, preferring name over display_title', async () => {
    const c = client([
      {
        id: 1,
        name: 'CI',
        display_title: 'ignored',
        status: 'completed',
        conclusion: 'success',
        created_at: '2026-01-01T00:00:00Z',
      },
    ])
    const result = await listWorkflowRuns({
      client: c,
      owner: 'acme',
      repo: 'widgets',
    })
    expect(result).toEqual([
      {
        id: 1,
        name: 'CI',
        status: 'completed',
        conclusion: 'success',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ])
  })

  it('falls back to display_title when name is absent', async () => {
    const c = client([
      {
        id: 1,
        display_title: 'Deploy',
        status: 'completed',
        created_at: '2026-01-01T00:00:00Z',
      },
    ])
    const result = await listWorkflowRuns({
      client: c,
      owner: 'acme',
      repo: 'widgets',
    })
    expect(result[0].name).toBe('Deploy')
  })

  it('falls back to "Workflow Run" when both are absent', async () => {
    const c = client([
      { id: 1, status: 'completed', created_at: '2026-01-01T00:00:00Z' },
    ])
    const result = await listWorkflowRuns({
      client: c,
      owner: 'acme',
      repo: 'widgets',
    })
    expect(result[0].name).toBe('Workflow Run')
  })

  it('passes perPage through as per_page', async () => {
    const c = client([])
    await listWorkflowRuns({
      client: c,
      owner: 'acme',
      repo: 'widgets',
      perPage: 50,
    })
    expect(c.rest.actions.listWorkflowRunsForRepo).toHaveBeenCalledWith({
      owner: 'acme',
      repo: 'widgets',
      per_page: 50,
    })
  })
})
