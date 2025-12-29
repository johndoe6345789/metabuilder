import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/level-types'
import { getDeclarativeRenderer } from '@/lib/rendering-lib/declarative-component-renderer'
import { ChatWindow } from './irc/ChatWindow'
import { useChatInput, useFormattedTimes } from './irc/hooks'
import type { ChatMessage } from './irc/types'

export async function formatTime(timestamp: number): Promise<string> {
    try {
      const formatted = await renderer.executeLuaScript('lua_irc_format_time', [timestamp])
      return formatted || new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch (error) {
      return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }
