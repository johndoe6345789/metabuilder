/**
 * Tests for useDatabaseSettings hook (composition hook)
 */

jest.mock('../useDatabaseConfig', () => ({
  useDatabaseConfig: jest.fn(),
}))

jest.mock('../useDatabaseActions', () => ({
  useDatabaseActions: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react'
import { useDatabaseSettings } from '../useDatabaseSettings'
import { useDatabaseConfig } from '../useDatabaseConfig'
import { useDatabaseActions } from '../useDatabaseActions'

const mockConfig = {
  adapter: 'postgres',
  database_url: 'postgres://localhost:5432/db',
  status: 'connected',
}

const mockAdapters = [
  { name: 'postgres', description: 'PostgreSQL', supported: true, active: true },
]

const mockFetchConfig = jest.fn().mockResolvedValue(undefined)
const mockFetchAdapters = jest.fn().mockResolvedValue(undefined)
const mockTestConnection = jest.fn()
const mockApply = jest.fn()

function setupMocks() {
  ;(useDatabaseConfig as jest.Mock).mockReturnValue({
    config: mockConfig,
    adapters: mockAdapters,
    loading: false,
    fetchConfig: mockFetchConfig,
    fetchAdapters: mockFetchAdapters,
  })

  ;(useDatabaseActions as jest.Mock).mockReturnValue({
    testing: false,
    switching: false,
    testResult: null,
    switchResult: null,
    defaultPorts: { postgres: '5432' },
    handleTestConnection: mockTestConnection,
    handleApply: mockApply,
  })
}

describe('useDatabaseSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should return config from useDatabaseConfig', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.config).toEqual(mockConfig)
  })

  it('should return adapters from useDatabaseConfig', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.adapters).toEqual(mockAdapters)
  })

  it('should return loading from useDatabaseConfig', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.loading).toBe(false)
  })

  it('should initialize selectedAdapter as "postgres"', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.selectedAdapter).toBe('postgres')
  })

  it('should initialize formFields as empty object', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.formFields).toEqual({})
  })

  it('handleAdapterChange should update selectedAdapter', () => {
    const { result } = renderHook(() => useDatabaseSettings())

    act(() => { result.current.handleAdapterChange('mysql') })

    expect(result.current.selectedAdapter).toBe('mysql')
  })

  it('handleAdapterChange should reset formFields', () => {
    const { result } = renderHook(() => useDatabaseSettings())

    act(() => { result.current.handleFieldChange('host', 'localhost') })
    act(() => { result.current.handleAdapterChange('sqlite') })

    expect(result.current.formFields).toEqual({})
  })

  it('handleFieldChange should update a single field', () => {
    const { result } = renderHook(() => useDatabaseSettings())

    act(() => { result.current.handleFieldChange('host', 'db.example.com') })

    expect(result.current.formFields).toEqual({ host: 'db.example.com' })
  })

  it('handleFieldChange should accumulate multiple fields', () => {
    const { result } = renderHook(() => useDatabaseSettings())

    act(() => {
      result.current.handleFieldChange('host', 'localhost')
      result.current.handleFieldChange('port', '5432')
      result.current.handleFieldChange('database', 'mydb')
    })

    expect(result.current.formFields).toEqual({
      host: 'localhost',
      port: '5432',
      database: 'mydb',
    })
  })

  it('should pass handleTestConnection from useDatabaseActions', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.handleTestConnection).toBe(mockTestConnection)
  })

  it('should pass handleApply from useDatabaseActions', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.handleApply).toBe(mockApply)
  })

  it('should return testing and switching from useDatabaseActions', () => {
    const { result } = renderHook(() => useDatabaseSettings())
    expect(result.current.testing).toBe(false)
    expect(result.current.switching).toBe(false)
  })

  it('should call useDatabaseActions with selectedAdapter and formFields', () => {
    const { result } = renderHook(() => useDatabaseSettings())

    act(() => {
      result.current.handleFieldChange('host', 'myhost')
    })

    expect(useDatabaseActions).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedAdapter: 'postgres',
        formFields: expect.objectContaining({ host: 'myhost' }),
      })
    )
  })

  it('onApplySuccess should call fetchConfig and fetchAdapters', async () => {
    const { result } = renderHook(() => useDatabaseSettings())

    // Get the onApplySuccess passed to useDatabaseActions
    const actionsCall = (useDatabaseActions as jest.Mock).mock.calls[0][0]
    await act(async () => {
      await actionsCall.onApplySuccess()
    })

    expect(mockFetchConfig).toHaveBeenCalled()
    expect(mockFetchAdapters).toHaveBeenCalled()
  })
})
