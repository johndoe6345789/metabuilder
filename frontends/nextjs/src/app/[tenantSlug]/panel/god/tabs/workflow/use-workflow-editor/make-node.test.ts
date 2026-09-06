import { describe, expect, it } from 'vitest'

import { makeNode, nextStepPosition } from './make-node'
import { RUNNABLE_STEPS } from '../runnable-steps'

const found = RUNNABLE_STEPS.find(s => s.id === 'dbal.entity.create')
if (found === undefined) throw new Error('the palette lost "Save a row"')
const saveARow = found

describe('makeNode', () => {
  it('makes a node of the step type the daemon dispatches on', () => {
    const node = makeNode(saveARow, { x: 0, y: 0 })
    expect(node.type).toBe('dbal.entity.create')
  })

  it('starts it from the step’s own defaults', () => {
    const node = makeNode(saveARow, { x: 0, y: 0 })
    expect(node.config).toEqual(saveARow.defaultConfig)
  })

  // A copy, not the palette's own object: editing one node's parameters
  // must not rewrite the defaults every later node starts from.
  it('copies the defaults rather than sharing them', () => {
    const node = makeNode(saveARow, { x: 0, y: 0 })
    ;(node.config as Record<string, unknown>).entity = 'Changed'
    expect(saveARow.defaultConfig.entity).toBe('')
  })

  it('gives each node its own id', () => {
    const a = makeNode(saveARow, { x: 0, y: 0 })
    const b = makeNode(saveARow, { x: 0, y: 0 })
    expect(a.id).not.toBe(b.id)
  })
})

/**
 * The palette is drag-only, so a workflow could not be built without a
 * mouse. A step added by keyboard has no drop point to be placed at.
 */
describe('nextStepPosition', () => {
  it('puts the first step where it can be seen', () => {
    expect(nextStepPosition(0)).toEqual({ x: 80, y: 60 })
  })

  it('stacks each later step below the last', () => {
    const first = nextStepPosition(0)
    const second = nextStepPosition(1)
    expect(second.x).toBe(first.x)
    expect(second.y).toBeGreaterThan(first.y)
  })

  it('never places two steps on top of each other', () => {
    const seen = new Set(
      Array.from({ length: 7 }, (_, i) => JSON.stringify(nextStepPosition(i)))
    )
    expect(seen.size).toBe(7)
  })
})
