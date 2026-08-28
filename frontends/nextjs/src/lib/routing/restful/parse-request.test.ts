import { describe, expect, it } from 'vitest'

import { parseRestfulRequest } from './parse-request'

const parse = (method: string, slug: string[]) =>
  parseRestfulRequest({ method }, { slug })

const isError = (r: unknown): r is { error: string; status: number } =>
  typeof (r as { error?: unknown }).error === 'string'

describe('parseRestfulRequest path shape', () => {
  it('splits tenant, package and entity', () => {
    const result = parse('GET', ['acme', 'core', 'User'])
    if (isError(result)) throw new Error('expected a parsed route')

    expect(result.route).toMatchObject({
      tenant: 'acme',
      package: 'core',
      entity: 'User',
    })
  })

  it('rejects a path with fewer than three segments', () => {
    const result = parse('GET', ['acme', 'core'])
    expect(isError(result) && result.status).toBe(400)
    expect(isError(result) && result.error).toContain('/api/v1/')
  })

  it('names which segment is empty rather than failing vaguely', () => {
    const noTenant = parse('GET', ['', 'core', 'User'])
    const noPackage = parse('GET', ['acme', '', 'User'])
    const noEntity = parse('GET', ['acme', 'core', ''])

    expect(isError(noTenant) && noTenant.error).toBe('Tenant is required')
    expect(isError(noPackage) && noPackage.error).toBe('Package is required')
    expect(isError(noEntity) && noEntity.error).toBe('Entity is required')
  })
})

describe('parseRestfulRequest operations', () => {
  it('carries the id and action through to the route and the operation', () => {
    const result = parse('POST', ['acme', 'core', 'Post', '123', 'like'])
    if (isError(result)) throw new Error('expected a parsed route')

    expect(result.operation).toBe('action')
    expect(result.route.id).toBe('123')
    expect(result.dbalOp).toEqual({
      entity: 'Post',
      operation: 'action',
      id: '123',
      action: 'like',
    })
  })

  it('reads a collection GET as a list', () => {
    const result = parse('GET', ['acme', 'core', 'User'])
    expect(!isError(result) && result.operation).toBe('list')
  })

  it('ignores segments beyond the action', () => {
    // Extra path is not an error; the first five segments are the contract.
    const result = parse('GET', ['a', 'b', 'C', 'd', 'e', 'f', 'g'])
    expect(!isError(result) && result.route.action).toBe('e')
  })
})
