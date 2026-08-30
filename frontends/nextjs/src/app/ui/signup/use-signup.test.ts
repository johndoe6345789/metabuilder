import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const request = vi.hoisted(() => ({ submitSignup: vi.fn() }))
vi.mock('./register-request', () => request)

import { useSignup } from './use-signup'

const fillValid = (result: { current: ReturnType<typeof useSignup> }) => {
  act(() => {
    result.current.setCommunity('Acme')
    result.current.setName('Alex')
    result.current.setEmail('alex@example.com')
    result.current.setPassword('longenough')
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  request.submitSignup.mockResolvedValue(null)
})

describe('useSignup', () => {
  it('starts empty, unable to submit', () => {
    const { result } = renderHook(() => useSignup())
    expect(result.current.canSubmit).toBe(false)
    expect(result.current.error).toBe('')
  })

  it('can submit once every field is filled', () => {
    const { result } = renderHook(() => useSignup())
    fillValid(result)
    expect(result.current.canSubmit).toBe(true)
  })

  it('refuses a short community name before ever calling the server', async () => {
    const { result } = renderHook(() => useSignup())
    fillValid(result)
    act(() => {
      result.current.setCommunity('a')
    })
    await act(async () => {
      await result.current.submit()
    })
    expect(result.current.error).toBe(
      'Community name must be at least 2 characters.'
    )
    expect(request.submitSignup).not.toHaveBeenCalled()
  })

  it('is loading while the request is in flight', async () => {
    let resolve: (value: string | null) => void = () => undefined
    request.submitSignup.mockReturnValue(
      new Promise<string | null>(r => {
        resolve = r
      })
    )
    const { result } = renderHook(() => useSignup())
    fillValid(result)

    let submitted: Promise<void> = Promise.resolve()
    act(() => {
      submitted = result.current.submit()
    })
    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolve(null)
      await submitted
    })
    expect(result.current.loading).toBe(false)
  })

  it('clears a previous error before retrying', async () => {
    const { result } = renderHook(() => useSignup())
    fillValid(result)
    act(() => {
      result.current.setCommunity('a')
    })
    await act(async () => {
      await result.current.submit()
    })
    expect(result.current.error.length).toBeGreaterThan(0)

    act(() => {
      result.current.setCommunity('Acme')
    })
    await act(async () => {
      await result.current.submit()
    })
    expect(result.current.error).toBe('')
  })

  it('surfaces the failure the request reports', async () => {
    request.submitSignup.mockResolvedValue('Username already exists')
    const { result } = renderHook(() => useSignup())
    fillValid(result)
    await act(async () => {
      await result.current.submit()
    })
    await waitFor(() => {
      expect(result.current.error).toBe('Username already exists')
    })
  })

  it('sends the fields it was given', async () => {
    const { result } = renderHook(() => useSignup())
    fillValid(result)
    act(() => {
      result.current.setTier('studio')
    })
    await act(async () => {
      await result.current.submit()
    })
    expect(request.submitSignup).toHaveBeenCalledWith({
      community: 'Acme',
      name: 'Alex',
      email: 'alex@example.com',
      password: 'longenough',
      tier: 'studio',
    })
  })
})
