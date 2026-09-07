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

const assign = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('location', { assign } as unknown as Location)
  api.submitForm.mockResolvedValue({ ok: true, reason: null, effects: [] })
})
afterEach(() => vi.unstubAllGlobals())

/** A form inside the page root that page.* selectors are scoped to. */
const page = () =>
  render(
    <div data-page-root>
      <p className="note">before</p>
      {renderNode(
        node('form', { formName: 'x' }, [node('button', { label: 'Send' })])
      )}
    </div>
  )

/**
 * submitForm returns the effects the tenant's workflow asked for, and
 * FormBlock dropped them on the floor. applyPageEffects was reached from
 * exactly one place -- use-record-action, the bare-button path -- and a
 * button inside a Form deliberately blanks its own action so the form's
 * submit is the only route. So a founder could wire page.message or
 * page.go to a form workflow, watch it run server-side, and nothing at all
 * happened in the browser.
 */
describe('what a form workflow asked the page to do', () => {
  it('applies a text change the workflow returned', async () => {
    api.submitForm.mockResolvedValue({
      ok: true,
      reason: null,
      effects: [{ do: 'page.text', target: '.note', text: 'after' }],
    })
    const { container } = page()

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('status')).toBeTruthy()

    expect(container.querySelector('.note')?.textContent).toBe('after')
  })

  it('sends the visitor where the workflow said to', async () => {
    api.submitForm.mockResolvedValue({
      ok: true,
      reason: null,
      effects: [{ do: 'page.go', path: '/thanks' }],
    })
    page()

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(await screen.findByRole('status')).toBeTruthy()

    expect(assign).toHaveBeenCalledWith('/thanks')
  })

  it('still shows the form’s own thank-you when there are none', async () => {
    page()

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByRole('status')).toBeTruthy()
    expect(assign).not.toHaveBeenCalled()
  })
})

describe('a message the workflow wrote', () => {
  it('is shown instead of the form’s own thank-you', async () => {
    api.submitForm.mockResolvedValue({
      ok: true,
      reason: null,
      effects: [{ do: 'page.message', text: 'Booked for Tuesday.' }],
    })
    render(
      <div data-page-root>
        {renderNode(
          node('form', { formName: 'x', successMessage: 'Thanks.' }, [
            node('button', { label: 'Send' }),
          ])
        )}
      </div>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect((await screen.findByRole('status')).textContent).toBe(
      'Booked for Tuesday.'
    )
  })
})
