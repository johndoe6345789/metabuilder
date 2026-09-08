import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { TestResultDetail } from './TestResultDetail'
import type { TestResult } from './use-test-runner'

const result = (over: Partial<TestResult> = {}): TestResult => ({
  status: 'pass',
  actual: { new_id: 'dry-run-id-1' },
  ...over,
})

describe('TestResultDetail', () => {
  it('shows what the run produced', () => {
    render(<TestResultDetail result={result()} />)
    expect(screen.getByText(/dry-run-id-1/)).not.toBeNull()
  })

  /**
   * A test that fails because the run stopped early reads as a test that
   * produced the wrong values, unless the stop is said out loud.
   */
  it('names the step that stopped the run, and why', () => {
    render(
      <TestResultDetail
        result={result({
          stopped: { step: 'Only carry on if', because: 'it was empty' },
        })}
      />
    )
    const text = screen.getByText(/Stopped at/).textContent ?? ''
    expect(text).toContain('Only carry on if')
    expect(text).toContain('it was empty')
    expect(text).toContain('did not run')
  })

  it('counts the rows it would have written, and says it did not', () => {
    render(
      <TestResultDetail
        result={result({ rows: { Booking: [{ id: 'b1' }, { id: 'b2' }] } })}
      />
    )
    const text = screen.getByText(/rows would be written/).textContent ?? ''
    expect(text).toContain('2 rows')
    expect(text).toContain('Booking')
    expect(text).toContain('nothing was')
  })

  it('counts one row without saying "1 rows"', () => {
    render(
      <TestResultDetail result={result({ rows: { B: [{ id: 'b1' }] } })} />
    )
    expect(screen.getByText(/1 row would be written/)).not.toBeNull()
  })

  it('lists what the page would be asked to do', () => {
    render(
      <TestResultDetail
        result={result({ effects: [{ do: 'page.message' }] })}
      />
    )
    expect(screen.getByText(/page.message/)).not.toBeNull()
  })

  it('says nothing about rows or the page when there were none', () => {
    render(<TestResultDetail result={result()} />)
    expect(screen.queryByText(/would be written/)).toBeNull()
    expect(screen.queryByText(/would be asked/)).toBeNull()
  })
})
