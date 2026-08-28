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
 * A block's render() only reads the props it knows about, so identity, class
 * and aria attributes are applied centrally instead. Without this, setting an
 * id in the builder silently did nothing on thirty-seven block types.
 */
describe('renderNode common attributes', () => {
  it('applies id and class to a block that reads neither', () => {
    const { container } = render(
      <>{renderNode(node({ props: { text: 'hi', id: 'intro', className: 'lede' } }))}</>
    )
    const p = container.querySelector('p')

    expect(p?.id).toBe('intro')
    expect(p?.className).toContain('lede')
  })

  it('maps the builder names onto real DOM attributes', () => {
    const { container } = render(
      <>
        {renderNode(
          node({
            props: {
              ariaLabel: 'Intro',
              ariaDescribedby: 'hint',
              ariaHidden: 'true',
              testId: 'intro-p',
            },
          })
        )}
      </>
    )
    const p = container.querySelector('p')

    expect(p?.getAttribute('aria-label')).toBe('Intro')
    expect(p?.getAttribute('aria-describedby')).toBe('hint')
    expect(p?.getAttribute('aria-hidden')).toBe('true')
    expect(p?.getAttribute('data-testid')).toBe('intro-p')
  })

  it('leaves an unset attribute off entirely', () => {
    const { container } = render(<>{renderNode(node({ props: {} }))}</>)
    const p = container.querySelector('p')

    // An empty id attribute is not the same as no id attribute.
    expect(p?.hasAttribute('id')).toBe(false)
    expect(p?.hasAttribute('aria-label')).toBe(false)
  })

  it('ignores an empty string, which means unset', () => {
    const { container } = render(
      <>{renderNode(node({ props: { id: '', className: '' } }))}</>
    )
    expect(container.querySelector('p')?.hasAttribute('id')).toBe(false)
  })
})
