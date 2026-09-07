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

beforeEach(() => {
  vi.clearAllMocks()
  api.submitForm.mockResolvedValue({ ok: true, reason: null })
  nav.usePathname.mockReturnValue('/harbour_cycle_works/')
})
afterEach(() => vi.clearAllMocks())

/**
 * Any block can run a workflow when clicked, not only a button. A card, a
 * heading and an image are all things someone will click, and the block
 * that happens to look like a control should not be the only one able to
 * act.
 */
describe('a block that names a workflow', () => {
  it.each([
    ['html.h1', { text: 'Book a repair' }, 'Book a repair'],
    ['m3.chip', { label: 'Repairs' }, 'Repairs'],
    ['text', { text: 'Call us back' }, 'Call us back'],
  ])('runs it when a %s is clicked', async (type, props, label) => {
    render(
      <>
        {renderNode(
          node(type, { ...props, onClickWorkflow: 'Log a booking' })
        )}
      </>
    )

    await userEvent.click(screen.getByText(label))

    await waitFor(() => {
      expect(api.submitForm).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant: 'harbour_cycle_works',
          workflow: 'Log a booking',
        })
      )
    })
  })

  it('leaves a block that names none untouched', async () => {
    render(<>{renderNode(node('html.h1', { text: 'Just a heading' }))}</>)

    await userEvent.click(screen.getByText('Just a heading'))

    expect(api.submitForm).not.toHaveBeenCalled()
  })

  // Whitespace is not a workflow name; treating it as one would wrap
  // every block in a click handler that submits nothing.
  it('ignores a name that is only whitespace', async () => {
    render(
      <>{renderNode(node('html.h1', { text: 'Heading', onClickWorkflow: '  ' }))}</>
    )

    await userEvent.click(screen.getByText('Heading'))

    expect(api.submitForm).not.toHaveBeenCalled()
  })

  it('says what went wrong rather than looking like it worked', async () => {
    api.submitForm.mockResolvedValue({ ok: false, reason: 'Could not reach the site.' })
    render(
      <>{renderNode(node('html.h1', { text: 'Go', onClickWorkflow: 'W' }))}</>
    )

    await userEvent.click(screen.getByText('Go'))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Could not reach the site.')
  })
})
