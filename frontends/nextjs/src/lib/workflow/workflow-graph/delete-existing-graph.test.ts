import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteExistingGraph } from './delete-existing-graph'

const deleted: string[] = []

const rows = (entity: string) =>
  entity === 'WorkflowNode'
    ? [{ id: 'wf1__n1' }]
    : entity === 'WorkflowEdge'
      ? [{ id: 'wf1__n1__main__n2' }]
      : [{ id: 'wf1__n1__text' }]

beforeEach(() => {
  deleted.length = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const href = String(url)
      if (init?.method === 'DELETE') {
        deleted.push(href.split('/core/')[1] ?? href)
        return { ok: true } as Response
      }
      const entity = /\/core\/(\w+)/.exec(href)?.[1] ?? ''
      return {
        ok: true,
        json: async () => ({ data: { data: rows(entity) } }),
      } as Response
    })
  )
})

/**
 * Params do not cascade. The schema says `on_delete: cascade` on the
 * relation, and only the Prisma generator reads that -- the SQL adapters
 * create no foreign keys at all, so nothing removes a param when its node
 * goes. It never showed because no param row had ever been written.
 *
 * Left behind, they are worse than litter: (nodeId, name, sortOrder) is a
 * unique index, so re-publishing from the editor -- where a node keeps its
 * id -- 409s on every param, saveNodes returns false, and the tab says the
 * workflow was saved but its steps were not.
 */
describe('deleteExistingGraph', () => {
  it('clears the parameters as well as the nodes and edges', async () => {
    await deleteExistingGraph('http://d/t/core', 'wf1')

    expect(deleted).toContain('WorkflowNodeParam/wf1__n1__text')
    expect(deleted).toContain('WorkflowNode/wf1__n1')
    expect(deleted).toContain('WorkflowEdge/wf1__n1__main__n2')
  })

  it('clears the parameters before the nodes that own them', async () => {
    await deleteExistingGraph('http://d/t/core', 'wf1')

    const param = deleted.findIndex(d => d.startsWith('WorkflowNodeParam/'))
    const node = deleted.findIndex(d => d.startsWith('WorkflowNode/'))
    expect(param).toBeLessThan(node)
  })
})
