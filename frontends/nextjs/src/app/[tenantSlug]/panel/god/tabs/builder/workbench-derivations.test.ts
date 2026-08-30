import { describe, expect, it } from 'vitest'

import {
  BLANK_TREE,
  currentTreeValue,
  hasDuplicateId,
  treesWithContent,
} from './workbench-derivations'

const tree = (path: string, hasTree = true) => ({
  path,
  title: path,
  hasTree,
})

describe('currentTreeValue', () => {
  const trees = [tree('/a'), tree('/b')]

  it('is the target path when it names a saved tree', () => {
    expect(currentTreeValue(trees, { path: '/a' })).toBe('/a')
  })

  // Selecting a value the <select> does not offer would silently show the
  // browser's own first option instead of the intended blank state.
  it('falls back to blank for a path that is not in the saved list', () => {
    expect(currentTreeValue(trees, { path: '/ghost' })).toBe(BLANK_TREE)
  })

  it('falls back to blank for an empty path', () => {
    expect(currentTreeValue(trees, { path: '' })).toBe(BLANK_TREE)
  })

  it('falls back to blank when there are no saved trees at all', () => {
    expect(currentTreeValue([], { path: '/a' })).toBe(BLANK_TREE)
  })
})

describe('treesWithContent', () => {
  it('keeps only pages that actually have a tree', () => {
    expect(
      treesWithContent([tree('/a', true), tree('/b', false)]).map(t => t.path)
    ).toEqual(['/a'])
  })

  it('is empty when none do', () => {
    expect(treesWithContent([tree('/a', false)])).toEqual([])
  })
})

describe('hasDuplicateId', () => {
  it('is false when the selected node has no id', () => {
    expect(hasDuplicateId({ props: {} }, new Map())).toBe(false)
  })

  it('is false when the id is unique', () => {
    expect(
      hasDuplicateId({ props: { id: 'hero' } }, new Map([['hero', 1]]))
    ).toBe(false)
  })

  it('is true when the id appears more than once', () => {
    expect(
      hasDuplicateId({ props: { id: 'hero' } }, new Map([['hero', 2]]))
    ).toBe(true)
  })

  it('is false for an id absent from the count map', () => {
    expect(hasDuplicateId({ props: { id: 'hero' } }, new Map())).toBe(false)
  })

  it('is false for a non-string id', () => {
    expect(
      hasDuplicateId(
        { props: { id: 7 as unknown as string } },
        new Map([['7', 2]])
      )
    ).toBe(false)
  })
})
