import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const nav = vi.hoisted(() => ({
  usePathname: vi.fn(() => '/harbour_cycle_works/'),
}))
vi.mock('next/navigation', () => nav)

const api = vi.hoisted(() => ({ submitForm: vi.fn() }))
vi.mock('./submit-form', () => api)

import { renderNode } from '../block-registry'
import { node } from './form-test-harness'

const bookButton = (props: Record<string, unknown> = {}) =>
  node('button', { label: 'Book a repair', action: 'book-a-repair', ...props })

beforeEach(() => {
  vi.clearAllMocks()
  api.submitForm.mockResolvedValue({ ok: true, reason: null })
  nav.usePathname.mockReturnValue('/harbour_cycle_works/')
})
afterEach(() => vi.clearAllMocks())

/**
 * A button on its own, with no form around it. The click is the whole
 * message: writing the row is what makes DBAL run the tenant's published
 * workflow, so "Book a repair" needs no fields to be useful.
 */
describe('a button wired to a workflow', () => {
  it('records the click under the name the author gave it', async () => {
    render(<>{renderNode(bookButton())}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Book a repair' }))

    await waitFor(() => {
      expect(api.submitForm).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant: 'harbour_cycle_works',
          formName: 'book-a-repair',
          values: {},
        })
      )
    })
  })

  it('says so once it has gone', async () => {
    render(<>{renderNode(bookButton({ doneLabel: 'Booked — we will call.' }))}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Book a repair' }))

    expect(await screen.findByText('Booked — we will call.')).toBeTruthy()
  })

  it('cannot be clicked twice into two bookings', async () => {
    render(<>{renderNode(bookButton())}</>)
    const button = screen.getByRole('button', { name: 'Book a repair' })

    await userEvent.click(button)
    await userEvent.click(button)

    await waitFor(() => {
      expect(api.submitForm).toHaveBeenCalledTimes(1)
    })
  })

  it('says what went wrong rather than looking like it worked', async () => {
    api.submitForm.mockResolvedValue({ ok: false, reason: 'Could not reach the site.' })
    render(<>{renderNode(bookButton())}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Book a repair' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Could not reach the site.')
  })

  it('leaves a button with no action alone', async () => {
    render(<>{renderNode(node('button', { label: 'Read more' }))}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Read more' }))

    expect(api.submitForm).not.toHaveBeenCalled()
  })
})
