/**
 * Tests for useDatabaseActions hook
 */

jest.mock('../dbApiCalls', () => ({
  testConnection: jest.fn(),
  applyDbConfig: jest.fn(),
}))

jest.mock('../dbUrlUtils', () => ({
  DEFAULT_PORTS: {
    postgres: '5432',
    mysql: '3306',
    mongodb: '27017',
  },
}))

import { renderHook, act } from '@testing-library/react'
import { useDatabaseActions } from '../useDatabaseActions'
import { testConnection, applyDbConfig } from '../dbApiCalls'

function makeParams(overrides: any = {}) {
  return {
    selectedAdapter: 'postgres',
    formFields: { host: 'localhost', database: 'mydb' },
    onApplySuccess: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('useDatabaseActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with testing = false', () => {
    const { result } = renderHook(() => useDatabaseActions(makeParams()))
    expect(result.current.testing).toBe(false)
  })

  it('should initialize with switching = false', () => {
    const { result } = renderHook(() => useDatabaseActions(makeParams()))
    expect(result.current.switching).toBe(false)
  })

  it('should initialize with testResult = null', () => {
    const { result } = renderHook(() => useDatabaseActions(makeParams()))
    expect(result.current.testResult).toBeNull()
  })

  it('should initialize with switchResult = null', () => {
    const { result } = renderHook(() => useDatabaseActions(makeParams()))
    expect(result.current.switchResult).toBeNull()
  })

  it('should expose defaultPorts', () => {
    const { result } = renderHook(() => useDatabaseActions(makeParams()))
    expect(result.current.defaultPorts).toEqual({ postgres: '5432', mysql: '3306', mongodb: '27017' })
  })

  describe('handleTestConnection', () => {
    it('should set testResult on success', async () => {
      ;(testConnection as jest.Mock).mockResolvedValue({ ok: true, message: 'Connected' })

      const { result } = renderHook(() => useDatabaseActions(makeParams()))

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.testResult).toEqual({ ok: true, message: 'Connected' })
      expect(result.current.testing).toBe(false)
    })

    it('should set testResult with ok: false on API failure', async () => {
      ;(testConnection as jest.Mock).mockResolvedValue({ ok: false, message: 'Connection refused' })

      const { result } = renderHook(() => useDatabaseActions(makeParams()))

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.testResult).toEqual({ ok: false, message: 'Connection refused' })
    })

    it('should set testResult with error message on exception', async () => {
      ;(testConnection as jest.Mock).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useDatabaseActions(makeParams()))

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.testResult).toEqual({ ok: false, message: 'Network error' })
      expect(result.current.testing).toBe(false)
    })

    it('should set testResult with "Request failed" for non-Error rejections', async () => {
      ;(testConnection as jest.Mock).mockRejectedValue('unknown')

      const { result } = renderHook(() => useDatabaseActions(makeParams()))

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.testResult).toEqual({ ok: false, message: 'Request failed' })
    })

    it('should reset testResult to null before testing', async () => {
      ;(testConnection as jest.Mock).mockResolvedValue({ ok: true, message: 'OK' })

      const { result } = renderHook(() => useDatabaseActions(makeParams()))

      await act(async () => {
        await result.current.handleTestConnection()
      })

      // Run a second time to see if it resets
      ;(testConnection as jest.Mock).mockResolvedValue({ ok: false, message: 'Fail' })

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.testResult).toEqual({ ok: false, message: 'Fail' })
    })
  })

  describe('handleApply', () => {
    it('should set switchResult on success', async () => {
      ;(applyDbConfig as jest.Mock).mockResolvedValue({ ok: true, message: 'Applied' })

      const params = makeParams()
      const { result } = renderHook(() => useDatabaseActions(params))

      await act(async () => {
        await result.current.handleApply()
      })

      expect(result.current.switchResult).toEqual({ ok: true, message: 'Applied' })
      expect(result.current.switching).toBe(false)
    })

    it('should call onApplySuccess when result.ok is true', async () => {
      ;(applyDbConfig as jest.Mock).mockResolvedValue({ ok: true, message: 'Applied' })

      const params = makeParams()
      const { result } = renderHook(() => useDatabaseActions(params))

      await act(async () => {
        await result.current.handleApply()
      })

      expect(params.onApplySuccess).toHaveBeenCalled()
    })

    it('should not call onApplySuccess when result.ok is false', async () => {
      ;(applyDbConfig as jest.Mock).mockResolvedValue({ ok: false, message: 'Failed' })

      const params = makeParams()
      const { result } = renderHook(() => useDatabaseActions(params))

      await act(async () => {
        await result.current.handleApply()
      })

      expect(params.onApplySuccess).not.toHaveBeenCalled()
    })

    it('should set switchResult with error message on exception', async () => {
      ;(applyDbConfig as jest.Mock).mockRejectedValue(new Error('Connection error'))

      const params = makeParams()
      const { result } = renderHook(() => useDatabaseActions(params))

      await act(async () => {
        await result.current.handleApply()
      })

      expect(result.current.switchResult).toEqual({ ok: false, message: 'Connection error' })
      expect(result.current.switching).toBe(false)
    })

    it('should set "Request failed" for non-Error rejections', async () => {
      ;(applyDbConfig as jest.Mock).mockRejectedValue(null)

      const params = makeParams()
      const { result } = renderHook(() => useDatabaseActions(params))

      await act(async () => {
        await result.current.handleApply()
      })

      expect(result.current.switchResult).toEqual({ ok: false, message: 'Request failed' })
    })
  })
})
