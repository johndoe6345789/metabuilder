/**
 * useIrcChat — polling hook for IRC channels + messages
 * Falls back to localStorage mock when DBAL is offline
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { IrcChannel, IrcMessage, IrcChatState } from './types'
import { fetchChannels, fetchMessages, postMessage } from './irc-api'
import { lsGet, lsSet } from './irc-storage'

const TENANT = 'default'
const POLL_MS = 3000

const DEFAULT_CHANNELS: IrcChannel[] = [
  { id: 'ch_general', name: 'general', tenantId: TENANT },
  { id: 'ch_dev',     name: 'dev',     tenantId: TENANT },
  { id: 'ch_random',  name: 'random',  tenantId: TENANT },
]

export interface UseIrcChatReturn extends IrcChatState {
  setActiveChannelId: (id: string) => void
  sendMessage: (content: string, username: string) => Promise<void>
  clearLocalMessages: () => void
}

export function useIrcChat(tenantId = TENANT): UseIrcChatReturn {
  const [state, setState] = useState<IrcChatState>({
    channels: [], messages: [], activeChannelId: null,
    loading: true, error: null,
  })
  const offline = useRef(false)
  const timer   = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load channels once on mount
  useEffect(() => {
    void (async () => {
      try {
        const list = await fetchChannels()
        const channels = list.length > 0 ? list : DEFAULT_CHANNELS
        lsSet('irc_channels', channels)
        setState(s => ({
          ...s, channels,
          activeChannelId: s.activeChannelId ?? (channels[0]?.id ?? null),
          loading: false,
        }))
      } catch {
        offline.current = true
        const channels = lsGet<IrcChannel[]>('irc_channels', DEFAULT_CHANNELS)
        setState(s => ({
          ...s, channels,
          activeChannelId: s.activeChannelId ?? (channels[0]?.id ?? null),
          loading: false, error: 'DBAL offline — using local data',
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
          ...s, messages: lsGet<IrcMessage[]>(`irc_msgs_${chId}`, []),
        }))
        return
      }
      try {
        const msgs = await fetchMessages(chId)
        lsSet(`irc_msgs_${chId}`, msgs)
        setState(s => ({ ...s, messages: msgs }))
      } catch {
        offline.current = true
        setState(s => ({
          ...s, messages: lsGet<IrcMessage[]>(`irc_msgs_${chId}`, []),
          error: 'DBAL offline — using local data',
        }))
      }
    }

    void load()
    timer.current = setInterval(() => { void load() }, POLL_MS)
    return () => { if (timer.current != null) clearInterval(timer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeChannelId])

  const setActiveChannelId = useCallback((id: string) => {
    setState(s => ({ ...s, activeChannelId: id, messages: [] }))
  }, [])

  const sendMessage = useCallback(async (
    content: string, username: string,
  ) => {
    const chId = state.activeChannelId
    if (chId == null) return
    if (!offline.current) {
      try { await postMessage(chId, content, username, tenantId); return }
      catch { offline.current = true }
    }
    // offline — persist locally
    const msg: IrcMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      channelId: chId, content, createdBy: username,
      tenantId, createdAt: new Date().toISOString(), type: 'message',
    }
    const msgs = [...lsGet<IrcMessage[]>(`irc_msgs_${chId}`, []), msg]
    lsSet(`irc_msgs_${chId}`, msgs)
    setState(s => ({ ...s, messages: msgs }))
  }, [state.activeChannelId, tenantId])

  const clearLocalMessages = useCallback(() => {
    const chId = state.activeChannelId
    if (chId == null) return
    lsSet(`irc_msgs_${chId}`, [])
    setState(s => ({ ...s, messages: [] }))
  }, [state.activeChannelId])

  return { ...state, setActiveChannelId, sendMessage, clearLocalMessages }
}
