import { describe, expect, it } from 'vitest'

import { runWorkflow } from './run-workflow'
import type { Workflow } from '@/workflow-editor'

const node = (id: string, config: Record<string, unknown> = {}) => ({
  id,
  type: 'action',
  name: id,
  position: { x: 0, y: 0 },
  config,
  inputs: ['main'],
  outputs: ['main'],
})

const link = (source: string, target: string) => ({
  id: `${source}->${target}`,
  sourceNodeId: source,
  sourceOutput: 'main',
  targetNodeId: target,
  targetInput: 'main',
})

const wf = (
  nodes: ReturnType<typeof node>[],
  connections: ReturnType<typeof link>[] = []
): Workflow =>
  ({
    id: 'wf',
    name: 'W',
    description: '',
    nodes,
    connections,
    createdAt: '',
    updatedAt: '',
  }) as never

describe('runWorkflow', () => {
  describe('execution order', () => {
    it('runs a chain in dependency order', () => {
      const result = runWorkflow(
        wf([node('a'), node('b'), node('c')], [link('a', 'b'), link('b', 'c')])
      )

      expect(result.order).toEqual(['a', 'b', 'c'])
    })

    it('runs a node only after every input has run', () => {
      // c must wait for both a and b, not fire on the first one to arrive.
      const result = runWorkflow(
        wf([node('a'), node('b'), node('c')], [link('a', 'c'), link('b', 'c')])
      )

      expect(result.order.indexOf('c')).toBe(2)
    })

    it('runs each node once', () => {
      const result = runWorkflow(
        wf([node('a'), node('b'), node('c')], [link('a', 'b'), link('a', 'c')])
      )

      expect(new Set(result.order).size).toBe(result.order.length)
    })

    it('runs a single node with no connections', () => {
      expect(runWorkflow(wf([node('a')])).order).toEqual(['a'])
    })

    it('runs every root of a disconnected graph', () => {
      const result = runWorkflow(wf([node('a'), node('b')]))

      expect(result.order.sort()).toEqual(['a', 'b'])
    })

    it('does nothing with no nodes', () => {
      const result = runWorkflow(wf([]))

      expect(result.order).toEqual([])
      expect(result.output).toEqual({})
    })
  })

  describe('cycles', () => {
    it('starts somewhere rather than stalling when every node has an input', () => {
      // A cycle leaves no zero-indegree node; falling back to the first
      // node means a mistake in the editor still produces a run.
      const result = runWorkflow(
        wf([node('a'), node('b')], [link('a', 'b'), link('b', 'a')])
      )

      expect(result.order.length).toBeGreaterThan(0)
    })

    it('terminates rather than looping forever', () => {
      const result = runWorkflow(
        wf(
          [node('a'), node('b'), node('c')],
          [link('a', 'b'), link('b', 'c'), link('c', 'a')]
        )
      )

      expect(new Set(result.order).size).toBe(result.order.length)
    })
  })

  describe('data flow', () => {
    it('passes the run input to the first node', () => {
      const result = runWorkflow(wf([node('a')]), { seed: 1 })

      expect(result.output).toMatchObject({ seed: 1 })
    })

    it('carries a value along a chain', () => {
      const result = runWorkflow(
        wf([node('a', { value: 'from-a' }), node('b')], [link('a', 'b')])
      )

      expect(result.output).toMatchObject({ value: 'from-a' })
    })

    it('lets a node config override what it received', () => {
      const result = runWorkflow(
        wf(
          [node('a', { value: 'from-a' }), node('b', { value: 'from-b' })],
          [link('a', 'b')]
        )
      )

      expect(result.output.value).toBe('from-b')
    })

    it('merges both branches at a join', () => {
      const result = runWorkflow(
        wf(
          [node('a', { x: 1 }), node('b', { y: 2 }), node('c')],
          [link('a', 'c'), link('b', 'c')]
        )
      )

      expect(result.output).toMatchObject({ x: 1, y: 2 })
    })

    it('reports the merged leaves, not every node', () => {
      const result = runWorkflow(
        wf(
          [node('a', { only: 'a' }), node('b', { only: 'b' })],
          [link('a', 'b')]
        )
      )

      // b is the only leaf, so its value wins.
      expect(result.output.only).toBe('b')
    })

    it('falls back to every node when there are no leaves', () => {
      const result = runWorkflow(
        wf([node('a', { x: 1 }), node('b')], [link('a', 'b'), link('b', 'a')])
      )

      expect(result.output).toHaveProperty('x')
    })
  })

  describe('logs', () => {
    it('names each node it ran', () => {
      const result = runWorkflow(wf([node('a'), node('b')], [link('a', 'b')]))

      expect(result.logs).toHaveLength(2)
      expect(result.logs[0]).toContain('a')
    })

    it('includes the node type', () => {
      expect(runWorkflow(wf([node('a')])).logs[0]).toContain('action')
    })
  })
})
