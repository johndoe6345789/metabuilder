import { describe, expect, it } from 'vitest'

import {
  collectDomIds,
  findNode,
  insertAfter,
  insertBefore,
  insertChild,
  isDescendant,
  mapTree,
  nid,
  parentOf,
  removeNode,
  walk,
} from './component-tree-utils'
import type { TreeNode } from './builder-registry'

const n = (
  id: string,
  children: TreeNode[] = [],
  props: Record<string, unknown> = {}
): TreeNode => ({ id, type: 'html.div', props, children })

/**
 *   root
 *   ├── a
 *   │   ├── a1
 *   │   └── a2
 *   └── b
 */
const tree = () => n('root', [n('a', [n('a1'), n('a2')]), n('b')])

const ids = (node: TreeNode): string[] => {
  const out: string[] = []
  walk(node, current => out.push(current.id))
  return out
}

describe('nid', () => {
  it('produces distinct ids even in a tight burst', () => {
    // All within one millisecond, so only the counter separates them.
    const seen = new Set(Array.from({ length: 5000 }, nid))
    expect(seen.size).toBe(5000)
  })

  it('is usable as an identifier', () => {
    expect(nid()).toMatch(/^n_\d+_[a-z0-9]+_[a-z0-9]+$/)
  })

  it('never repeats across separate calls', () => {
    expect(nid()).not.toBe(nid())
  })
})

describe('walk', () => {
  it('visits every node, parents before children', () => {
    expect(ids(tree())).toEqual(['root', 'a', 'a1', 'a2', 'b'])
  })

  it('visits a leaf exactly once', () => {
    let count = 0
    walk(n('solo'), () => {
      count += 1
    })
    expect(count).toBe(1)
  })
})

describe('mapTree', () => {
  it('applies the change at every depth', () => {
    const out = mapTree(tree(), node => ({
      ...node,
      props: { ...node.props, seen: true },
    }))

    const flags: unknown[] = []
    walk(out, node => flags.push(node.props.seen))
    expect(flags).toEqual([true, true, true, true, true])
  })

  it('does not mutate the input', () => {
    const original = tree()
    mapTree(original, node => ({ ...node, props: { changed: true } }))
    expect(original.props).toEqual({})
  })
})

describe('findNode', () => {
  it.each([['root'], ['a'], ['a2'], ['b']])('finds %s', id => {
    expect(findNode(tree(), id)?.id).toBe(id)
  })

  it('answers null for an id that is not there', () => {
    expect(findNode(tree(), 'nope')).toBeNull()
  })
})

describe('parentOf', () => {
  it('finds the immediate parent', () => {
    expect(parentOf(tree(), 'a1')?.id).toBe('a')
    expect(parentOf(tree(), 'a')?.id).toBe('root')
  })

  it('answers null for the root, which has no parent', () => {
    expect(parentOf(tree(), 'root')).toBeNull()
  })

  it('answers null for a missing id', () => {
    expect(parentOf(tree(), 'nope')).toBeNull()
  })
})

describe('insertChild', () => {
  it('appends to the named parent', () => {
    const out = insertChild(tree(), 'a', n('a3'))
    expect(findNode(out, 'a')?.children.map(c => c.id)).toEqual([
      'a1',
      'a2',
      'a3',
    ])
  })

  it('can append to the root', () => {
    const out = insertChild(tree(), 'root', n('c'))
    expect(out.children.map(c => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('changes nothing for a parent that is not there', () => {
    expect(ids(insertChild(tree(), 'nope', n('x')))).toEqual(ids(tree()))
  })
})

describe('removeNode', () => {
  it('removes a leaf', () => {
    expect(ids(removeNode(tree(), 'a1'))).toEqual(['root', 'a', 'a2', 'b'])
  })

  it('removes a subtree with its descendants', () => {
    expect(ids(removeNode(tree(), 'a'))).toEqual(['root', 'b'])
  })

  it('cannot remove the root itself', () => {
    // The caller always holds a root; removing it would leave nothing.
    expect(removeNode(tree(), 'root').id).toBe('root')
  })

  it('changes nothing for an id that is not there', () => {
    expect(ids(removeNode(tree(), 'nope'))).toEqual(ids(tree()))
  })
})

describe('isDescendant', () => {
  it('is true for a child', () => {
    expect(isDescendant(tree(), 'a', 'a1')).toBe(true)
  })

  it('is true for a deeper descendant', () => {
    const deep = n('root', [n('a', [n('a1', [n('a1x')])])])
    expect(isDescendant(deep, 'a', 'a1x')).toBe(true)
  })

  it('is false for a sibling', () => {
    expect(isDescendant(tree(), 'a', 'b')).toBe(false)
  })

  it('is false for a node against itself', () => {
    // This is the guard that stops a drag dropping a node inside itself.
    expect(isDescendant(tree(), 'a', 'a')).toBe(false)
  })

  it('is false when the ancestor does not exist', () => {
    expect(isDescendant(tree(), 'nope', 'a1')).toBe(false)
  })
})

describe('insertAfter', () => {
  it('places the node directly after its sibling', () => {
    const out = insertAfter(tree(), 'a1', n('mid'))
    expect(findNode(out, 'a')?.children.map(c => c.id)).toEqual([
      'a1',
      'mid',
      'a2',
    ])
  })

  it('appends when the sibling is last', () => {
    const out = insertAfter(tree(), 'b', n('c'))
    expect(out.children.map(c => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('changes nothing for a sibling that is not there', () => {
    expect(ids(insertAfter(tree(), 'nope', n('x')))).toEqual(ids(tree()))
  })
})

describe('insertBefore', () => {
  it('places the node directly before its sibling', () => {
    const out = insertBefore(tree(), 'a2', n('mid'))
    expect(findNode(out, 'a')?.children.map(c => c.id)).toEqual([
      'a1',
      'mid',
      'a2',
    ])
  })

  it('prepends when the sibling is first', () => {
    const out = insertBefore(tree(), 'a', n('z'))
    expect(out.children.map(c => c.id)).toEqual(['z', 'a', 'b'])
  })

  it('changes nothing for a sibling that is not there', () => {
    expect(ids(insertBefore(tree(), 'nope', n('x')))).toEqual(ids(tree()))
  })
})

describe('a reorder, which is a remove then an insert', () => {
  it('moves a node after one of its former siblings', () => {
    const moved = insertAfter(removeNode(tree(), 'a1'), 'a2', n('a1'))

    expect(findNode(moved, 'a')?.children.map(c => c.id)).toEqual(['a2', 'a1'])
  })

  it('moves a node into another branch', () => {
    const moved = insertChild(removeNode(tree(), 'a1'), 'b', n('a1'))

    expect(findNode(moved, 'b')?.children.map(c => c.id)).toEqual(['a1'])
    expect(findNode(moved, 'a')?.children.map(c => c.id)).toEqual(['a2'])
  })
})

describe('collectDomIds', () => {
  it('counts each DOM id it finds', () => {
    const withIds = n('root', [
      n('a', [], { id: 'intro' }),
      n('b', [], { id: 'intro' }),
      n('c', [], { id: 'outro' }),
    ])

    const counts = collectDomIds(withIds)

    expect(counts.get('intro')).toBe(2)
    expect(counts.get('outro')).toBe(1)
  })

  it('ignores nodes with no id', () => {
    expect(collectDomIds(tree()).size).toBe(0)
  })

  it('ignores an empty id, which means unset', () => {
    expect(collectDomIds(n('root', [n('a', [], { id: '' })])).size).toBe(0)
  })

  it('ignores a non-string id', () => {
    expect(collectDomIds(n('root', [n('a', [], { id: 7 })])).size).toBe(0)
  })

  it('counts ids at any depth', () => {
    const deep = n('root', [n('a', [n('a1', [], { id: 'x' })], { id: 'x' })])
    expect(collectDomIds(deep).get('x')).toBe(2)
  })
})
