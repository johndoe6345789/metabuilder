import { describe, expect, it } from 'vitest'

import { render } from '@testing-library/react'

import { PALETTE, renderNode } from '@/components/blocks/block-registry'
import { defaultComponentTree } from './default-component-tree'
import { collectRows } from '@/lib/tenant/page-tree/collect-rows'
import type { TreeNodeShape } from '@/lib/tenant/page-tree'

const nodes = (t: TreeNodeShape): TreeNodeShape[] => [
  t,
  ...t.children.flatMap(nodes),
]

/**
 * This is the page a founder gets the moment they install a package, and
 * it was written against a component vocabulary that does not exist here.
 *
 * It reached the registry through `as unknown as TreeNodeShape`, which
 * asserted three things that were not true: that every node had an `id`
 * (only the root did, so collectRows threw on the first child and the
 * install reported "Failed to install"); that "Box" and "Typography" were
 * block types (they are not, so the page would have rendered "Unknown
 * block" three times); and that the text blocks carried `content` (the
 * text block reads `text`).
 *
 * None of it could be caught while a double cast stood between the two
 * sides -- and the only test of the install path mocked saveTree, so the
 * real traversal never ran.
 */
describe('the starter page a package ships with', () => {
  const tree = defaultComponentTree('Harbour Cycle Works')

  it('gives every node an id, which the row writer requires', () => {
    for (const node of nodes(tree)) {
      expect(typeof node.id).toBe('string')
      expect(node.id.length).toBeGreaterThan(0)
    }
  })

  it('survives being turned into rows', () => {
    // collectRows threw a TypeError here: node.id was undefined on the
    // first child, so saveTree never reached its PageConfig write.
    expect(() => collectRows('acme', 'tree_1', tree)).not.toThrow()
    expect(collectRows('acme', 'tree_1', tree).nodes.length).toBeGreaterThan(1)
  })

  it('uses block types the registry actually has', () => {
    const known = new Set(PALETTE.map(p => p.type))
    for (const node of nodes(tree)) {
      expect(known.has(node.type)).toBe(true)
    }
  })

  it('renders the title rather than an unknown-block notice', () => {
    const html = renderHtml(tree)
    expect(html).toContain('Harbour Cycle Works')
    expect(html).not.toContain('Unknown block')
  })
})

function renderHtml(tree: TreeNodeShape): string {
  const toNode = (n: TreeNodeShape): Parameters<typeof renderNode>[0] => ({
    id: n.id,
    type: n.type,
    props: n.props,
    children: n.children.map(toNode),
  })
  return render(renderNode(toNode(tree))).container.innerHTML
}

/**
 * The fallback for an unnamed node was written as `node.id.length > 0`,
 * which reads the property before deciding it is missing -- so a tree that
 * genuinely had none threw a TypeError rather than falling back.
 */
describe('a node that arrived without an id', () => {
  it('gets one rather than taking the publish down', () => {
    const unnamed = {
      id: 'root',
      type: 'container',
      props: {},
      children: [{ type: 'text', props: { text: 'hi' }, children: [] }],
    } as unknown as TreeNodeShape

    expect(() => collectRows('acme', 'tree_1', unnamed)).not.toThrow()
    expect(collectRows('acme', 'tree_1', unnamed).nodes).toHaveLength(2)
  })
})
