/**
 * useIrcChat — polling hook for IRC channels + messages
 * Falls back to localStorage mock when DBAL is offline
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { IrcChannel, IrcMessage, IrcChatState } from './types'
import { fetchChannels, fetchMessages, postMessage } from './irc-api'
import { lsGet, lsSet } from './irc-storage'

const POLL_MS = 3000

/** The rooms a community starts with, until it has its own. */
const defaultChannels = (tenantId: string): IrcChannel[] => [
  { id: 'ch_general', name: 'general', tenantId },
  { id: 'ch_dev', name: 'dev', tenantId },
  { id: 'ch_random', name: 'random', tenantId },
]

/**
 * Local fallback keys carry the tenant.
 *
 * Browser storage is scoped to the origin, not to the community, so one
 * key per channel put every community that signed in on this browser in
 * the same room -- and the chat ran on this fallback for its whole life,
 * because its URL could never reach DBAL.
 */
const channelsKey = (tenantId: string) => `irc_channels_${tenantId}`
const messagesKey = (tenantId: string, chId: string) =>
  `irc_msgs_${tenantId}_${chId}`

export interface UseIrcChatReturn extends IrcChatState {
  setActiveChannelId: (id: string) => void
  sendMessage: (content: string, username: string) => Promise<void>
  clearLocalMessages: () => void
}

/**
 * `tenantId` is required: it used to default to the constant 'default'
 * and the fetch helpers ignored the argument entirely, so every
 * community's members were reading and writing one shared set of rooms.
 */
export function useIrcChat(tenantId: string): UseIrcChatReturn {
  const [state, setState] = useState<IrcChatState>({
    channels: [],
    messages: [],
    activeChannelId: null,
    loading: true,
    error: null,
  })
  const offline = useRef(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load channels once on mount
  useEffect(() => {
    void (async () => {
      try {
        const list = await fetchChannels(tenantId)
        const channels = list.length > 0 ? list : defaultChannels(tenantId)
        lsSet(channelsKey(tenantId), channels)
        setState(s => ({
          ...s,
          channels,
          activeChannelId: s.activeChannelId ?? channels.at(0)?.id ?? null,
          loading: false,
        }))
      } catch {
        offline.current = true
        const channels = lsGet<IrcChannel[]>(
          channelsKey(tenantId),
          defaultChannels(tenantId)
        )
        setState(s => ({
          ...s,
          channels,
          activeChannelId: s.activeChannelId ?? channels.at(0)?.id ?? null,
          loading: false,
          error: 'DBAL offline — using local data',
        }))
      }
    })()
  }, [tenantId])

  // Poll messages for active channel
  useEffect(() => {
    if (timer.current != null) clearInterval(timer.current)
    const chId = state.activeChannelId
    if (chId == null) return

    const load = async () => {
      if (offline.current) {
        setState(s => ({
          ...s,
          messages: lsGet<IrcMessage[]>(messagesKey(tenantId, chId), []),
        }))
        return
      }
      try {
        const msgs = await fetchMessages(tenantId, chId)
        lsSet(messagesKey(tenantId, chId), msgs)
        setState(s => ({ ...s, messages: msgs }))
      } catch {
        offline.current = true
        setState(s => ({
          ...s,
          messages: lsGet<IrcMessage[]>(messagesKey(tenantId, chId), []),
          error: 'DBAL offline — using local data',
        }))
      }
    }

    void load()
    timer.current = setInterval(() => {
      void load()
    }, POLL_MS)
    return () => {
      if (timer.current != null) clearInterval(timer.current)
    }
     
  }, [state.activeChannelId, tenantId])

  const setActiveChannelId = useCallback((id: string) => {
    setState(s => ({ ...s, activeChannelId: id, messages: [] }))
  }, [])

  const sendMessage = useCallback(
    async (content: string, username: string) => {
      const chId = state.activeChannelId
      if (chId == null) return
      if (!offline.current) {
        try {
          await postMessage(tenantId, chId, content, username)
          return
        } catch {
          offline.current = true
        }
      }
      // offline — persist locally
      const msg: IrcMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        channelId: chId,
        content,
        createdBy: username,
        tenantId,
        createdAt: new Date().toISOString(),
        type: 'message',
      }
      const key = messagesKey(tenantId, chId)
      const msgs = [...lsGet<IrcMessage[]>(key, []), msg]
      lsSet(key, msgs)
      setState(s => ({ ...s, messages: msgs }))
    },
    [state.activeChannelId, tenantId]
  )

  const clearLocalMessages = useCallback(() => {
    const chId = state.activeChannelId
    if (chId == null) return
    lsSet(messagesKey(tenantId, chId), [])
    setState(s => ({ ...s, messages: [] }))
  }, [state.activeChannelId, tenantId])

  return { ...state, setActiveChannelId, sendMessage, clearLocalMessages }
}
