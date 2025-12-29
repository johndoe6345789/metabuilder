import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'

import type { User } from '@/lib/level-types'

import { ChatWindow } from './irc/ChatWindow'
import { useChatInput, useFormattedTimes } from './irc/hooks'
import type { ChatMessage } from './irc/types'

export function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
