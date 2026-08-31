import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

import { renderChildren } from './render-children'
import type { RenderContext } from '../render-json-component'

const ctx: RenderContext = { props: { name: 'Ada' }, state: {} }

describe('renderChildren', () => {
  it('renders nothing for null/undefined children', () => {
    expect(renderChildren(undefined, ctx, vi.fn())).toBeNull()
    expect(renderChildren(null, ctx, vi.fn())).toBeNull()
  })

  it('evaluates a string child as a template expression', () => {
    const out = renderChildren('{{props.name}}', ctx, vi.fn())
    expect(out).toBe('Ada')
  })

  it('renders a single nested node via the given render function', () => {
    const renderNode = vi.fn(() => <span>node</span>)
    renderChildren({ type: 'div' }, ctx, renderNode)
    expect(renderNode).toHaveBeenCalledWith({ type: 'div' }, ctx)
  })

  it('renders an array of string and node children', () => {
    const renderNode = vi.fn(() => <span>node</span>)
    const out = renderChildren(['{{props.name}}', { type: 'div' }], ctx, renderNode)
    const { container } = render(<>{out}</>)
    expect(container.textContent).toContain('Ada')
    expect(container.textContent).toContain('node')
  })
})
