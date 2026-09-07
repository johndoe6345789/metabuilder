import { describe, expect, it } from 'vitest'

import { applyWorkflowBql } from './apply-workflow'
import type { BqlSentence } from './types'

const workflow = (name: string): BqlSentence => ({
  kind: 'workflow',
  line: 1,
  name,
})
const step = (stepName: string, line: number): BqlSentence => ({
  kind: 'step',
  line,
  stepName,
  attrs: [],
})

/**
 * "then" means after that.
 *
 * A workflow with no connections has nothing that says which step runs
 * first: the daemon topologically sorts the graph, and with no edges every
 * node is equally ready, so the order is whatever order the rows came back
 * in. That happens to be insertion order today, which is why a script's
 * steps appeared to run in the order written -- an accident of the
 * database, not something the script said.
 */
describe('the order a script wrote its steps in', () => {
  it('chains each step to the one before it', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('Book a repair'),
      step('Write a note to the log', 2),
      step('Say something', 3),
      step('Go to a page', 4),
    ])
    const ids = built?.nodes.map(n => n.id) ?? []

    const links = built?.connections.map(c => [c.sourceNodeId, c.targetNodeId])
    expect(links).toEqual([
      [ids[0], ids[1]],
      [ids[1], ids[2]],
    ])
  })

  it('leaves a single step unconnected', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('Say hello'),
      step('Say something', 2),
    ])

    expect(built?.connections).toEqual([])
  })

  it('gives each connection an id of its own', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('Three'),
      step('Say something', 2),
      step('Show something', 3),
      step('Hide something', 4),
    ])
    const ids = (built?.connections ?? []).map(c => c.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})
