import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { renderNode, type TreeNode } from './block-registry'

const node = (over: Partial<TreeNode> = {}): TreeNode => ({
  id: 'n1',
  type: 'html.p',
  props: {},
  children: [],
  ...over,
})

/**
 * Some blocks do not render their control as their outermost element: the
 * button wraps its M3 <Button> in a display:contents span, so that a ref has
 * something to anchor to and the sent/failed messages have somewhere to sit.
 *
 * cloneElement hands the author's attributes to whatever that outermost thing
 * is, which read none of them -- so a class set on a Button in the builder
 * reached no DOM node at all.
 */
describe('renderNode: a block whose control is not its outer element', () => {
  const button = (props: Record<string, unknown>): HTMLElement =>
    render(<>{renderNode(node({ type: 'button', props }))}</>).container

  it('applies id and class to the button itself', () => {
    const container = button({
      text: 'x',
      className: 'primary-cta',
      id: 'book',
    })
    const el = container.querySelector('button')

    expect(el?.id).toBe('book')
    expect(el?.className).toContain('primary-cta')
  })

  it('maps the builder names onto the button', () => {
    const container = button({
      ariaLabel: 'Book a repair',
      ariaDescribedby: 'hint',
      testId: 'book-btn',
      role: 'link',
    })
    const el = container.querySelector('button')

    expect(el?.getAttribute('aria-label')).toBe('Book a repair')
    expect(el?.getAttribute('aria-describedby')).toBe('hint')
    expect(el?.getAttribute('data-testid')).toBe('book-btn')
    expect(el?.getAttribute('role')).toBe('link')
  })

  // A workflow's page.class selector matches every node carrying the class.
  // Left on the wrapper too, "make the CTA green" would paint the wrapper as
  // well as the control -- so the wrapper has to come away clean.
  it('does not leave them on the wrapper as well', () => {
    const container = button({
      className: 'primary-cta',
      id: 'book',
      testId: 'book-btn',
    })

    expect(container.querySelectorAll('.primary-cta')).toHaveLength(1)
    expect(container.querySelectorAll('#book')).toHaveLength(1)
    expect(container.querySelectorAll('[data-testid="book-btn"]'))
      .toHaveLength(1)
    expect(container.querySelector('span#book')).toBeNull()
  })

  it('still keeps the M3 classes the button sets for itself', () => {
    const el = button({ className: 'primary-cta' }).querySelector('button')

    expect(el?.className).toContain('primary-cta')
    expect(el?.className).toContain('mdc-button')
  })
})
