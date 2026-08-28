import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadGraph } from '@/lib/workflow/workflow-graph'

const DBAL = 'http://dbal.test'
const rows = (data: unknown[]) =>
  new Response(JSON.stringify({ data: { data } }), { status: 200 })

const stub = (
  nodes: unknown[],
  params: unknown[] = [],
  edges: unknown[] = []
) =>
  vi.stubGlobal('fetch', (url: string) => {
    if (url.includes('WorkflowNodeParam')) return Promise.resolve(rows(params))
    if (url.includes('WorkflowEdge')) return Promise.resolve(rows(edges))
    return Promise.resolve(rows(nodes))
  })

afterEach(() => {
  vi.unstubAllGlobals()
})

const node = (over: Record<string, unknown> = {}) => ({
  id: 'n1',
  nodeKey: 'Start',
  name: 'Start',
  type: 'trigger',
  ...over,
})

describe('loadGraph', () => {
  it('returns an empty graph when there is nothing stored', async () => {
    stub([])
    await expect(loadGraph(DBAL, 'system', 'w1')).resolves.toEqual({
      nodes: [],
      edges: {},
    })
  })

  it('rebuilds a node from its row', async () => {
    stub([node({ positionX: 10, positionY: 20, typeVersion: 2 })])

    const { nodes } = await loadGraph(DBAL, 'system', 'w1')

    expect(nodes[0]).toMatchObject({
      id: 'Start',
      name: 'Start',
      type: 'trigger',
      typeVersion: 2,
      position: [10, 20],
    })
  })

  it('defaults a missing position and type version', async () => {
    stub([node()])
    const { nodes } = await loadGraph(DBAL, 'system', 'w1')

    // A node with no stored position belongs at the origin, not at NaN.
    expect(nodes[0]?.position).toEqual([0, 0])
    expect(nodes[0]?.typeVersion).toBe(1)
  })

  it('attaches parameters to the node that owns them', async () => {
    stub(
      [node()],
      [{ nodeId: 'n1', name: 'url', value: '/x', valueType: 'string' }]
    )

    const { nodes } = await loadGraph(DBAL, 'system', 'w1')

    expect(nodes[0]?.parameters).toEqual({ url: '/x' })
  })

  it('gives up cleanly when any of the three requests fails', async () => {
    vi.stubGlobal('fetch', (url: string) =>
      Promise.resolve(
        url.includes('WorkflowEdge')
          ? new Response('nope', { status: 500 })
          : rows([node()])
      )
    )

    // A half-loaded graph would render as a workflow missing its wiring,
    // which is worse than showing nothing.
    await expect(loadGraph(DBAL, 'system', 'w1')).resolves.toEqual({
      nodes: [],
      edges: {},
    })
  })
})
