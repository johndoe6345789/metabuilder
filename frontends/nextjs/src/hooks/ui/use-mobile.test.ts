import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/ui/use-mobile'

describe('use-mobile', () => {
  const MOBILE_BREAKPOINT = 768

  beforeEach(() => {
    // Reset window.matchMedia mock before each test
    vi.clearAllMocks()
  })

  it.each([
    { innerWidth: 400, expected: true, description: 'should return true for mobile width' },
    { innerWidth: 600, expected: true, description: 'should return true for small tablet' },
    { innerWidth: 767, expected: true, description: 'should return true below breakpoint' },
    { innerWidth: 768, expected: false, description: 'should return false at breakpoint' },
    { innerWidth: 1024, expected: false, description: 'should return false for desktop' },
    { innerWidth: 1920, expected: false, description: 'should return false for large desktop' },
  ])('$description', ({ innerWidth, expected }) => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: innerWidth,
    })

    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: innerWidth < MOBILE_BREAKPOINT,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(expected)
  })

  it('should respond to window resize events', () => {
    const listeners: ((e: MediaQueryListEvent) => void)[] = []

    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: window.innerWidth < MOBILE_BREAKPOINT,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, listener: (e: MediaQueryListEvent) => void) => {
        if (event === 'change') listeners.push(listener)
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      listeners.forEach(listener => listener({} as MediaQueryListEvent))
    })

    expect(result.current).toBe(true)
  })

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerMock = vi.fn()

    const matchMediaMock = vi.fn().mockImplementation(query => ({
      matches: window.innerWidth < MOBILE_BREAKPOINT,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    const { unmount } = renderHook(() => useIsMobile())
    unmount()

    expect(removeEventListenerMock).toHaveBeenCalled()
  })
})
