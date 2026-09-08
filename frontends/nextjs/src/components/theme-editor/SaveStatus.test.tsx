import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { SaveStatus } from './SaveStatus'

describe('SaveStatus', () => {
  it('shows nothing before a save', () => {
    const { container } = render(<SaveStatus status="idle" error={null} />)
    expect(container.textContent).toBe('')
  })

  it('confirms a save reached visitors', () => {
    render(<SaveStatus status="saved" error={null} />)
    expect(screen.getByRole('status').textContent).toContain('visitors')
  })

  it('says a refused save went no further than this browser, and why', () => {
    render(<SaveStatus status="failed" error="HTTP 403" />)
    const alert = screen.getByRole('alert').textContent ?? ''
    expect(alert).toContain('this browser only')
    expect(alert).toContain('HTTP 403')
  })
})
