import { describe, expect, it } from 'vitest'
import { dropWhere } from './component-tree-drop'

function eventAt(clientY: number, top = 0, height = 100) {
  return {
    clientY,
    currentTarget: {
      getBoundingClientRect: () =>
        ({ top, height }) as DOMRect,
    },
  }
}

describe('dropWhere', () => {
  it('reports "before" near the top edge', () => {
    expect(dropWhere(eventAt(10))).toBe('before')
  })

  it('reports "after" near the bottom edge', () => {
    expect(dropWhere(eventAt(95))).toBe('after')
  })

  it('reports "into" in the middle', () => {
    expect(dropWhere(eventAt(50))).toBe('into')
  })

  it('is relative to the target box, not the viewport', () => {
    expect(dropWhere(eventAt(210, 200, 100))).toBe('before')
    expect(dropWhere(eventAt(295, 200, 100))).toBe('after')
  })

  it('falls back to "into" for a zero-height box', () => {
    expect(dropWhere(eventAt(50, 0, 0))).toBe('into')
  })
})
