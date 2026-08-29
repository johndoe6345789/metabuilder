import { describe, expect, it } from 'vitest'

import { determineExecutionMode } from './execution-mode'

const trigger = (kind: string) =>
  ({ nodeId: 'n1', kind, enabled: true }) as never

describe('determineExecutionMode', () => {
  it('is manual with no trigger at all', () => {
    expect(determineExecutionMode(undefined)).toBe('manual')
  })

  it('maps a schedule to a scheduled run', () => {
    expect(determineExecutionMode(trigger('schedule'))).toBe('scheduled')
  })

  it.each(['webhook', 'webhook-listen'])('maps %s to webhook', kind => {
    expect(determineExecutionMode(trigger(kind))).toBe('webhook')
  })

  // A trigger of kind 'manual' still arrives through the API -- the mode
  // describes how the run reached the engine, not who asked for it.
  it.each([
    'manual',
    'event',
    'email',
    'message-queue',
    'polling',
    'custom',
  ])('maps %s to api', kind => {
    expect(determineExecutionMode(trigger(kind))).toBe('api')
  })

  it('falls back to manual for a kind it does not know', () => {
    expect(determineExecutionMode(trigger('telepathy'))).toBe('manual')
  })
})
