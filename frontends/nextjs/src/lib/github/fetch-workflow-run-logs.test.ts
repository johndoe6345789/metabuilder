import { describe, expect, it, vi } from 'vitest'
import type { Octokit } from 'octokit'
import { fetchWorkflowRunLogs } from './fetch-workflow-run-logs'

function makeClient(overrides?: {
  listJobsForWorkflowRun?: () => unknown
  downloadWorkflowRunLogs?: () => unknown
}) {
  return {
    rest: {
      actions: {
        listJobsForWorkflowRun:
          overrides?.listJobsForWorkflowRun ??
          vi.fn().mockResolvedValue({
            data: {
              jobs: [
                { id: 1, name: 'build', status: 'completed', conclusion: 'success' },
                { id: 2, name: 'test', status: 'completed', conclusion: 'failure' },
              ],
            },
          }),
        downloadWorkflowRunLogs:
          overrides?.downloadWorkflowRunLogs ??
          vi.fn().mockResolvedValue({ data: 'raw log text' }),
      },
    },
  } as unknown as Octokit
}

describe('fetchWorkflowRunLogs', () => {
  it('returns stub data when no client is provided', async () => {
    const result = await fetchWorkflowRunLogs({
      owner: 'acme',
      repo: 'widgets',
      runId: 42,
    })
    expect(result).toEqual({
      logs: '',
      runId: 42,
      jobs: [],
      logsText: '',
      truncated: false,
    })
  })

  it('fetches jobs and logs via the options object form', async () => {
    const client = makeClient()
    const result = await fetchWorkflowRunLogs({
      client,
      owner: 'acme',
      repo: 'widgets',
      runId: 42,
    })
    expect(result?.jobs).toHaveLength(2)
    expect(result?.logsText).toBe('raw log text')
    expect(result?.truncated).toBe(false)
  })

  it('accepts the positional-argument overload, stubbed since it has no way to pass a client', async () => {
    const result = await fetchWorkflowRunLogs('acme', 'widgets', 42, {
      failedOnly: true,
    })
    expect(result).toEqual({
      logs: '',
      runId: 42,
      jobs: [],
      logsText: '',
      truncated: false,
    })
  })

  it('throws when the positional form is missing repo or runId', async () => {
    await expect(
      fetchWorkflowRunLogs('acme', '', 0)
    ).rejects.toThrow('repo and runId are required')
  })

  it('filters jobs to failedOnly when requested', async () => {
    const client = makeClient()
    const result = await fetchWorkflowRunLogs({
      client,
      owner: 'acme',
      repo: 'widgets',
      runId: 42,
      failedOnly: true,
    })
    expect(result?.jobs).toHaveLength(1)
    expect(result?.jobs?.[0].conclusion).toBe('failure')
  })

  it('skips downloading logs when includeLogs is false', async () => {
    const download = vi.fn()
    const client = makeClient({ downloadWorkflowRunLogs: download })
    const result = await fetchWorkflowRunLogs({
      client,
      owner: 'acme',
      repo: 'widgets',
      runId: 42,
      includeLogs: false,
    })
    expect(download).not.toHaveBeenCalled()
    expect(result?.logsText).toBe('')
  })

  it('reports binary log data as unavailable text', async () => {
    const client = makeClient({
      downloadWorkflowRunLogs: vi
        .fn()
        .mockResolvedValue({ data: new ArrayBuffer(4) }),
    })
    const result = await fetchWorkflowRunLogs({
      client,
      owner: 'acme',
      repo: 'widgets',
      runId: 42,
    })
    expect(result?.logsText).toBe('[Binary log data available]')
  })

  it('falls back to a placeholder when downloading logs fails', async () => {
    const client = makeClient({
      downloadWorkflowRunLogs: vi.fn().mockRejectedValue(new Error('rate limited')),
    })
    const result = await fetchWorkflowRunLogs({
      client,
      owner: 'acme',
      repo: 'widgets',
      runId: 42,
    })
    expect(result?.logsText).toBe('[Logs not available]')
    expect(result?.jobs).toHaveLength(2)
  })

  it('returns null when fetching jobs fails', async () => {
    const client = makeClient({
      listJobsForWorkflowRun: vi.fn().mockRejectedValue(new Error('not found')),
    })
    const result = await fetchWorkflowRunLogs({
      client,
      owner: 'acme',
      repo: 'widgets',
      runId: 42,
    })
    expect(result).toBeNull()
  })
})
