import { useEffect, useRef, useState } from 'react'
import type { CommandItem } from '../FileCommandPalette'

export function useFileCommandPalette(
  open: boolean,
  commands: CommandItem[],
) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  const available = commands.filter(c => !c.disabled)
  const filtered = available.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  )

  const groupMap: Record<
    string,
    { cmd: CommandItem; flatIdx: number }[]
  > = {}
  let counter = 0
  for (const cmd of filtered) {
    if (!groupMap[cmd.group]) groupMap[cmd.group] = []
    groupMap[cmd.group].push({ cmd, flatIdx: counter++ })
  }

  const handleKeyDown = (
    e: React.KeyboardEvent,
    onClose: () => void,
  ) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[activeIdx]
      if (cmd) { cmd.action(); onClose() }
    }
  }

  return {
    query,
    setQuery,
    activeIdx,
    setActiveIdx,
    inputRef,
    filtered,
    groupMap,
  }
}
