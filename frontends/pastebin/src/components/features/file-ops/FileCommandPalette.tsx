'use client'

import { useEffect, useRef, useState } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './file-command-palette.module.scss'

export interface CommandItem {
  id: string
  label: string
  icon: string
  shortcut?: string
  action: () => void
  disabled?: boolean
  danger?: boolean
  group: string
}

interface FileCommandPaletteProps {
  open: boolean
  onClose: () => void
  commands: CommandItem[]
}

export function FileCommandPalette({ open, onClose, commands }: FileCommandPaletteProps) {
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

  useEffect(() => { setActiveIdx(0) }, [query])

  if (!open) return null

  const available = commands.filter(c => !c.disabled)
  const filtered = available.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  // Build grouped list and flat index map in one pass
  const groupMap: Record<string, { cmd: CommandItem; flatIdx: number }[]> = {}
  let counter = 0
  for (const cmd of filtered) {
    if (!groupMap[cmd.group]) groupMap[cmd.group] = []
    groupMap[cmd.group].push({ cmd, flatIdx: counter++ })
  }
  const flatFiltered = filtered

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, flatFiltered.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = flatFiltered[activeIdx]
      if (cmd) { cmd.action(); onClose() }
    }
  }

  const execute = (cmd: CommandItem) => { cmd.action(); onClose() }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className={styles.palette}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.searchRow}>
          <span className={styles.searchPrompt} aria-hidden="true">{'>'}</span>
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Type a command…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Command search"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className={styles.escHint}>esc</kbd>
        </div>

        <div className={styles.list} role="listbox" aria-label="Commands">
          {Object.entries(groupMap).map(([group, items]) => (
            <div key={group} className={styles.group}>
              <div className={styles.groupLabel} aria-hidden="true">{group}</div>
              {items.map(({ cmd, flatIdx }) => {
                const isActive = flatIdx === activeIdx
                return (
                  <button
                    key={cmd.id}
                    className={`${styles.item} ${isActive ? styles.itemActive : ''} ${cmd.danger ? styles.itemDanger : ''}`}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setActiveIdx(flatIdx)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <MaterialIcon name={cmd.icon} size={14} className={styles.itemIcon} />
                    <span className={styles.itemLabel}>{cmd.label}</span>
                    {cmd.shortcut && <kbd className={styles.shortcut}>{cmd.shortcut}</kbd>}
                  </button>
                )
              })}
            </div>
          ))}

          {flatFiltered.length === 0 && (
            <div className={styles.empty}>
              No commands match &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
