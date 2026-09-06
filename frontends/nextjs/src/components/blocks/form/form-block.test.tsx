import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const nav = vi.hoisted(() => ({
  usePathname: vi.fn(() => '/harbour_cycle_works/book'),
}))
vi.mock('next/navigation', () => nav)

const api = vi.hoisted(() => ({ submitForm: vi.fn() }))
vi.mock('./submit-form', () => api)

import { renderNode } from '../block-registry'
import { bookingForm, node } from './form-test-harness'

beforeEach(() => {
  vi.clearAllMocks()
  api.submitForm.mockResolvedValue({ ok: true, reason: null })
  nav.usePathname.mockReturnValue('/harbour_cycle_works/book')
})
afterEach(() => vi.clearAllMocks())

describe('a form on a published page', () => {
  it('sends what was typed, under the names the fields were given', async () => {
    render(<>{renderNode(bookingForm())}</>)

    await userEvent.type(screen.getByLabelText('Your name'), 'Rosa')
    await userEvent.type(
      screen.getByLabelText('What needs doing'),
      'Buckled rear wheel'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Book a repair' }))

    await waitFor(() => {
      expect(api.submitForm).toHaveBeenCalledWith(
        expect.objectContaining({
          formName: 'book-a-repair',
          values: { name: 'Rosa', job: 'Buckled rear wheel' },
        })
      )
    })
  })

  // The row has to land under the site's own tenant: that is what decides
  // whose workflow DBAL then runs.
  it("submits to the tenant whose site this is", async () => {
    render(<>{renderNode(bookingForm())}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Book a repair' }))

    await waitFor(() => {
      expect(api.submitForm).toHaveBeenCalledWith(
        expect.objectContaining({ tenant: 'harbour_cycle_works' })
      )
    })
  })

  it('thanks the visitor once it has gone', async () => {
    render(
      <>
        {renderNode(
          node('form', { formName: 'x', successMessage: 'Booking received.' }, [
            node('button', { label: 'Send' }),
          ])
        )}
      </>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Booking received.')).toBeTruthy()
  })

  it('says what went wrong rather than looking like it worked', async () => {
    api.submitForm.mockResolvedValue({
      ok: false,
      reason: 'Too many messages just now. Please try again shortly.',
    })
    render(<>{renderNode(bookingForm())}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Book a repair' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Too many messages just now')
  })

})
