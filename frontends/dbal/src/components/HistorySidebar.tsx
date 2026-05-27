'use client'

import type { QueryHistoryEntry } from '../types'
import { methodColor } from '../queryUtils'
import styles from '../QueryConsole.module.scss'

interface HistorySidebarProps {
  history: QueryHistoryEntry[]
  onSelect: (entry: QueryHistoryEntry) => void
  onClear: () => void
}

function formatTime(ts: string): string {
  try { return new Date(ts).toLocaleTimeString() }
  catch { return ts }
}

export function HistorySidebar({
  history,
  onSelect,
  onClear,
}: HistorySidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 className={styles.sidebarTitle}>History</h3>
        {history.length > 0 && (
          <button
            className={styles.clearBtn}
            onClick={onClear}
            type="button"
          >
            Clear
          </button>
        )}
      </div>
      <div className={styles.historyList}>
        {history.length === 0 && (
          <p className={styles.emptyHistory}>No queries yet</p>
        )}
        {history.map(entry => (
          <div
            key={entry.id}
            className={styles.historyItem}
            onClick={() => onSelect(entry)}
          >
            {entry.cli ? (
              <span className={styles.historyPath}>$ {entry.cli}</span>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    className={styles.historyMethod}
                    style={{ color: methodColor(entry.method) }}
                  >
                    {entry.method}
                  </span>
                  <span
                    className={styles.historyStatus}
                    style={{
                      color:
                        entry.status >= 200 && entry.status < 300
                          ? '#4ade80'
                          : '#f87171',
                    }}
                  >
                    {entry.status}
                  </span>
                </div>
                <span className={styles.historyPath}>{entry.path}</span>
              </>
            )}
            <span className={styles.historyTime}>
              {formatTime(entry.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
