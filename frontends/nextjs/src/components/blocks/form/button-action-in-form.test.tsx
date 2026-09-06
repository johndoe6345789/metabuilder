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
 * Inside a Form the Form does the recording, with the answers attached.
 * A button that also recorded its own click would run the workflow twice
 * -- once with the answers and once with nothing.
 */
describe('a button with an action inside a form', () => {
  it('leaves the recording to the form', async () => {
    render(
      <>
        {renderNode(
          node('form', { formName: 'book-a-repair' }, [
            node('m3.textfield', { label: 'Your name', name: 'name' }),
            bookButton({ label: 'Send' }),
          ])
        )}
      </>
    )

    await userEvent.type(screen.getByLabelText('Your name'), 'Rosa')
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => {
      expect(api.submitForm).toHaveBeenCalledTimes(1)
    })
    expect(api.submitForm).toHaveBeenCalledWith(
      expect.objectContaining({ values: { name: 'Rosa' } })
    )
  })
})
