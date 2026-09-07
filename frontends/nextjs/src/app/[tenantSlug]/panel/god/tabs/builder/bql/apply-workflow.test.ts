import { describe, expect, it } from 'vitest'

import { applyWorkflowBql, isWorkflowScript } from './apply-workflow'
import type { BqlSentence } from './types'

const workflow = (name: string): BqlSentence => ({
  kind: 'workflow',
  line: 1,
  name,
})
const trigger = (event: string): BqlSentence => ({
  kind: 'trigger',
  line: 2,
  event,
})
const step = (
  stepName: string,
  attrs: { key: string; value: string }[] = [],
  line = 3
): BqlSentence => ({ kind: 'step', line, stepName, attrs })
const publish = (line = 4): BqlSentence => ({ kind: 'publishWorkflow', line })

describe('a script that builds a workflow', () => {
  it('reads the whole thing', () => {
    const { workflow: built, errors } = applyWorkflowBql([
      workflow('Log a repair booking'),
      trigger('FormSubmission.created'),
      step('Write a note to the log', [{ key: 'message', value: 'Booked' }]),
      publish(),
    ])

    expect(errors).toEqual([])
    expect(built?.name).toBe('Log a repair booking')
    expect(built?.trigger).toBe('FormSubmission.created')
    expect(built?.publish).toBe(true)
    expect(built?.nodes).toHaveLength(1)
  })

  // The step type stored is what the daemon dispatches on, not the
  // friendly name the script used.
  it('stores the step under the type the daemon runs', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Write a note to the log'),
    ])

    expect(built?.nodes[0]?.type).toBe('dbal.log')
  })

  it('keeps the parameters the script gave', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Only carry on if', [
        { key: 'value', value: '${event.data.job}' },
        { key: 'is', value: 'contains' },
        { key: 'other', value: 'urgent' },
      ]),
    ])

    expect(built?.nodes[0]?.config).toMatchObject({
      value: '${event.data.job}',
      is: 'contains',
      other: 'urgent',
    })
  })

  it('keeps the steps in the order they were written', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Only carry on if', [], 3),
      step('Write a note to the log', [], 4),
    ])

    expect(built?.nodes.map(n => n.type)).toEqual([
      'dbal.stop.unless',
      'dbal.log',
    ])
  })

  it('does not publish unless the script says so', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Write a note to the log'),
    ])

    expect(built?.publish).toBe(false)
  })

  it('leaves the trigger empty when none is given', () => {
    const { workflow: built } = applyWorkflowBql([workflow('W')])
    expect(built?.trigger).toBe('')
  })
})

/**
 * Either every line applies or none does, as with the page half: a
 * half-built workflow published because one step was misspelled is worse
 * than one that refused and named the line.
 */
describe('a script that will not build', () => {
  it('refuses a step nothing implements, and names it', () => {
    const { workflow: built, errors } = applyWorkflowBql([
      workflow('W'),
      step('Frobnicate the widget'),
    ])

    expect(built).toBeNull()
    expect(errors[0]?.message).toContain('Frobnicate the widget')
    expect(errors[0]?.line).toBe(3)
  })

  it('asks for a name when the script never gave one', () => {
    const { workflow: built, errors } = applyWorkflowBql([
      step('Write a note to the log'),
    ])

    expect(built).toBeNull()
    expect(errors[0]?.message).toContain('start a new workflow called')
  })

  it('refuses a second workflow in one script', () => {
    const { errors } = applyWorkflowBql([
      workflow('One'),
      { ...workflow('Two'), line: 5 },
    ])

    expect(errors[0]?.message).toContain('One')
  })

  // A script is one thing or the other; mixing them is a mistake worth
  // pointing at rather than half-applying.
  it('refuses a page line inside a workflow script', () => {
    const { errors } = applyWorkflowBql([
      workflow('W'),
      { kind: 'add', line: 3, blockName: 'Heading 1', attrs: [] },
    ])

    expect(errors[0]?.message).toContain('builds a page')
  })

  it('matches a step name whatever its case or spacing', () => {
    const { errors } = applyWorkflowBql([
      workflow('W'),
      step('  write   A NOTE to the LOG  '),
    ])

    expect(errors).toEqual([])
  })
})

describe('isWorkflowScript', () => {
  it('is true when a script starts a workflow', () => {
    expect(isWorkflowScript([workflow('W')])).toBe(true)
  })

  it('is false for a script that builds a page', () => {
    expect(
      isWorkflowScript([{ kind: 'clear', line: 1 }])
    ).toBe(false)
  })
})

/**
 * Three workflows all subscribed to FormSubmission.created each claimed
 * every submission, and which ran came down to database order. A script
 * says which form its workflow answers.
 */
describe('scoping a workflow to one form', () => {
  it('keeps the form the script named', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('Log a repair booking'),
      { kind: 'trigger', line: 2, event: 'FormSubmission.created', form: 'book-a-repair' },
    ])

    expect(built?.formName).toBe('book-a-repair')
  })

  // Naming no form still means any of them, as it always has.
  it('leaves the form empty when the script names none', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      trigger('FormSubmission.created'),
    ])

    expect(built?.formName).toBe('')
  })
})

/**
 * A step's parameters are not all scalars: Save a row takes a nested
 * `data` object naming the columns, and a step handing a value to the
 * next one names it under `outputs`. Written flat, the daemon would look
 * for `data` and find a key literally called "data.name".
 */
describe('a parameter inside a parameter', () => {
  it('nests a dotted key', () => {
    const { workflow: built, errors } = applyWorkflowBql([
      workflow('W'),
      step('Save a row', [
        { key: 'entity', value: 'Booking' },
        { key: 'data.name', value: '${event.data.name}' },
        { key: 'data.status', value: 'new' },
      ]),
    ])

    expect(errors).toEqual([])
    expect(built?.nodes[0]?.config).toMatchObject({
      entity: 'Booking',
      data: { name: '${event.data.name}', status: 'new' },
    })
  })

  it('nests an output name', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Make an id', [{ key: 'outputs.id', value: 'new_id' }]),
    ])

    expect(built?.nodes[0]?.config).toMatchObject({
      outputs: { id: 'new_id' },
    })
  })

  it('leaves an undotted key alone', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Write a note to the log', [{ key: 'message', value: 'Booked' }]),
    ])

    expect(built?.nodes[0]?.config).toMatchObject({ message: 'Booked' })
  })

  // The step's default for `data` is {}, but for `entity` it is '' -- a
  // string cannot hold a field, so it is replaced rather than written to.
  it('replaces a scalar default when a field is written inside it', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Write a note to the log', [{ key: 'message.deep', value: 'x' }]),
    ])

    expect(built?.nodes[0]?.config).toMatchObject({ message: { deep: 'x' } })
  })

  it('goes as deep as the key says', () => {
    const { workflow: built } = applyWorkflowBql([
      workflow('W'),
      step('Save a row', [{ key: 'data.a.b', value: 'deep' }]),
    ])

    expect(built?.nodes[0]?.config).toMatchObject({ data: { a: { b: 'deep' } } })
  })
})
