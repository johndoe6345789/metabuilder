import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const power = vi.hoisted(() => ({ transferPower: vi.fn() }))
vi.mock('./transfer-power', () => power)

import { usePowerTransfer } from './use-power-transfer'

beforeEach(() => {
  vi.clearAllMocks()
  power.transferPower.mockResolvedValue({ ok: true, message: 'Done.' })
})

describe('usePowerTransfer', () => {
  it('asks before doing anything', () => {
    const { result } = renderHook(() => usePowerTransfer('me', 'them'))
    expect(result.current.confirming).toBe(false)

    act(() => {
      result.current.ask()
    })

    expect(result.current.confirming).toBe(true)
    expect(power.transferPower).not.toHaveBeenCalled()
  })

  it('does nothing on cancel', () => {
    const { result } = renderHook(() => usePowerTransfer('me', 'them'))
    act(() => {
      result.current.ask()
    })
    act(() => {
      result.current.cancel()
    })
    expect(result.current.confirming).toBe(false)
    expect(power.transferPower).not.toHaveBeenCalled()
  })

  it('hands over from this account to the chosen one', async () => {
    const { result } = renderHook(() => usePowerTransfer('me', 'them'))

    await act(() => result.current.confirm())

    expect(power.transferPower).toHaveBeenCalledWith('me', 'them')
    expect(result.current.outcome).toEqual({ ok: true, message: 'Done.' })
    expect(result.current.confirming).toBe(false)
  })

  it.each([
    ['nobody is chosen', 'me', null],
    ['there is no signed-in account', undefined, 'them'],
  ])('refuses to run when %s', async (_case, from, to) => {
    const { result } = renderHook(() =>
      usePowerTransfer(from as string | undefined, to as string | null)
    )

    await act(() => result.current.confirm())

    expect(power.transferPower).not.toHaveBeenCalled()
  })

  it('keeps the reason when it did not work', async () => {
    power.transferPower.mockResolvedValue({ ok: false, message: 'Refused.' })
    const { result } = renderHook(() => usePowerTransfer('me', 'them'))

    await act(() => result.current.confirm())

    expect(result.current.outcome?.ok).toBe(false)
    expect(result.current.outcome?.message).toBe('Refused.')
  })

  it('clears the last outcome when asked again', async () => {
    power.transferPower.mockResolvedValue({ ok: false, message: 'Refused.' })
    const { result } = renderHook(() => usePowerTransfer('me', 'them'))
    await act(() => result.current.confirm())

    act(() => {
      result.current.ask()
    })

    expect(result.current.outcome).toBeNull()
  })
})
