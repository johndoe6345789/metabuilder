import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { renderNode } from './block-registry'
import type { TreeNode } from './block-registry'

const listItem = (props: Record<string, unknown>): TreeNode => ({
  id: 'n1',
  type: 'list-item',
  props,
  children: [],
})

describe('List Item', () => {
  /**
   * Found on a published page: a three-line price list written as
   * `add a List item that says "Full service -- 65"` rendered each line
   * with a bell icon and the word "Description" under it. Both came from
   * fallbacks meant to show the block was there while editing, which then
   * shipped as real content to a live site.
   */
  it('does not invent a description the author never wrote', () => {
    render(<>{renderNode(listItem({ title: 'Full service -- 65' }))}</>)

    expect(screen.getByText('Full service -- 65')).toBeTruthy()
    expect(screen.queryByText('Description')).toBeNull()
  })

  it('does not invent an icon the author never chose', () => {
    const { container } = render(
      <>{renderNode(listItem({ title: 'Full service -- 65' }))}</>
    )

    expect(container.querySelector('.material-symbols-rounded')).toBeNull()
  })

  it('shows the description when there is one', () => {
    render(
      <>
        {renderNode(
          listItem({ title: 'Full service', description: 'Takes three days' })
        )}
      </>
    )

    expect(screen.getByText('Takes three days')).toBeTruthy()
  })

  it('shows the icon when one is chosen', () => {
    const { container } = render(
      <>{renderNode(listItem({ title: 'Full service', icon: 'build' }))}</>
    )

    const icon = container.querySelector('.material-symbols-rounded')
    expect(icon?.textContent).toBe('build')
  })

  // An empty block still has to be visible and selectable in the builder,
  // so the title keeps its placeholder -- it is the one part of a list
  // item that always has something to say.
  it('still shows a placeholder title while empty', () => {
    render(<>{renderNode(listItem({}))}</>)
    expect(screen.getByText('Title')).toBeTruthy()
  })
})
