import { describe, expect, it } from 'vitest'

import { operationFor } from './operation'

describe('operationFor on a collection', () => {
  it('reads GET as list and POST as create', () => {
    expect(operationFor('GET')).toBe('list')
    expect(operationFor('POST')).toBe('create')
  })

  it('refuses to guess at a method with no meaning here', () => {
    // A PUT or DELETE against a collection is not an update-all or a
    // delete-all; saying 'unknown' is what stops it becoming one.
    expect(operationFor('PUT')).toBe('unknown')
    expect(operationFor('DELETE')).toBe('unknown')
  })
})

describe('operationFor on a record', () => {
  it('maps the methods that address one record', () => {
    expect(operationFor('GET', '123')).toBe('read')
    expect(operationFor('PUT', '123')).toBe('update')
    expect(operationFor('PATCH', '123')).toBe('update')
    expect(operationFor('DELETE', '123')).toBe('delete')
  })

  it('treats an empty id as no id at all', () => {
    expect(operationFor('GET', '')).toBe('list')
  })

  it('is case-sensitive about the method', () => {
    // Node gives methods uppercase; a lowercase one is not a GET and must
    // not be treated as one.
    expect(operationFor('get', '123')).toBe('unknown')
  })
})

describe('operationFor with an action', () => {
  it('lets a custom action win over the method and the id', () => {
    expect(operationFor('POST', '123', 'like')).toBe('action')
    expect(operationFor('DELETE', '123', 'archive')).toBe('action')
    expect(operationFor('GET', undefined, 'ping')).toBe('action')
  })

  it('ignores an empty action', () => {
    expect(operationFor('GET', '123', '')).toBe('read')
  })
})
