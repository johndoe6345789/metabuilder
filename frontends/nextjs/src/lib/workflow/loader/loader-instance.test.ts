import { afterEach, describe, expect, it } from 'vitest'

import { getWorkflowLoader, resetWorkflowLoader } from './loader-instance'

afterEach(() => {
  resetWorkflowLoader()
})

describe('getWorkflowLoader', () => {
  // A loader per caller is a cache per caller, which is no cache at all.
  it('hands back the same loader every time', () => {
    expect(getWorkflowLoader()).toBe(getWorkflowLoader())
  })

  it('honours options on the first call only', () => {
    const first = getWorkflowLoader({ enableLogging: false })
    expect(getWorkflowLoader({ enableLogging: true })).toBe(first)
  })
})

describe('resetWorkflowLoader', () => {
  it('makes the next call build a new loader', () => {
    const first = getWorkflowLoader()
    resetWorkflowLoader()
    expect(getWorkflowLoader()).not.toBe(first)
  })

  it('is safe to call when there is no loader', () => {
    resetWorkflowLoader()
    expect(() => {
      resetWorkflowLoader()
    }).not.toThrow()
  })
})
