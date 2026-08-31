import { describe, expect, it } from 'vitest'

import { generateErrorId } from './generate-id'

describe('generateErrorId', () => {
  it('starts with the err_ prefix', () => {
    expect(generateErrorId()).toMatch(/^err_/)
  })

  it('produces distinct ids across calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateErrorId()))
    expect(ids.size).toBe(20)
  })
})
