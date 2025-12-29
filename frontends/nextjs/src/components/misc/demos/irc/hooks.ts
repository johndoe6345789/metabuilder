import { useEffect, useState } from 'react'

import type { ChatMessage } from './types'

type TimestampFormatter = (timestamp: number) => Promise<string> | string

export function useChatInput(onSubmit: () => void) {
  const [inputMessage, setInputMessage] = useState('')

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  return {
    inputMessage,
    setInputMessage,
    handleKeyPress,
  }
}

export function useFormattedTimes(
  messages: ChatMessage[] | undefined,
  formatTime: TimestampFormatter
) {
  const [formattedTimes, setFormattedTimes] = useState<Record<string, string>>({})

  useEffect(() => {
    let isMounted = true

    const formatAllTimes = async () => {
      if (!messages) {
        setFormattedTimes({})
        return
      }

      const entries = await Promise.all(
        messages.map(async message => {
          const formatted = await formatTime(message.timestamp)
          return [message.id, formatted] as const
        })
      )

      if (isMounted) {
        setFormattedTimes(Object.fromEntries(entries))
      }
    }

    formatAllTimes()

    return () => {
      isMounted = false
    }
  }, [messages, formatTime])

  return formattedTimes
}
