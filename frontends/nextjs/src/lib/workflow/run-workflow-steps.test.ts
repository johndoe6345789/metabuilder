import { describe, expect, it } from 'vitest'

import { runWorkflow } from './run-workflow'
import type { Workflow } from '@/workflow-editor'

/**
 * Every step used to be run the same way -- merge its config into the
 * data and move on -- so "Only carry on if" carried on, "Make an id" made
 * nothing, and a passing test proved only that a config object carried
 * the keys the test asked for. These are the steps actually running.
 */

let seq = 0
const step = (type: string, config: Record<string, unknown> = {}) => ({
  id: `n${(seq += 1)}`,
  type,
  name: type,
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

/** The steps in the order given, wired one after another. */
const chain = (steps: ReturnType<typeof step>[]): Workflow =>
  ({
    id: 'wf',
    name: 'W',
    description: '',
    nodes: steps,
    connections: steps
      .slice(1)
      .map((s, i) => link(steps[i].id, s.id)),
    createdAt: '',
    updatedAt: '',
  }) as never

const NOW = 1751600000000

describe('making values', () => {
  it('makes an id under the name the founder chose', () => {
    const out = runWorkflow(
      chain([step('dbal.uuid', { outputs: { id: 'new_id' } })]),
      {},
      NOW
    ).output

    expect(out.new_id).toBe('dry-run-id-1')
  })

  // A real uuid would make any test touching this step pass once and fail
  // on the next run, which is worse than not running the step at all.
  it('hands out the same ids on every run', () => {
    const wf = chain([step('dbal.uuid', { outputs: { id: 'a' } })])
    expect(runWorkflow(wf, {}, NOW).output).toEqual(
      runWorkflow(wf, {}, NOW).output
    )
  })

  it('stamps the time the run was given, not the wall clock', () => {
    const out = runWorkflow(
      chain([step('dbal.timestamp', { outputs: { ts: 'now' } })]),
      {},
      NOW
    ).output

    expect(out.now).toBe(NOW)
  })

  it('remembers a value under a name', () => {
    const out = runWorkflow(
      chain([step('dbal.var.set', { name: 'greeting', value: 'hello' })]),
      {},
      NOW
    ).output

    expect(out.greeting).toBe('hello')
  })

  it('reads what triggered the run as ${event.data.…}', () => {
    const out = runWorkflow(
      chain([
        step('dbal.var.set', {
          name: 'who',
          value: 'from ${event.data.name}',
        }),
      ]),
      { data: { name: 'Rosa' } },
      NOW
    ).output

    expect(out.who).toBe('from Rosa')
  })

  it('reads a value an earlier step named', () => {
    const out = runWorkflow(
      chain([
        step('dbal.uuid', { outputs: { id: 'new_id' } }),
        step('dbal.var.set', { name: 'copy', value: '${new_id}' }),
      ]),
      {},
      NOW
    ).output

    expect(out.copy).toBe('dry-run-id-1')
  })
})

describe('rows', () => {
  it('writes a row, and reads it back by the id it was given', () => {
    const result = runWorkflow(
      chain([
        step('dbal.entity.create', {
          entity: 'Booking',
          data: { id: 'b1', who: '${event.data.name}' },
        }),
        step('dbal.entity.get', {
          entity: 'Booking',
          id: 'b1',
          outputs: { item: 'row' },
        }),
      ]),
      { data: { name: 'Rosa' } },
      NOW
    )

    expect(result.rows.Booking).toEqual([{ id: 'b1', who: 'Rosa' }])
    expect(result.output.row).toEqual({ id: 'b1', who: 'Rosa' })
  })

  it('counts the rows a filter matches', () => {
    const result = runWorkflow(
      chain([
        step('dbal.entity.create', { entity: 'B', data: { w: 'mon' } }),
        step('dbal.entity.create', { entity: 'B', data: { w: 'tue' } }),
        step('dbal.entity.count', {
          entity: 'B',
          filter: { w: 'mon' },
          outputs: { count: 'how_many' },
        }),
      ]),
      {},
      NOW
    )

    expect(result.output.how_many).toBe(1)
  })

  it('changes a row it wrote', () => {
    const result = runWorkflow(
      chain([
        step('dbal.entity.create', {
          entity: 'B',
          data: { id: 'b1', handled: 'no' },
        }),
        step('dbal.entity.update', {
          entity: 'B',
          id: 'b1',
          data: { handled: 'yes' },
        }),
      ]),
      {},
      NOW
    )

    expect(result.rows.B).toEqual([{ id: 'b1', handled: 'yes' }])
  })

  it('removes one', () => {
    const result = runWorkflow(
      chain([
        step('dbal.entity.create', { entity: 'B', data: { id: 'b1' } }),
        step('dbal.entity.remove', { entity: 'B', id: 'b1' }),
      ]),
      {},
      NOW
    )

    expect(result.rows.B).toEqual([])
  })

  // A test that really wrote would fill a founder's database with test
  // rows; one that wrote nothing could not check a workflow that reads
  // back what it just saved.
  it('finds the rows it wrote and no others', () => {
    const result = runWorkflow(
      chain([
        step('dbal.entity.create', { entity: 'B', data: { w: 'mon' } }),
        step('dbal.entity.list', {
          entity: 'B',
          filter: {},
          limit: 50,
          outputs: { items: 'rows' },
        }),
      ]),
      {},
      NOW
    )

    expect(result.output.rows).toHaveLength(1)
  })
})

describe('only carry on if', () => {
  const guarded = (config: Record<string, unknown>) =>
    runWorkflow(
      chain([
        step('dbal.stop.unless', config),
        step('dbal.entity.create', { entity: 'B', data: { id: 'b1' } }),
      ]),
      { data: { agreed: 'no' } },
      NOW
    )

  it('carries on when the condition holds', () => {
    const result = guarded({
      value: '${event.data.agreed}',
      is: 'equals',
      other: 'no',
    })

    expect(result.stopped).toBeNull()
    expect(result.rows.B).toHaveLength(1)
  })

  /** The steps after the condition are the ones that write. */
  it('stops the run, and the writing step never runs', () => {
    const result = guarded({
      value: '${event.data.agreed}',
      is: 'equals',
      other: 'yes',
    })

    expect(result.stopped?.step).toBe('dbal.stop.unless')
    expect(result.rows.B).toBeUndefined()
  })

  it('says why it stopped', () => {
    const result = guarded({ value: '', is: 'not empty' })
    expect(result.stopped?.because).toBe('it was empty')
  })
})

describe('the page', () => {
  it('reports what it would do, in the shape the browser applies', () => {
    const result = runWorkflow(
      chain([
        step('page.message', { text: 'Thanks ${event.data.name}' }),
        step('page.go', { path: '/thanks' }),
      ]),
      { data: { name: 'Rosa' } },
      NOW
    )

    expect(result.effects).toEqual([
      { do: 'page.message', text: 'Thanks Rosa' },
      { do: 'page.go', path: '/thanks' },
    ])
  })

  it('changes no page itself -- the effects are just data', () => {
    const result = runWorkflow(
      chain([step('page.hide', { target: '#thing' })]),
      {},
      NOW
    )

    expect(result.effects).toEqual([{ do: 'page.hide', target: '#thing' }])
  })
})

describe('notes', () => {
  it('writes the message, with references resolved', () => {
    const result = runWorkflow(
      chain([step('dbal.log', { message: 'saw ${event.data.name}' })]),
      { data: { name: 'Rosa' } },
      NOW
    )

    expect(result.logs).toContain('saw Rosa')
  })
})
