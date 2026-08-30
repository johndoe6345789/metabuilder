import { describe, expect, it } from 'vitest'

import { contrastFails, isLargeText } from './contrast-preview'

describe('isLargeText', () => {
  it('is large at 24px regular weight', () => {
    expect(isLargeText(24, 400)).toBe(true)
  })

  it('is not large just under 24px regular weight', () => {
    expect(isLargeText(23.9, 400)).toBe(false)
  })

  it('is large at 18.66px when bold', () => {
    expect(isLargeText(18.66, 700)).toBe(true)
  })

  it('is not large below 18.66px even when bold', () => {
    expect(isLargeText(18, 700)).toBe(false)
  })

  it('bold alone below 18.66px is not enough', () => {
    expect(isLargeText(16, 900)).toBe(false)
  })
})

describe('contrastFails', () => {
  it('fails when the ratio is below the floor', () => {
    expect(contrastFails(2.5, 4.5)).toBe(true)
  })

  it('passes when the ratio meets the floor', () => {
    expect(contrastFails(4.5, 4.5)).toBe(false)
  })

  it('is not a failure when the ratio could not be measured', () => {
    expect(contrastFails(null, 4.5)).toBe(false)
  })
})
