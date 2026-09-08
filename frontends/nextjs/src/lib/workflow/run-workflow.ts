'use client'

import type { Workflow, WorkflowNode } from '@/workflow-editor'
import {
  newDryRunState,
  type DryRunEffect,
  type Row,
} from './dry-run/dry-run-state'
import { isRunnableStep, runStep } from './dry-run/run-step'

export interface RunResult {
  logs: string[]
  output: Record<string, unknown>
  order: string[]
  /** What the run asked the page to do, in the wire shape the daemon
   *  sends back and page-effects.ts applies. */
  effects: DryRunEffect[]
  /** The rows it would have written, per entity. Nothing was written. */
  rows: Record<string, Row[]>
  /** Set when "Only carry on if" stopped the run before the end. */
  stopped: { step: string; because: string } | null
}

/**
 * Client-side workflow runner: the order comes from the arrows drawn
 * between the steps, and each step is actually run -- ids are made,
 * conditions stop the run, `${name}` references resolve, page steps are
 * recorded as effects and row steps go to an in-memory store, so a run
 * writes nothing and touches no page. The full multi-runtime engine
 * (TS/Python/Go) lives server-side; this is what the Tests tab checks a
 * workflow with and what Preview shows.
 *
 * Every step used to be treated the same way -- merge its config into the
 * data and move on -- so "Only carry on if" carried on and "Make an id"
 * made nothing. A node type this does not know still behaves that way,
 * which is what the editor's stock palette (Webhook, Code, Slack) needs;
 * those are unrunnable by the daemon too. See runnable-steps.ts.
 */
export function runWorkflow(
  wf: Workflow,
  input: Record<string, unknown> = {},
  now: number = Date.now()
): RunResult {
  const state = newDryRunState(input, now)
  const logs = state.logs
  const order: string[] = []
  const outputs = new Map<string, Record<string, unknown>>()

  const incoming = new Map<string, number>()
  wf.nodes.forEach(n => incoming.set(n.id, 0))
  wf.connections.forEach(c =>
    incoming.set(c.targetNodeId, (incoming.get(c.targetNodeId) ?? 0) + 1)
  )

  const byId = new Map(wf.nodes.map(n => [n.id, n]))
  const indegree = new Map(incoming)
  const queue: WorkflowNode[] = wf.nodes.filter(
    n => (incoming.get(n.id) ?? 0) === 0
  )
  // .at() is typed `string | undefined` under both tsconfig variants
  // (unlike indexing wf.nodes directly), and an empty node list genuinely
  // has no first element at runtime.
  const first = wf.nodes.at(0)
  if (queue.length === 0 && first !== undefined) queue.push(first)

  const seen = new Set<string>()
  while (queue.length > 0) {
    const node = queue.shift() as WorkflowNode
    if (seen.has(node.id)) continue
    seen.add(node.id)
    order.push(node.id)

    // Merge outputs of every node feeding this one, plus the run input.
    const feed = wf.connections
      .filter(c => c.targetNodeId === node.id)
      .map(c => outputs.get(c.sourceNodeId) ?? {})
    // Object.assign's TS types collapse to `any` once a spread array joins
    // the fixed arguments; reduce over object spread keeps this typed.
    const inData = feed.reduce<Record<string, unknown>>(
      (acc, f) => ({ ...acc, ...f }),
      { ...input }
    )
    logs.push(`▶ ${node.name} (${node.type})`)
    // A known step runs; anything else keeps the old behaviour of merging
    // its config into the data, which is all the stock palette can do.
    const config = node.config as Row
    const ran = isRunnableStep(node.type)
    const out = ran ? inData : { ...inData, ...config }
    outputs.set(node.id, out)
    if (ran && !runStep(state, node.type, config, node.name)) break

    for (const c of wf.connections.filter(c => c.sourceNodeId === node.id)) {
      const d = (indegree.get(c.targetNodeId) ?? 1) - 1
      indegree.set(c.targetNodeId, d)
      const target = byId.get(c.targetNodeId)
      if (target !== undefined && d <= 0) queue.push(target)
    }
  }

  // Result = merged outputs of leaf nodes (no outgoing connections).
  const hasOut = new Set(wf.connections.map(c => c.sourceNodeId))
  const leaves = wf.nodes.filter(n => !hasOut.has(n.id) && outputs.has(n.id))
  const output = (leaves.length > 0 ? leaves : wf.nodes).reduce<
    Record<string, unknown>
  >((acc, n) => ({ ...acc, ...(outputs.get(n.id) ?? {}) }), {})

  // `event` is what came in, not what the run produced, so it stays out
  // of the output a test matches against.
  const { event: _event, ...named } = state.scope
  return {
    logs,
    // The values steps named sit alongside the merged data, so a test can
    // assert on `${new_id}` as easily as on what a stock node passed on.
    output: { ...output, ...named },
    order,
    effects: state.effects,
    rows: state.rows,
    stopped: state.stopped,
  }
}
