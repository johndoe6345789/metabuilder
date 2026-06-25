import { describe, expect, it } from 'vitest'
import { generateComponentCode } from './generateComponentCode'
import type { ComponentNode } from '@/types/project'

function node(overrides: Partial<ComponentNode> = {}): ComponentNode {
  return {
    id: '1',
    type: 'div',
    props: {},
    children: [],
    name: 'TestNode',
    ...overrides,
  }
}

describe('generateComponentCode', () => {
  it('renders a self-closing tag for leaf nodes', () => {
    const result = generateComponentCode(node({ type: 'Button', props: {} }))
    expect(result).toBe('<Button />')
  })

  it('renders a self-closing tag with string props', () => {
    const result = generateComponentCode(node({ type: 'Input', props: { placeholder: 'Enter text' } }))
    expect(result).toContain('placeholder="Enter text"')
    expect(result).toContain('<Input')
    expect(result).toContain('/>')
  })

  it('renders boolean true prop as standalone attribute name', () => {
    const result = generateComponentCode(node({ type: 'Button', props: { disabled: true } }))
    expect(result).toContain('disabled')
  })

  it('omits boolean false props', () => {
    const result = generateComponentCode(node({ type: 'Button', props: { hidden: false } }))
    expect(result).not.toContain('hidden')
  })

  it('renders numeric props with JSX expression', () => {
    const result = generateComponentCode(node({ type: 'Box', props: { width: 100 } }))
    expect(result).toContain('width={100}')
  })

  it('renders children nodes with increased indentation', () => {
    const child = node({ type: 'span', id: '2' })
    const parent = node({ type: 'div', children: [child] })
    const result = generateComponentCode(parent)
    expect(result).toContain('<div>')
    expect(result).toContain('</div>')
    expect(result).toContain('  <span />')
  })

  it('renders nested children recursively', () => {
    const grandchild = node({ type: 'strong', id: '3' })
    const child = node({ type: 'span', id: '2', children: [grandchild] })
    const parent = node({ type: 'div', children: [child] })
    const result = generateComponentCode(parent)
    expect(result).toContain('    <strong />')
  })

  it('respects initial indent level', () => {
    const result = generateComponentCode(node({ type: 'div' }), 2)
    expect(result.startsWith('    <div')).toBe(true)
  })

  it('renders multiple children', () => {
    const child1 = node({ type: 'h1', id: '2' })
    const child2 = node({ type: 'p', id: '3' })
    const parent = node({ type: 'section', children: [child1, child2] })
    const result = generateComponentCode(parent)
    expect(result).toContain('<h1 />')
    expect(result).toContain('<p />')
  })
})
