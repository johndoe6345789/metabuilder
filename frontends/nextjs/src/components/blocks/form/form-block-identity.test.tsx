import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const nav = vi.hoisted(() => ({
  usePathname: vi.fn(() => '/harbour_cycle_works/book'),
}))
vi.mock('next/navigation', () => nav)

const api = vi.hoisted(() => ({ submitForm: vi.fn() }))
vi.mock('./submit-form', () => api)

import { renderNode } from '../block-registry'
import { node } from './form-test-harness'

beforeEach(() => {
  vi.clearAllMocks()
  api.submitForm.mockResolvedValue({ ok: true, reason: null })
})
afterEach(() => vi.clearAllMocks())

const styledForm = () =>
  node('form', { formName: 'x', className: 'enquiry', id: 'enquiry' }, [
    node('button', { label: 'Send' }),
  ])

/**
 * A form used to become a different element once it had been submitted: the
 * <form> went away and a bare <p> took its place. So whatever the author had
 * set on the block -- id, class, aria -- either had to be copied onto the
 * replacement or was simply lost, and CSS written for the form stopped
 * applying the moment somebody used it.
 *
 * One root, two contents. The identity has nothing to follow.
 */
describe('a form keeps its identity once it has been sent', () => {
  it('is still the same element, carrying the same attributes', async () => {
    const { container } = render(<>{renderNode(styledForm())}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('status')).toBeTruthy()

    const form = container.querySelector('form')
    expect(form?.id).toBe('enquiry')
    expect(form?.className).toContain('enquiry')
  })

  it('does not put them on the thank-you as well', async () => {
    const { container } = render(<>{renderNode(styledForm())}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('status')).toBeTruthy()

    // A workflow's page.class selector matches every node carrying the
    // class; two would apply the effect to the message as well.
    expect(container.querySelectorAll('.enquiry')).toHaveLength(1)
    expect(container.querySelectorAll('#enquiry')).toHaveLength(1)
  })

  it('still shows the thank-you it was given', async () => {
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
})
