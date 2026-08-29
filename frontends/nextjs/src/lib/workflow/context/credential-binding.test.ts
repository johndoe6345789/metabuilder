import { describe, expect, it } from 'vitest'

import { bindCredentials } from './credential-binding'

const workflow = (credentials: unknown[]) => ({ credentials }) as never

describe('bindCredentials', () => {
  it('is empty for a workflow that declares none', () => {
    expect(bindCredentials(workflow([])).size).toBe(0)
  })

  it('binds one reference per node', () => {
    const map = bindCredentials(
      workflow([
        { nodeId: 'n1', credentialId: 'c1', credentialName: 'DB' },
        { nodeId: 'n2', credentialId: 'c2', credentialName: 'API' },
      ])
    )
    expect(map.get('n1')).toEqual({ id: 'c1', name: 'DB' })
    expect(map.get('n2')).toEqual({ id: 'c2', name: 'API' })
  })

  // Only the reference is bound. Nothing reads this map yet, so a context
  // carrying real secret material would be a decrypted secret held in
  // memory for no reader.
  it('carries no secret material', () => {
    const map = bindCredentials(
      workflow([
        {
          nodeId: 'n1',
          credentialId: 'c1',
          credentialName: 'DB',
          secret: 'hunter2',
        },
      ])
    )
    expect(JSON.stringify([...map.values()])).not.toContain('hunter2')
    expect(Object.keys(map.get('n1') ?? {})).toEqual(['id', 'name'])
  })

  it('keeps the last binding when a node declares two', () => {
    const map = bindCredentials(
      workflow([
        { nodeId: 'n1', credentialId: 'c1', credentialName: 'first' },
        { nodeId: 'n1', credentialId: 'c2', credentialName: 'second' },
      ])
    )
    expect(map.size).toBe(1)
    expect(map.get('n1')?.name).toBe('second')
  })
})
