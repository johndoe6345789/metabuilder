import { describe, it, expect } from 'vitest'
import { unwrap } from './dbal-fetch'

describe('unwrap', () => {
  it('unwraps a {success, data} envelope', () => {
    expect(unwrap({ success: true, data: { id: 'a' } })).toEqual({ id: 'a' })
  })

  it('unwraps a failed envelope the same way -- callers check ok first', () => {
    expect(unwrap({ success: false, data: null })).toBeNull()
  })

  it('passes a bare array through unchanged', () => {
    expect(unwrap([{ id: 'a' }])).toEqual([{ id: 'a' }])
  })

  it('passes a shape with no success key through unchanged', () => {
    expect(unwrap({ id: 'a' })).toEqual({ id: 'a' })
  })

  it('passes null through unchanged', () => {
    expect(unwrap(null)).toBeNull()
  })
})
