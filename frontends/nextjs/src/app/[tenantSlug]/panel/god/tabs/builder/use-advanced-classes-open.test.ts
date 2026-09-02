import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAdvancedClassesOpen } from './use-advanced-classes-open'
import type { CssClass } from '../styles/use-css-classes'

const css = (name: string): CssClass => ({ id: name, name, props: {} })

describe('useAdvancedClassesOpen', () => {
  it('starts closed when every applied class is recognised', () => {
    const { result } = renderHook(() =>
      useAdvancedClassesOpen(['card'], [css('card')])
    )
    expect(result.current[0]).toBe(false)
  })

  it('starts closed while the class list has not hydrated yet', () => {
    const { result } = renderHook(() => useAdvancedClassesOpen(['card'], []))
    expect(result.current[0]).toBe(false)
  })

  it('opens once an applied class is not one the Styles tab defines', () => {
    const { result } = renderHook(() =>
      useAdvancedClassesOpen(['legacy-util'], [css('card')])
    )
    expect(result.current[0]).toBe(true)
  })

  it('can be toggled closed again by the caller', () => {
    const { result } = renderHook(() =>
      useAdvancedClassesOpen(['legacy-util'], [css('card')])
    )
    expect(result.current[0]).toBe(true)
    act(() => result.current[1]())
    expect(result.current[0]).toBe(false)
  })
})
