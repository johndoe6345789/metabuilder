import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  WorkflowLoaderV2,
  getWorkflowLoader,
  resetWorkflowLoader,
} from './workflow-loader-v2'
import type { WorkflowDefinition } from './workflow-loader-v2'

const node = (id: string, name = id) => ({
  id,
  name,
  nodeType: 'action',
  parameters: {},
  position: [0, 0],
})

const wf = (over: Record<string, unknown> = {}): WorkflowDefinition =>
  ({
    id: 'wf1',
    tenantId: 't1',
    name: 'W',
    nodes: [node('n1')],
    connections: {},
    variables: {},
    ...over,
  }) as never

const loader = (opts = {}) =>
  new WorkflowLoaderV2({ enableLogging: false, ...opts })

describe('WorkflowLoaderV2', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    resetWorkflowLoader()
  })

  describe('required identity', () => {
    it('rejects a workflow with no id', async () => {
      await expect(loader().validateWorkflow(wf({ id: '' }))).rejects.toThrow(
        'must have an id'
      )
    })

    it('rejects a workflow with no tenantId', async () => {
      // Every query is tenant-scoped, so an untenanted workflow is unsafe.
      await expect(
        loader().validateWorkflow(wf({ tenantId: '' }))
      ).rejects.toThrow('must have a tenantId')
    })
  })

  describe('structure', () => {
    it('accepts a minimal valid workflow', async () => {
      const result = await loader().validateWorkflow(wf())

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it.each([
      ['no nodes array', { nodes: undefined }, 'nodes array'],
      ['an empty node list', { nodes: [] }, 'at least one node'],
      ['no connections object', { connections: undefined }, 'connections'],
    ])('reports %s as invalid', async (_label, over, message) => {
      const result = await loader().validateWorkflow(wf(over))

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain(message)
    })

    it('reports a failure as an error entry, not a throw', async () => {
      const result = await loader().validateWorkflow(wf({ nodes: [] }))

      expect(result.errors[0].code).toBe('VALIDATION_FAILED')
      expect(result.errors[0].severity).toBe('error')
    })
  })

  describe('nodes', () => {
    it.each([
      ['a missing id', [{ ...node('n1'), id: '' }], 'must have id'],
      ['a missing name', [{ ...node('n1'), name: '' }], 'must have name'],
      [
        'a missing nodeType',
        [{ ...node('n1'), nodeType: '' }],
        'must have nodeType',
      ],
      ['a duplicate id', [node('n1'), node('n1', 'other')], 'Duplicate node id'],
      [
        'a duplicate name',
        [node('n1'), node('n2', 'n1')],
        'Duplicate node name',
      ],
    ])('rejects %s', async (_label, nodes, message) => {
      const result = await loader().validateWorkflow(wf({ nodes }))

      expect(result.valid).toBe(false)
      expect(result.errors[0].message).toContain(message)
    })

    it('accepts distinct nodes', async () => {
      const result = await loader().validateWorkflow(
        wf({ nodes: [node('n1'), node('n2')] })
      )
      expect(result.valid).toBe(true)
    })
  })

  describe('connections', () => {
    it('rejects a source that is not a node', async () => {
      const result = await loader().validateWorkflow(
        wf({ connections: { ghost: {} } })
      )

      expect(result.errors[0].message).toContain(
        'Connection source node not found'
      )
    })

    it('rejects a target that is not a node', async () => {
      const result = await loader().validateWorkflow(
        wf({
          connections: { n1: { main: { 0: [{ node: 'ghost', input: 'a' }] } } },
        })
      )

      expect(result.errors[0].message).toContain(
        'Connection target node not found'
      )
    })

    it('accepts a connection between real nodes', async () => {
      const result = await loader().validateWorkflow(
        wf({
          nodes: [node('n1'), node('n2')],
          connections: { n1: { main: { 0: [{ node: 'n2', input: 'a' }] } } },
        })
      )

      expect(result.valid).toBe(true)
    })
  })

  describe('multi-tenant safety', () => {
    it('rejects a global-scope variable', async () => {
      // A global would leak across tenants sharing the engine.
      const result = await loader().validateWorkflow(
        wf({ variables: { shared: { scope: 'global' } } })
      )

      expect(result.errors[0].message).toContain('global scope')
    })

    it('accepts a workflow-scope variable', async () => {
      const result = await loader().validateWorkflow(
        wf({ variables: { local: { scope: 'workflow' } } })
      )

      expect(result.valid).toBe(true)
    })
  })

  describe('caching', () => {
    it('answers a repeat validation from cache', async () => {
      const l = loader()

      await l.validateWorkflow(wf())
      const second = await l.validateWorkflow(wf())

      expect(second._cacheHit).toBe(true)
    })

    it('does not reuse a cache entry after the workflow changes', async () => {
      const l = loader()

      await l.validateWorkflow(wf())
      const changed = await l.validateWorkflow(
        wf({ nodes: [node('n1'), node('n2')] })
      )

      expect(changed._cacheHit).toBeUndefined()
    })

    it('keeps tenants apart in the cache key', async () => {
      const l = loader()

      await l.validateWorkflow(wf())
      const other = await l.validateWorkflow(wf({ tenantId: 't2' }))

      expect(other._cacheHit).toBeUndefined()
    })

    it('forgets an invalidated workflow', async () => {
      const l = loader()

      await l.validateWorkflow(wf())
      l.invalidateCache('wf1', 't1')
      const again = await l.validateWorkflow(wf())

      expect(again._cacheHit).toBeUndefined()
    })

    it('clears everything on clearCache', async () => {
      const l = loader()

      await l.validateWorkflow(wf())
      l.clearCache()

      expect((await l.validateWorkflow(wf()))._cacheHit).toBeUndefined()
    })

    it('reports cache statistics', async () => {
      const l = loader()
      await l.validateWorkflow(wf())

      expect(l.getCacheStats()).toBeTruthy()
    })
  })

  describe('concurrency', () => {
    it('shares one in-flight validation between callers', async () => {
      const l = loader()

      const [a, b] = await Promise.all([
        l.validateWorkflow(wf()),
        l.validateWorkflow(wf()),
      ])

      expect(a.valid).toBe(b.valid)
      expect(l.getActiveValidationCount()).toBe(0)
    })

    it('has nothing active once settled', async () => {
      const l = loader()
      await l.validateWorkflow(wf())
      expect(l.getActiveValidationCount()).toBe(0)
    })
  })

  describe('validateBatch', () => {
    it('returns one result per workflow, in order', async () => {
      const results = await loader().validateBatch([
        wf({ id: 'a' }),
        wf({ id: 'b', nodes: [] }),
      ])

      expect(results).toHaveLength(2)
      expect(results[0].valid).toBe(true)
      expect(results[1].valid).toBe(false)
    })

    it('does not let one bad workflow sink the batch', async () => {
      const results = await loader().validateBatch([
        wf({ id: '' }),
        wf({ id: 'ok' }),
      ])

      expect(results).toHaveLength(2)
      expect(results[1].valid).toBe(true)
    })
  })

  describe('the shared loader', () => {
    it('hands back the same instance', () => {
      expect(getWorkflowLoader()).toBe(getWorkflowLoader())
    })

    it('builds a new one after a reset', () => {
      const first = getWorkflowLoader()
      resetWorkflowLoader()
      expect(getWorkflowLoader()).not.toBe(first)
    })
  })
})
