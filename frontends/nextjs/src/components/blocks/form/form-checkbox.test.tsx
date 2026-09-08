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
import { node } from './form-test-harness'

beforeEach(() => {
  vi.clearAllMocks()
  api.submitForm.mockResolvedValue({ ok: true, reason: null, effects: [] })
})
afterEach(() => vi.clearAllMocks())

const consentForm = () =>
  node('form', { formName: 'book' }, [
    node('m3.checkbox', { label: 'Contact me', name: 'agreed' }),
    node('button', { label: 'Send' }),
  ])

const sent = () =>
  (api.submitForm.mock.calls[0]?.[0] as { values: Record<string, string> })
    .values

/**
 * Both blocks rendered a bare control with no name and never touched the
 * form scope, so a founder could add "I agree to be contacted", a visitor
 * could tick it, and the answer went nowhere: the row arrived without it.
 */
describe('a checkbox inside a form', () => {
  it('sends "yes" when ticked', async () => {
    render(<>{renderNode(consentForm())}</>)

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(api.submitForm).toHaveBeenCalled())
    expect(sent().agreed).toBe('yes')
  })

  // An unticked box is an answer. A workflow reading ${event.data.agreed}
  // has to be able to tell "left unticked" from "not on this form".
  it('sends "no" when left alone, rather than nothing', async () => {
    render(<>{renderNode(consentForm())}</>)

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(api.submitForm).toHaveBeenCalled())
    expect(sent().agreed).toBe('no')
  })

  it('sends "no" again once unticked', async () => {
    render(<>{renderNode(consentForm())}</>)
    const box = screen.getByRole('checkbox')

    await userEvent.click(box)
    await userEvent.click(box)
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(api.submitForm).toHaveBeenCalled())
    expect(sent().agreed).toBe('no')
  })

  it('collects a switch the same way', async () => {
    render(
      <>
        {renderNode(
          node('form', { formName: 'book' }, [
            node('m3.switch', { label: 'Remind me', name: 'remind' }),
            node('button', { label: 'Send' }),
          ])
        )}
      </>
    )

    // M3's Switch is an <input type="checkbox" role="switch">, so this is
    // the role it exposes.
    await userEvent.click(screen.getByRole('switch'))
    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(api.submitForm).toHaveBeenCalled())
    expect(sent().remind).toBe('yes')
  })

  // The contract the text field already keeps: no name, nothing collected.
  it('collects nothing without a name', async () => {
    render(
      <>
        {renderNode(
          node('form', { formName: 'book' }, [
            node('m3.checkbox', { label: 'Decorative' }),
            node('button', { label: 'Send' }),
          ])
        )}
      </>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Send' }))

    await waitFor(() => expect(api.submitForm).toHaveBeenCalled())
    expect(Object.keys(sent())).toHaveLength(0)
  })
})
