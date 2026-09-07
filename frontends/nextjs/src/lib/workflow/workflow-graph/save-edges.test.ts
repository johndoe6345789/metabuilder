import { beforeEach, describe, expect, it, vi } from 'vitest'

import { saveEdges } from './save-edges'

interface EdgeRow {
  id?: string
  sourceKey?: string
  targetKey?: string
  handle?: string
  sourceIndex?: number
  targetIndex?: number
}

const posted: EdgeRow[] = []

beforeEach(() => {
  posted.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      posted.push(JSON.parse(String(init?.body)) as EdgeRow)
      return { ok: true } as Response
    })
  )
})

const link = (from: string, to: string) => ({
  id: `${from}-${to}`,
  sourceNodeId: from,
  sourceOutput: 'main',
  targetNodeId: to,
  targetInput: 'main',
})

/**
 * The editor holds connections as a flat Connection[]; this used to be
 * typed as a nested source -> handle -> index adjacency and reached only
 * through a double-unknown cast. Object.entries then walked the array,
 * then each connection's own fields, then the characters of their string
 * values -- so one link someone drew became twelve WorkflowEdge rows with
 * sourceKey "0", handles called "id" and "sourceOutput", and targetKey
 * undefined. It returned true, and the daemon drops edges naming nodes it
 * does not have, so nothing ever said the connections were lost.
 */
describe('saveEdges', () => {
  it('writes one row per connection', async () => {
    expect(await saveEdges('http://d', 't', 'wf1', [link('a', 'b')])).toBe(true)

    expect(posted).toHaveLength(1)
    expect(posted[0]).toMatchObject({
      sourceKey: 'a',
      targetKey: 'b',
      handle: 'main',
      sourceIndex: 0,
      targetIndex: 0,
    })
  })

  it('keeps every link of a chain', async () => {
    await saveEdges('http://d', 't', 'wf1', [link('a', 'b'), link('b', 'c')])

    expect(posted.map(r => `${r.sourceKey}->${r.targetKey}`)).toEqual([
      'a->b',
      'b->c',
    ])
  })

  it('gives each row an id of its own', async () => {
    await saveEdges('http://d', 't', 'wf1', [link('a', 'b'), link('b', 'c')])

    const ids = posted.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('writes nothing for a workflow with no connections', async () => {
    expect(await saveEdges('http://d', 't', 'wf1', [])).toBe(true)
    expect(posted).toHaveLength(0)
  })
})
