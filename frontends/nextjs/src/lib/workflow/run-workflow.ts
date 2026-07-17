'use client'

import type { Workflow, WorkflowNode } from '@/workflow-editor'

export interface RunResult {
  logs: string[]
  output: Record<string, unknown>
  order: string[]
}

/**
 * Minimal client-side workflow runner. Data flows along connections; each node
 * merges its incoming data with its own config and passes it on. Enough to make
 * route→tree→workflow wiring real and to drive the point-and-click test runner.
 * The full multi-runtime engine (TS/Python/Go) lives server-side.
 */
export function runWorkflow(
  wf: Workflow,
  input: Record<string, unknown> = {},
): RunResult {
  const logs: string[] = []
  const order: string[] = []
  const outputs = new Map<string, Record<string, unknown>>()

  const incoming = new Map<string, number>()
  wf.nodes.forEach((n) => incoming.set(n.id, 0))
  wf.connections.forEach((c) =>
    incoming.set(c.targetNodeId, (incoming.get(c.targetNodeId) ?? 0) + 1))

  const byId = new Map(wf.nodes.map((n) => [n.id, n]))
  const indegree = new Map(incoming)
  const queue: WorkflowNode[] = wf.nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0)
  const first = wf.nodes[0]
  if (queue.length === 0 && first) queue.push(first)

  const seen = new Set<string>()
  while (queue.length > 0) {
    const node = queue.shift() as WorkflowNode
    if (seen.has(node.id)) continue
    seen.add(node.id)
    order.push(node.id)

    // Merge outputs of every node feeding this one, plus the run input.
    const feed = wf.connections
      .filter((c) => c.targetNodeId === node.id)
      .map((c) => outputs.get(c.sourceNodeId) ?? {})
    const inData = Object.assign({}, input, ...feed)
    const out = { ...inData, ...node.config }
    outputs.set(node.id, out)
    logs.push(`▶ ${node.name} (${node.type})`)

    for (const c of wf.connections.filter((c) => c.sourceNodeId === node.id)) {
      const d = (indegree.get(c.targetNodeId) ?? 1) - 1
      indegree.set(c.targetNodeId, d)
      const target = byId.get(c.targetNodeId)
      if (target && d <= 0) queue.push(target)
    }
  }

  // Result = merged outputs of leaf nodes (no outgoing connections).
  const hasOut = new Set(wf.connections.map((c) => c.sourceNodeId))
  const leaves = wf.nodes.filter((n) => !hasOut.has(n.id) && outputs.has(n.id))
  const output = Object.assign({}, ...(leaves.length > 0 ? leaves : wf.nodes)
    .map((n) => outputs.get(n.id) ?? {}))

  return { logs, output, order }
}
