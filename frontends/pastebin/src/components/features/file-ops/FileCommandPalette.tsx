'use client'

import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useFileCommandPalette } from './hooks/useFileCommandPalette'
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

export function FileCommandPalette({
  open,
  onClose,
  commands,
}: FileCommandPaletteProps) {
  const vm = useFileCommandPalette(open, commands)

  if (!open) return null

  const execute = (cmd: CommandItem) => {
    cmd.action()
    onClose()
  }

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
        onKeyDown={e => vm.handleKeyDown(e, onClose)}
      >
        <div className={styles.searchRow}>
          <span className={styles.searchPrompt} aria-hidden="true">
            {'>'}
          </span>
          <input
            ref={vm.inputRef}
            className={styles.searchInput}
            placeholder="Type a command…"
            value={vm.query}
            onChange={e => vm.setQuery(e.target.value)}
            aria-label="Command search"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className={styles.escHint}>esc</kbd>
        </div>

        <div className={styles.list} role="listbox" aria-label="Commands">
          {Object.entries(vm.groupMap).map(([group, items]) => (
            <div key={group} className={styles.group}>
              <div
                className={styles.groupLabel}
                aria-hidden="true"
              >
                {group}
              </div>
              {items.map(({ cmd, flatIdx }) => {
                const isActive = flatIdx === vm.activeIdx
                return (
                  <button
                    key={cmd.id}
                    className={`${styles.item} ${
                      isActive ? styles.itemActive : ''
                    } ${cmd.danger ? styles.itemDanger : ''}`}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => vm.setActiveIdx(flatIdx)}
                    role="option"
                    aria-selected={isActive}
                  >
                    <MaterialIcon
                      name={cmd.icon}
                      size={14}
                      className={styles.itemIcon}
                    />
                    <span className={styles.itemLabel}>
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <kbd className={styles.shortcut}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                )
              })}
            </div>
          ))}

          {vm.filtered.length === 0 && (
            <div className={styles.empty}>
              No commands match &ldquo;{vm.query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
