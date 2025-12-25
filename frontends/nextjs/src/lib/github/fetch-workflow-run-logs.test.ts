import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWorkflowRunLogs } from './fetch-workflow-run-logs'
import { getJobLogsText } from './get-job-logs-text'
import { listWorkflowRunJobs } from './list-workflow-run-jobs'

vi.mock('./list-workflow-run-jobs', () => ({
  listWorkflowRunJobs: vi.fn(),
}))

vi.mock('./get-job-logs-text', () => ({
  getJobLogsText: vi.fn(),
}))

const listWorkflowRunJobsMock = vi.mocked(listWorkflowRunJobs)
const getJobLogsTextMock = vi.mocked(getJobLogsText)

const baseOptions = {
  client: {} as any,
  owner: 'acme',
  repo: 'demo',
  runId: 123,
  runName: 'Build & Test',
}

const jobsFixture = [
  {
    id: 1,
    name: 'Build',
    status: 'completed',
    conclusion: 'success',
    started_at: '2024-01-01T00:00:00Z',
    completed_at: '2024-01-01T00:05:00Z',
    steps: [],
  },
  {
    id: 2,
    name: 'Lint',
    status: 'completed',
    conclusion: 'failure',
    started_at: '2024-01-01T00:01:00Z',
    completed_at: '2024-01-01T00:04:00Z',
    steps: [],
  },
  {
    id: 3,
    name: 'Test',
    status: 'completed',
    conclusion: 'success',
    started_at: '2024-01-01T00:02:00Z',
    completed_at: '2024-01-01T00:06:00Z',
    steps: [],
  },
]

describe('fetchWorkflowRunLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('limits jobs and marks truncated', async () => {
    listWorkflowRunJobsMock.mockResolvedValue(jobsFixture)
    getJobLogsTextMock.mockResolvedValue('log output')

    const result = await fetchWorkflowRunLogs({
      ...baseOptions,
      jobLimit: 2,
      includeLogs: true,
    })

    expect(result.jobs).toHaveLength(2)
    expect(result.truncated).toBe(true)
    expect(result.logsText).toContain('WORKFLOW RUN: Build & Test')
    expect(getJobLogsTextMock).toHaveBeenCalledTimes(2)
  })

  it('skips log downloads when includeLogs is false', async () => {
    listWorkflowRunJobsMock.mockResolvedValue(jobsFixture)

    const result = await fetchWorkflowRunLogs({
      ...baseOptions,
      includeLogs: false,
    })

    expect(result.logsText).toBeNull()
    expect(result.jobs).toHaveLength(3)
    expect(getJobLogsTextMock).not.toHaveBeenCalled()
  })

  it('captures per-job log errors without failing the request', async () => {
    listWorkflowRunJobsMock.mockResolvedValue(jobsFixture.slice(0, 2))
    getJobLogsTextMock
      .mockRejectedValueOnce(new Error('no logs'))
      .mockResolvedValueOnce('lint logs')

    const result = await fetchWorkflowRunLogs({
      ...baseOptions,
      includeLogs: true,
    })

    expect(result.logsText).toContain('Could not fetch logs for this job')
    expect(result.logsText).toContain('no logs')
    expect(result.logsText).toContain('lint logs')
    expect(result.truncated).toBe(false)
  })
})
