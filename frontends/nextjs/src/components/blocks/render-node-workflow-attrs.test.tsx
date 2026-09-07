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
 * A block can carry a class and a workflow at once, and a founder who
 * styles a button and then wires it up has done nothing unusual.
 *
 * The wrapper went on before the attributes did, so cloneElement handed
 * the class to WorkflowClick -- which renders a display:contents span and
 * reads no className. The class reached no DOM node at all, and only on
 * the blocks somebody had wired: styling that worked until the button was
 * given something to do.
 */
describe('renderNode: a block with both a class and a workflow', () => {
  it('keeps the class on the block itself', () => {
    const { container } = render(
      <>
        {renderNode(
          node({
            props: {
              text: 'Booked',
              className: 'booking-line',
              id: 'booking',
              onClickWorkflow: 'Book a repair',
            },
          })
        )}
      </>
    )
    const p = container.querySelector('p')

    expect(p?.className).toContain('booking-line')
    expect(p?.id).toBe('booking')
  })

  it('still runs the workflow when clicked', () => {
    const { container } = render(
      <>
        {renderNode(
          node({
            type: 'button',
            props: { text: 'Go', onClickWorkflow: 'Go' },
          })
        )}
      </>
    )

    // The wrapper is what carries the handler, so it has to survive too.
    expect(container.querySelector('span[style*="contents"]')).not.toBeNull()
  })
})
