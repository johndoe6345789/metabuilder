import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const idb = vi.hoisted(() => ({ idbGet: vi.fn(), idbSet: vi.fn() }))
vi.mock('@/lib/persist/idb-kv', () => idb)

import { useWebchat } from './use-webchat'

beforeEach(() => {
  vi.clearAllMocks()
  idb.idbGet.mockResolvedValue(null)
  idb.idbSet.mockResolvedValue(undefined)
})

describe('useWebchat', () => {
  it('starts with the seeded welcome message', () => {
    const { result } = renderHook(() => useWebchat('alex'))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].sender).toBe('system')
  })

  it('adopts stored messages once loaded', async () => {
    const stored = [{ id: 'm9', sender: 'alex', text: 'hi', at: 1 }]
    idb.idbGet.mockResolvedValue(stored)

    const { result } = renderHook(() => useWebchat('alex'))

    await waitFor(() => expect(result.current.messages).toEqual(stored))
  })

  it('keeps the seeded welcome message when nothing is stored', async () => {
    idb.idbGet.mockResolvedValue(null)
    const { result } = renderHook(() => useWebchat('alex'))

    await waitFor(() => expect(idb.idbGet).toHaveBeenCalled())
    expect(result.current.messages).toHaveLength(1)
  })

  it('keeps the seeded welcome message when an empty array is stored', async () => {
    idb.idbGet.mockResolvedValue([])
    const { result } = renderHook(() => useWebchat('alex'))

    await waitFor(() => expect(idb.idbGet).toHaveBeenCalled())
    expect(result.current.messages).toHaveLength(1)
  })

  it('send appends a message from the given sender and persists it', () => {
    const { result } = renderHook(() => useWebchat('alex'))
    act(() => result.current.setDraft('  hello  '))

    act(() => result.current.send())

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toMatchObject({
      sender: 'alex',
      text: 'hello',
    })
    expect(idb.idbSet).toHaveBeenCalled()
  })

  it('send clears the draft', () => {
    const { result } = renderHook(() => useWebchat('alex'))
    act(() => result.current.setDraft('hello'))
    act(() => result.current.send())
    expect(result.current.draft).toBe('')
  })

  it('send does nothing for a blank draft', () => {
    const { result } = renderHook(() => useWebchat('alex'))
    act(() => result.current.setDraft('   '))

    act(() => result.current.send())

    expect(result.current.messages).toHaveLength(1)
    expect(idb.idbSet).not.toHaveBeenCalled()
  })
})
