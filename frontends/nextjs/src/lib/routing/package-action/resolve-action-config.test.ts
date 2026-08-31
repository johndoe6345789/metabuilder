import { describe, expect, it } from 'vitest'

import { resolveActionConfig } from './resolve-action-config'

describe('resolveActionConfig', () => {
  it('finds a registered action', () => {
    const pkg = { config: JSON.stringify({ actions: { 'User.ban': {} } }) }
    expect(resolveActionConfig(pkg, 'User', 'ban')).toEqual({
      config: {},
    })
  })

  it('leaves config undefined for an unregistered action', () => {
    const pkg = { config: JSON.stringify({ actions: {} }) }
    expect(resolveActionConfig(pkg, 'User', 'ban').config).toBeUndefined()
  })

  it('treats a missing config field as an empty action set', () => {
    expect(resolveActionConfig({}, 'User', 'ban').config).toBeUndefined()
  })

  it('reports invalid JSON rather than throwing', () => {
    const pkg = { config: '{not json' }
    const result = resolveActionConfig(pkg, 'User', 'ban')
    expect(result.invalidConfigError).toBeDefined()
    expect(result.config).toBeUndefined()
  })
})
