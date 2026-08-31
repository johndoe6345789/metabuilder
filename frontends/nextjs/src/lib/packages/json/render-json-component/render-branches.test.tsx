import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  renderConditional,
  renderElement,
  renderRef,
} from './render-branches'
import type { JSONComponent } from '../types'
import type { RenderContext } from '../render-json-component'

const ctx: RenderContext = { props: {}, state: {} }

describe('renderRef', () => {
  it('renders the referenced component template', () => {
    const registry = new Map<string, JSONComponent>([
      ['Shared', { id: 'Shared', name: 'Shared', render: { template: 'hi' } } as never],
    ])
    const renderNode = vi.fn(() => <span>rendered</span>)
    render(renderRef('Shared', ctx, registry, renderNode))
    expect(renderNode).toHaveBeenCalledWith('hi', ctx)
  })

  it('warns without the leading "$" bug when the ref is missing', () => {
    render(renderRef('Missing', ctx, new Map(), vi.fn()))
    expect(screen.getByText(/Component reference "Missing" not found/)).toBeTruthy()
  })
})

describe('renderConditional', () => {
  it('renders nothing when the condition key is absent', () => {
    const { container } = render(
      renderConditional({}, ctx, () => <span>x</span>)
    )
    expect(container.textContent).toBe('')
  })

  it('renders nothing when the chosen branch is missing', () => {
    const { container } = render(
      renderConditional({ condition: true }, ctx, () => <span>x</span>)
    )
    expect(container.textContent).toBe('')
  })
})

describe('renderElement', () => {
  it('defaults to a div with an undefined node type', () => {
    const { container } = render(
      renderElement({}, undefined, ctx, () => <span>x</span>)
    )
    expect(container.querySelector('div')).not.toBeNull()
  })
})
