import { describe, expect, it } from 'vitest'
import { collectRows } from './collect-rows'
import type { TreeNodeShape } from './types'

const tree: TreeNodeShape = {
  id: 'root',
  type: 'container',
  props: { gap: 16 },
  children: [
    {
      id: 'head',
      type: 'html.h1',
      props: { text: 'Hi', hidden: false },
      children: [],
    },
    { id: '', type: 'html.p', props: {}, children: [] },
  ],
}

describe('collectRows', () => {
  it('flattens every node, parent before child', () => {
    const { nodes } = collectRows('acme', 'tree_1', tree)
    expect(nodes.map(n => n.type)).toEqual(['container', 'html.h1', 'html.p'])
    expect(nodes[0].parentId).toBeNull()
    expect(nodes[1].parentId).toBe(nodes[0].id)
  })

  it('keeps sibling order in sortOrder', () => {
    const { nodes } = collectRows('acme', 'tree_1', tree)
    expect(nodes[1].sortOrder).toBe(0)
    expect(nodes[2].sortOrder).toBe(1)
  })

  it('names a node without an id of its own, uniquely', () => {
    const { nodes } = collectRows('acme', 'tree_1', tree)
    const ids = nodes.map(n => n.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[2]).toContain('tree_1__')
  })

  it('carries each prop with the type it should be stored as', () => {
    const { props } = collectRows('acme', 'tree_1', tree)
    const byName = Object.fromEntries(props.map(p => [p.name, p]))
    expect(byName.gap).toMatchObject({ value: '16', valueType: 'number' })
    expect(byName.text).toMatchObject({ value: 'Hi', valueType: 'string' })
    expect(byName.hidden).toMatchObject({ value: 'false', valueType: 'boolean' })
  })

  it('gives every prop row a sortOrder, which the schema requires', () => {
    const { props } = collectRows('acme', 'tree_1', tree)
    expect(props.every(p => typeof p.sortOrder === 'number')).toBe(true)
  })

  it('points each prop at its own node and tree', () => {
    const { nodes, props } = collectRows('acme', 'tree_1', tree)
    const text = props.find(p => p.name === 'text')
    expect(text?.nodeId).toBe(nodes[1].id)
    expect(text?.treeId).toBe('tree_1')
    expect(text?.tenantId).toBe('acme')
  })

  it('has nothing to write for a node with no props', () => {
    const bare: TreeNodeShape = { id: 'x', type: 'container', props: {}, children: [] }
    expect(collectRows('acme', 't', bare).props).toEqual([])
  })
})
