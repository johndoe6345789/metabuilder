import { describe, expect, it } from 'vitest'
import { NODE_TYPES } from '@/workflow-editor'
import { filterNodeTypes } from './filter-node-types'
import { RUNNABLE_STEPS } from './runnable-steps'

describe('filterNodeTypes', () => {
  it('returns the full catalogue for an empty query', () => {
    expect(filterNodeTypes('')).toEqual(RUNNABLE_STEPS)
  })

  it('matches by name, case-insensitively', () => {
    const target = RUNNABLE_STEPS[0]
    expect(filterNodeTypes(target.name.toUpperCase())).toContainEqual(target)
  })

  it('matches by description', () => {
    const target = RUNNABLE_STEPS.find(n => n.description.length > 0)
    if (target === undefined) return
    const word = target.description.split(' ')[0]
    expect(filterNodeTypes(word)).toContainEqual(target)
  })

  // Someone who already knows DBAL should be able to find the step by the
  // name the daemon uses, not only by the friendly one.
  it('matches by the step type the daemon dispatches on', () => {
    const result = filterNodeTypes('dbal.entity.create')
    expect(result.map(n => n.name)).toEqual(['Save a row'])
  })

  it('returns nothing for a query that matches no step', () => {
    expect(filterNodeTypes('zzz-not-a-real-node-zzz')).toEqual([])
  })
})

/**
 * The bug this catalogue exists to close: the editor offered ~30 node
 * types (Webhook, HTTP Request, Send Email, Code) and the DBAL daemon
 * implements seven entirely different ones, with no overlap at all. So
 * every workflow anyone built was unrunnable by construction -- it saved,
 * it published, and nothing could execute a single step of it.
 */
describe('the palette and the engine', () => {
  // Kept in step with dbal/production/src/workflow/steps/*.hpp.
  const IMPLEMENTED = [
    'dbal.entity.create',
    'dbal.entity.get',
    'dbal.entity.list',
    'dbal.log',
    'dbal.timestamp',
    'dbal.uuid',
    'dbal.var.set',
  ]

  it('offers only steps the daemon implements', () => {
    const offered = RUNNABLE_STEPS.map(n => n.id).sort()
    expect(offered).toEqual([...IMPLEMENTED].sort())
  })

  it('no longer offers a step nothing can run', () => {
    const offered = new Set(RUNNABLE_STEPS.map(n => n.id))
    const stock = NODE_TYPES.map(n => n.id)
    expect(stock.filter(id => offered.has(id))).toEqual([])
  })

  it('gives every step a plain-language name', () => {
    for (const s of RUNNABLE_STEPS) {
      expect(s.name).not.toContain('dbal.')
      expect(s.description.length).toBeGreaterThan(0)
    }
  })
})
