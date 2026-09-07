/**
 * Turning workflow sentences into a workflow.
 *
 * The page half of BQL builds a tree; this builds a graph. Kept apart
 * from apply.ts because they share only the parser: a script is one or
 * the other, and mixing the two in one function would mean every reader
 * working out which half they were in.
 *
 * Step names are resolved against the same RUNNABLE_STEPS the palette
 * offers, so a script can only ask for a step the daemon implements --
 * the parser deliberately does not know which those are.
 */

import {
  generateConnectionId,
  type Connection,
  type NodeType,
} from '@/workflow-editor'
import { RUNNABLE_STEPS } from '../../workflow/runnable-steps'
import { makeNode, nextStepPosition } from '../../workflow/use-workflow-editor/make-node'
import type { BqlAttr, BqlSentence } from './types'
import type { BqlError } from './apply'

export interface BqlWorkflow {
  name: string
  /** "<Entity>.created", or empty for one nothing triggers. */
  trigger: string
  /** Which form it answers, or empty for any of them. */
  formName: string
  nodes: ReturnType<typeof makeNode>[]
  /**
   * Each step joined to the one written after it.
   *
   * "then" means after that, and without saying so the daemon has nothing
   * to order the steps by: it topologically sorts the graph, and with no
   * edges every node is equally ready. The order a script ran in was the
   * order its rows happened to come back -- insertion order today, and
   * nothing promises that tomorrow.
   */
  connections: Connection[]
  /** True when the script asked for it to be published. */
  publish: boolean
}

export interface ApplyWorkflowResult {
  workflow: BqlWorkflow | null
  errors: BqlError[]
}

/** A step by the name the palette shows, ignoring case and spacing. */
function stepByName(name: string): NodeType | undefined {
  const wanted = name.trim().toLowerCase().replace(/\s+/g, ' ')
  return RUNNABLE_STEPS.find(
    s => s.name.toLowerCase().replace(/\s+/g, ' ') === wanted
  )
}

/**
 * Put @p value at @p path, creating the objects along the way.
 *
 * `data.name` means a column called name inside the step's data, not a
 * parameter literally called "data.name" -- which is what a flat write
 * would produce, and the daemon would look for `data` and find nothing.
 */
function setPath(
  into: Record<string, unknown>,
  path: string[],
  value: string
): void {
  // .at() is `string | undefined`; destructuring a string[] is not,
  // unless noUncheckedIndexedAccess is on -- and it is not everywhere here.
  const head = path.at(0)
  const rest = path.slice(1)
  if (head === undefined) return
  if (rest.length === 0) {
    into[head] = value
    return
  }
  const existing = into[head]
  // Anything already there that is not an object is replaced rather than
  // written into: a default of '' cannot hold a field.
  const nested =
    typeof existing === 'object' && existing !== null && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {}
  into[head] = nested
  setPath(nested, rest, value)
}

/** A step's parameters, keyed as the daemon expects them. */
function configFrom(step: NodeType, attrs: BqlAttr[]): Record<string, unknown> {
  const config: Record<string, unknown> = { ...step.defaultConfig }
  for (const attr of attrs) setPath(config, attr.key.split('.'), attr.value)
  return config
}

/** True when this script is describing a workflow rather than a page. */
export function isWorkflowScript(sentences: BqlSentence[]): boolean {
  return sentences.some(s => s.kind === 'workflow')
}

/**
 * Build a workflow from @p sentences.
 *
 * Either every line applies or none does, as with the page half: a
 * half-built workflow published because one step was misspelled is worse
 * than one that refused and said which line.
 */
export function applyWorkflowBql(
  sentences: BqlSentence[]
): ApplyWorkflowResult {
  const errors: BqlError[] = []
  let name = ''
  let trigger = ''
  let formName = ''
  let publish = false
  const nodes: ReturnType<typeof makeNode>[] = []
  const connections: Connection[] = []

  for (const sentence of sentences) {
    const line = sentence.line
    if (sentence.kind === 'workflow') {
      if (name !== '') {
        errors.push({
          line,
          message: 'A script builds one workflow, and this one already ' +
            `started "${name}".`,
        })
        continue
      }
      name = sentence.name
    } else if (sentence.kind === 'trigger') {
      trigger = sentence.event
      formName = sentence.form ?? ''
    } else if (sentence.kind === 'step') {
      const step = stepByName(sentence.stepName)
      if (step === undefined) {
        errors.push({
          line,
          message: `No step called "${sentence.stepName}"`,
        })
        continue
      }
      const node = makeNode(step, nextStepPosition(nodes.length))
      const previous = nodes.at(-1)
      nodes.push({ ...node, config: configFrom(step, sentence.attrs) })
      if (previous !== undefined) {
        connections.push({
          id: generateConnectionId(),
          sourceNodeId: previous.id,
          sourceOutput: 'main',
          targetNodeId: node.id,
          targetInput: 'main',
        })
      }
    } else if (sentence.kind === 'publishWorkflow') {
      publish = true
    } else {
      // The page half. Saying so beats ignoring it: a script that mixes
      // the two has a mistake in it somewhere.
      errors.push({
        line,
        message:
          'This line builds a page, and this script is building a ' +
          'workflow.',
      })
    }
  }

  if (name === '' && errors.length === 0) {
    errors.push({
      line: 1,
      message: 'Start with: start a new workflow called "..."',
    })
  }

  if (errors.length > 0) return { workflow: null, errors }
  return {
    workflow: { name, trigger, formName, nodes, connections, publish },
    errors: [],
  }
}
