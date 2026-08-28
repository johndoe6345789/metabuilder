import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadTree } from '@/lib/tenant/page-tree'

const DBAL = 'http://dbal.test'
const rows = (data: unknown[]) =>
  new Response(JSON.stringify({ data: { data } }), { status: 200 })

const withProp = (prop: Record<string, unknown>) => {
  vi.stubGlobal('fetch', (url: string) =>
    Promise.resolve(
      url.includes('PageTreeProp')
        ? rows([{ nodeId: 'root', ...prop }])
        : rows([
            { id: 'root', parentId: null, type: 'container', sortOrder: 0 },
          ])
    )
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadTree property types', () => {
  it('reads a number back as a number', async () => {
    withProp({ name: 'gap', value: '12', valueType: 'number' })
    const tree = await loadTree(DBAL, 'system', 't1')
    expect(tree?.props.gap).toBe(12)
  })

  it('reads a boolean back as a boolean', async () => {
    withProp({ name: 'on', value: 'true', valueType: 'boolean' })
    const tree = await loadTree(DBAL, 'system', 't1')
    expect(tree?.props.on).toBe(true)
  })

  it('treats any other boolean text as false', async () => {
    withProp({ name: 'on', value: 'yes', valueType: 'boolean' })
    const tree = await loadTree(DBAL, 'system', 't1')
    expect(tree?.props.on).toBe(false)
  })

  it('keeps a number that will not parse as its text', async () => {
    // Better a visible "abc" than NaN spreading through the render.
    withProp({ name: 'gap', value: 'abc', valueType: 'number' })
    const tree = await loadTree(DBAL, 'system', 't1')
    expect(tree?.props.gap).toBe('abc')
  })

  it('treats a null value as an empty string', async () => {
    withProp({ name: 'text', value: null, valueType: 'string' })
    const tree = await loadTree(DBAL, 'system', 't1')
    expect(tree?.props.text).toBe('')
  })
})
