import { afterEach, describe, expect, it, vi } from 'vitest'

import type { WorkflowNode } from '@/workflow-editor'
import { saveGraph } from '@/lib/workflow/workflow-graph'

const DBAL = 'http://dbal.test'

interface Call {
  url: string
  method: string
  body: unknown
}

const record = (existing: unknown[] = []): Call[] => {
  const calls: Call[] = []
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    calls.push({
      url,
      method: init?.method ?? 'GET',
      body:
        typeof init?.body === 'string'
          ? (JSON.parse(init.body) as unknown)
          : undefined,
    })
    return Promise.resolve(
      new Response(JSON.stringify({ data: { data: existing } }), {
        status: 200,
      })
    )
  })
  return calls
}

afterEach(() => {
  vi.unstubAllGlobals()
})

// The editor's own node, which is what saveGraph is handed. This used to
// build the DBAL row shape instead -- `parameters` and a [x, y] tuple --
// so the test agreed with the declared type and neither agreed with the
// only caller.
const node = (id: string): WorkflowNode => ({
  id,
  name: id,
  type: 'trigger',
  position: { x: 0, y: 0 },
  config: {},
  inputs: ['main'],
  outputs: ['main'],
})

describe('saveGraph', () => {
  it('clears what was there before writing the new graph', async () => {
    const calls = record([{ id: 'old-1' }])

    await saveGraph(DBAL, 'system', 'w1', [node('Start')], [])

    // A republish replaces the graph; leaving old rows would merge two
    // versions of a workflow into one.
    const deletes = calls.filter(c => c.method === 'DELETE')
    expect(deletes.length).toBeGreaterThan(0)
    expect(deletes[0]?.url).toContain('old-1')
  })

  it('writes a row per node', async () => {
    const calls = record()

    await saveGraph(DBAL, 'system', 'w1', [node('A'), node('B')], [])

    const posted = calls.filter(
      c => c.method === 'POST' && c.url.endsWith('/WorkflowNode')
    )
    expect(posted).toHaveLength(2)
  })

  it('reports success', async () => {
    record()
    await expect(
      saveGraph(DBAL, 'system', 'w1', [node('A')], [])
    ).resolves.toBe(true)
  })
})
