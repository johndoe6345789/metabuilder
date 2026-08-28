'use client'

import { useCallback, useEffect, useState } from 'react'
import { idbGet, idbSet } from '@/lib/persist/idb-kv'

const KEY = 'pkg.webchat.messages'

export interface ChatMessage {
  id: string
  sender: string
  text: string
  at: number
}

function seed(): ChatMessage[] {
  return [
    {
      id: 'm1',
      sender: 'system',
      text: 'Welcome to the channel 👋',
      at: Date.now() - 60000,
    },
  ]
}

/** Message store for the webchat package (IndexedDB-backed). */
export function useWebchat(sender: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(seed)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    void idbGet<ChatMessage[]>(KEY).then(m => {
      if (m?.length) setMessages(m)
    })
  }, [])

  const send = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    setMessages(prev => {
      const next = [
        ...prev,
        { id: `m_${Date.now()}`, sender, text, at: Date.now() },
      ]
      void idbSet(KEY, next)
      return next
    })
    setDraft('')
  }, [draft, sender])

  return { messages, draft, setDraft, send }
}
