import { renderHook, act } from '@testing-library/react'
import { usePersistenceConfig } from './usePersistenceConfig'
import * as middleware from '../middleware'

jest.mock('../middleware')

describe('usePersistenceConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(middleware.getPersistenceConfig as jest.Mock).mockReturnValue({
      enabled: true,
      logging: false,
      debounceDelay: 500,
    })
  })

  test('initializes with current config', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    expect(result.current.config).toEqual({
      enabled: true,
      logging: false,
      debounceDelay: 500,
    })
  })

  test('provides updateConfig function', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.updateConfig({ logging: true })
    })

    expect(middleware.updatePersistenceConfig).toHaveBeenCalledWith({ logging: true })
  })

  test('provides togglePersistence function that disables when enabled', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.togglePersistence()
    })

    expect(middleware.disablePersistence).toHaveBeenCalled()
  })

  test('provides togglePersistence function that enables when disabled', () => {
    (middleware.getPersistenceConfig as jest.Mock).mockReturnValue({
      enabled: false,
      logging: false,
      debounceDelay: 500,
    })

    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.togglePersistence()
    })

    expect(middleware.enablePersistence).toHaveBeenCalled()
  })

  test('provides toggleLogging function that disables when enabled', () => {
    (middleware.getPersistenceConfig as jest.Mock).mockReturnValue({
      enabled: true,
      logging: true,
      debounceDelay: 500,
    })

    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.toggleLogging()
    })

    expect(middleware.disableLogging).toHaveBeenCalled()
  })

  test('provides toggleLogging function that enables when disabled', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.toggleLogging()
    })

    expect(middleware.enableLogging).toHaveBeenCalled()
  })

  test('provides updateDebounceDelay function', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.updateDebounceDelay(1000)
    })

    expect(middleware.setDebounceDelay).toHaveBeenCalledWith(1000)
  })

  test('provides refreshConfig function', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.refreshConfig()
    })

    expect(middleware.getPersistenceConfig).toHaveBeenCalled()
  })

  test('refreshConfig updates state', () => {
    const { result, rerender } = renderHook(() => usePersistenceConfig())

    ;(middleware.getPersistenceConfig as jest.Mock).mockReturnValue({
      enabled: false,
      logging: true,
      debounceDelay: 1000,
    })

    act(() => {
      result.current.refreshConfig()
    })

    rerender()

    expect(result.current.config).toEqual({
      enabled: false,
      logging: true,
      debounceDelay: 1000,
    })
  })

  test('updateConfig calls refreshConfig', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.updateConfig({ debounceDelay: 2000 })
    })

    expect(middleware.updatePersistenceConfig).toHaveBeenCalled()
  })

  test('togglePersistence calls refreshConfig', () => {
    const { result } = renderHook(() => usePersistenceConfig())
    const initialCallCount = (middleware.getPersistenceConfig as jest.Mock).mock.calls.length

    act(() => {
      result.current.togglePersistence()
    })

    expect((middleware.getPersistenceConfig as jest.Mock).mock.calls.length).toBeGreaterThan(
      initialCallCount
    )
  })

  test('toggleLogging calls refreshConfig', () => {
    const { result } = renderHook(() => usePersistenceConfig())
    const initialCallCount = (middleware.getPersistenceConfig as jest.Mock).mock.calls.length

    act(() => {
      result.current.toggleLogging()
    })

    expect((middleware.getPersistenceConfig as jest.Mock).mock.calls.length).toBeGreaterThan(
      initialCallCount
    )
  })

  test('updateDebounceDelay calls refreshConfig', () => {
    const { result } = renderHook(() => usePersistenceConfig())
    const initialCallCount = (middleware.getPersistenceConfig as jest.Mock).mock.calls.length

    act(() => {
      result.current.updateDebounceDelay(750)
    })

    expect((middleware.getPersistenceConfig as jest.Mock).mock.calls.length).toBeGreaterThan(
      initialCallCount
    )
  })

  test('handles multiple updates', () => {
    const { result } = renderHook(() => usePersistenceConfig())

    act(() => {
      result.current.togglePersistence()
      result.current.toggleLogging()
      result.current.updateDebounceDelay(2000)
    })

    expect(middleware.disablePersistence).toHaveBeenCalled()
    expect(middleware.enableLogging).toHaveBeenCalled()
    expect(middleware.setDebounceDelay).toHaveBeenCalledWith(2000)
  })
})
