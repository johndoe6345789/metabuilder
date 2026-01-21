import { renderHook } from '@testing-library/react'
import { useIsMobile } from './use-mobile'

describe('useIsMobile', () => {
  let matchMediaMock: jest.Mock

  beforeEach(() => {
    // Mock matchMedia
    matchMediaMock = jest.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 767px)' && window.innerWidth < 768,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('returns false when viewport width is greater than or equal to 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  test('returns true when viewport width is less than 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  test('handles boundary at 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  test('handles boundary at 767px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  test('sets up media query listener on mount', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })

    renderHook(() => useIsMobile())
    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 767px)')
  })

  test('removes media query listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800,
    })

    const removeEventListenerMock = jest.fn()
    matchMediaMock.mockImplementation(() => ({
      matches: false,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: removeEventListenerMock,
      dispatchEvent: jest.fn(),
    }))

    const { unmount } = renderHook(() => useIsMobile())
    unmount()

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })

  test('handles coercion to boolean correctly', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe('boolean')
    expect(result.current).toBe(true)
  })

  test('initializes with window.innerWidth on client side', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    })

    const { result } = renderHook(() => useIsMobile())
    // Initial state should be set based on window.innerWidth
    expect(result.current).toBe(false)
  })
})
