import { describe, expect, it } from 'vitest'

import { previewReport } from './fire-workflow'
import type { RunResult } from '@/lib/workflow/run-workflow'

const result = (over: Partial<RunResult> = {}): RunResult => ({
  logs: ['▶ Make an id (dbal.uuid)'],
  output: { new_id: 'dry-run-id-1' },
  order: ['n1'],
  effects: [],
  rows: {},
  stopped: null,
  ...over,
})

describe('previewReport', () => {
  it('lists the steps it ran and what came out', () => {
    const text = previewReport(result())
    expect(text).toContain('▶ Make an id')
    expect(text).toContain('"new_id":"dry-run-id-1"')
  })

  /**
   * Preview used to show a merged config object whatever the workflow
   * was, so a run that stopped at the first condition looked identical to
   * one that ran to the end.
   */
  it('names the step that stopped the run', () => {
    const text = previewReport(
      result({ stopped: { step: 'Only carry on if', because: 'it was empty' } })
    )
    expect(text).toContain('Stopped at "Only carry on if"')
    expect(text).toContain('did not run')
  })

  it('says what it would have written, and that it did not', () => {
    const text = previewReport(
      result({ rows: { Booking: [{ id: 'b1' }, { id: 'b2' }] } })
    )
    expect(text).toContain('2 × Booking')
    expect(text).toContain('nothing was written')
  })

  it('says what it would ask the page to do', () => {
    const text = previewReport(
      result({ effects: [{ do: 'page.go', path: '/thanks' }] })
    )
    expect(text).toContain('page.go')
  })

  it('says nothing about rows or the page when there were none', () => {
    const text = previewReport(result())
    expect(text).not.toContain('Would write')
    expect(text).not.toContain('Would ask')
  })
})
