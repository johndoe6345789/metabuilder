import { describe, expect, it } from 'vitest'

import { repeatKey, repeatSource, scopedContext } from './repeat-source'

const context = { vault: {} as never, view: {} as never }

describe('repeatSource', () => {
  it('resolves an array binding', () => {
    expect(
      repeatSource(
        { component: 'Repeat', source: { $path: 'items' }, item: 'x' } as never,
        { ...context, items: [1, 2, 3] }
      )
    ).toEqual([1, 2, 3])
  })

  it('is null when the node declares no source', () => {
    expect(repeatSource({ component: 'Repeat', item: 'x' } as never, context)).toBeNull()
  })

  it('is null when the node declares no item name', () => {
    expect(
      repeatSource(
        { component: 'Repeat', source: { $path: 'items' } } as never,
        { ...context, items: [1] }
      )
    ).toBeNull()
  })

  it('is null when the resolved source is not an array', () => {
    expect(
      repeatSource(
        { component: 'Repeat', source: { $path: 'items' }, item: 'x' } as never,
        { ...context, items: 'not an array' }
      )
    ).toBeNull()
  })
})

describe('scopedContext', () => {
  it('binds the loop variable and the index', () => {
    expect(scopedContext({ item: 'entry' }, context, { id: 'e1' }, 2)).toEqual({
      ...context,
      entry: { id: 'e1' },
      index: 2,
    })
  })

  it('keeps the outer context reachable alongside the loop variable', () => {
    const outer = { ...context, tenant: 'acme' }
    expect(scopedContext({ item: 'entry' }, outer, 'x', 0).tenant).toBe('acme')
  })
})

describe('repeatKey', () => {
  it('falls back to the index when the node declares no key', () => {
    expect(repeatKey({}, context, 3)).toBe(3)
  })

  it('evaluates the declared key expression', () => {
    expect(
      repeatKey({ key: { $path: 'entry.id' } }, { ...context, entry: { id: 'e7' } }, 0)
    ).toBe('e7')
  })
})
