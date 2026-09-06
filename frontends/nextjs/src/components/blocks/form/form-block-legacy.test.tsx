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

/**
 * The text field and the button both predate forms and are on published
 * pages already. Outside a Form they have to behave exactly as before.
 */
describe('the same blocks outside a form', () => {
  it('leaves a lone text field as it was', () => {
    render(<>{renderNode(node('m3.textfield', { label: 'Search' }))}</>)
    expect(screen.getByLabelText('Search')).toBeTruthy()
  })

  it('leaves a lone button as an ordinary button', () => {
    render(<>{renderNode(node('button', { label: 'Read more' }))}</>)
    expect(
      screen.getByRole('button', { name: 'Read more' }).getAttribute('type')
    ).toBe('button')
  })

  // A field with no name has nothing to carry its value under, so it stays
  // uncontrolled even inside a form rather than silently losing input.
  it('leaves an unnamed field inside a form uncontrolled', async () => {
    render(
      <>
        {renderNode(
          node('form', { formName: 'x' }, [
            node('m3.textfield', { label: 'Notes' }),
            node('button', { label: 'Send' }),
          ])
        )}
      </>
    )

    await userEvent.type(screen.getByLabelText('Notes'), 'hello')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(api.submitForm).toHaveBeenCalledWith(
        expect.objectContaining({ values: {} })
      )
    })
  })
})

describe('submitting twice', () => {
  it('does not send twice if the button is hit twice', async () => {
    let release: (v: unknown) => void = () => undefined
    api.submitForm.mockReturnValue(
      new Promise(resolve => {
        release = resolve
      })
    )
    render(<>{renderNode(bookingForm())}</>)
    const button = screen.getByRole('button', { name: 'Book a repair' })

    await userEvent.click(button)
    await userEvent.click(button)
    release({ ok: true, reason: null })

    expect(api.submitForm).toHaveBeenCalledTimes(1)
  })
})
