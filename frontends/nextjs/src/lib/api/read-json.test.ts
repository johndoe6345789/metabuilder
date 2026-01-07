import { describe, expect, it } from 'vitest'

import { readJson } from './read-json'

describe('readJson', () => {
  it.each([
    { body: { name: 'test' }, expected: { name: 'test' } },
    { body: { count: 42, active: true }, expected: { count: 42, active: true } },
    { body: [1, 2, 3], expected: [1, 2, 3] },
  ])('parses JSON body: $body', async ({ body, expected }) => {
    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await readJson(request)

    expect(result).toEqual(expected)
  })

  it('returns typed result', async () => {
    interface TestType {
      id: string
      value: number
    }

    const body = { id: 'abc', value: 123 }
    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await readJson<TestType>(request)

    expect(result.id).toBe('abc')
    expect(result.value).toBe(123)
  })
})
