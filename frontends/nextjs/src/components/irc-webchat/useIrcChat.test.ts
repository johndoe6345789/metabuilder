import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const api = vi.hoisted(() => ({
  fetchChannels: vi.fn(),
  fetchMessages: vi.fn(),
  postMessage: vi.fn(),
}))
const store = vi.hoisted(() => ({ lsGet: vi.fn(), lsSet: vi.fn() }))

vi.mock('./irc-api', () => api)
vi.mock('./irc-storage', () => store)

import { useIrcChat } from './useIrcChat'

const channel = (id: string, name = id) => ({ id, name, tenantId: 'default' })
const message = (id: string) => ({
  id,
  channelId: 'ch_general',
  content: id,
  createdBy: 'u',
  tenantId: 'default',
  createdAt: '2020-01-01',
  type: 'message',
})

describe('useIrcChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.lsGet.mockImplementation((_k: string, fallback: unknown) => fallback)
    api.fetchChannels.mockResolvedValue([channel('ch_general')])
    api.fetchMessages.mockResolvedValue([message('m1')])
    api.postMessage.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('loading channels', () => {
    it('selects the first channel automatically', async () => {
      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.activeChannelId).toBe('ch_general')
    })

    it('caches what it loaded', async () => {
      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(store.lsSet).toHaveBeenCalledWith('irc_channels', [
        channel('ch_general'),
      ])
    })

    it('uses the built-in channels when the server returns none', async () => {
      api.fetchChannels.mockResolvedValue([])

      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.channels.map(c => c.name)).toEqual([
        'general',
        'dev',
        'random',
      ])
    })
  })

  describe('when the server is unreachable', () => {
    beforeEach(() => {
      api.fetchChannels.mockRejectedValue(new Error('offline'))
    })

    it('falls back to cached channels and says so', async () => {
      store.lsGet.mockReturnValue([channel('ch_cached')])

      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.channels).toEqual([channel('ch_cached')])
      expect(result.current.error).toContain('offline')
    })

    it('does not keep asking the server for messages', async () => {
      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(api.fetchMessages).not.toHaveBeenCalled()
    })
  })

  describe('messages', () => {
    it('loads them for the active channel', async () => {
      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => {
        expect(result.current.messages).toEqual([message('m1')])
      })
      expect(api.fetchMessages).toHaveBeenCalledWith('ch_general')
    })

    it('caches them per channel', async () => {
      renderHook(() => useIrcChat())

      await waitFor(() => {
        expect(store.lsSet).toHaveBeenCalledWith('irc_msgs_ch_general', [
          message('m1'),
        ])
      })
    })

    it('goes offline and uses the cache when a poll fails', async () => {
      api.fetchMessages.mockRejectedValue(new Error('gone'))
      store.lsGet.mockImplementation((key: string, fallback: unknown) =>
        key === 'irc_msgs_ch_general' ? [message('cached')] : fallback
      )

      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => {
        expect(result.current.error).toContain('offline')
      })
      expect(result.current.messages).toEqual([message('cached')])
    })
  })

  describe('switching channel', () => {
    it('clears the previous channel messages immediately', async () => {
      api.fetchChannels.mockResolvedValue([
        channel('ch_general'),
        channel('ch_dev'),
      ])
      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => expect(result.current.messages).toHaveLength(1))

      act(() => result.current.setActiveChannelId('ch_dev'))

      // Stale messages under a new channel name would be a real confusion.
      expect(result.current.activeChannelId).toBe('ch_dev')
    })

    it('fetches the new channel', async () => {
      api.fetchChannels.mockResolvedValue([
        channel('ch_general'),
        channel('ch_dev'),
      ])
      const { result } = renderHook(() => useIrcChat())

      await waitFor(() => expect(result.current.loading).toBe(false))
      act(() => result.current.setActiveChannelId('ch_dev'))

      await waitFor(() => {
        expect(api.fetchMessages).toHaveBeenCalledWith('ch_dev')
      })
    })
  })

  describe('sending', () => {
    it('posts to the server when online', async () => {
      const { result } = renderHook(() => useIrcChat())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.sendMessage('hello', 'alice')
      })

      expect(api.postMessage).toHaveBeenCalledWith(
        'ch_general',
        'hello',
        'alice',
        'default'
      )
    })

    it('keeps the message locally when the post fails', async () => {
      api.postMessage.mockRejectedValue(new Error('no route'))
      const { result } = renderHook(() => useIrcChat())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.sendMessage('hello', 'alice')
      })

      // Losing what someone typed because the server blinked is the worst
      // available outcome, so it is written to the local cache instead.
      expect(result.current.messages.at(-1)?.content).toBe('hello')
      expect(store.lsSet).toHaveBeenCalledWith(
        'irc_msgs_ch_general',
        expect.arrayContaining([expect.objectContaining({ content: 'hello' })])
      )
    })

    it('does nothing with no channel selected', async () => {
      api.fetchChannels.mockResolvedValue([])
      store.lsGet.mockReturnValue([])
      api.fetchChannels.mockRejectedValue(new Error('offline'))

      const { result } = renderHook(() => useIrcChat())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.sendMessage('x', 'alice')
      })

      expect(api.postMessage).not.toHaveBeenCalled()
    })
  })

  describe('clearLocalMessages', () => {
    it('empties the cache and the view', async () => {
      const { result } = renderHook(() => useIrcChat())
      await waitFor(() => expect(result.current.messages).toHaveLength(1))

      act(() => result.current.clearLocalMessages())

      expect(result.current.messages).toEqual([])
      expect(store.lsSet).toHaveBeenCalledWith('irc_msgs_ch_general', [])
    })
  })
})
