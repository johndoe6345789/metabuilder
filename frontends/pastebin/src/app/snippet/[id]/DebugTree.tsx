import type { RunDebugInfo } from '@/hooks/useCodeTerminal'
import styles from './snippet-view-page.module.scss'

interface DebugTreeProps {
  files: RunDebugInfo['files']
  entryPointSent: string
}

export function DebugTree({ files, entryPointSent }: DebugTreeProps) {
  return (
    <div className={styles.debugTree}>
      <div className={styles.debugTreeRoot}>/workspace/</div>
      {files.map((f, i) => {
        const isLast = i === files.length - 1
        const isEntry = f.uuidName === entryPointSent
        const isKept =
          f.uuidName === f.originalName.split('/').pop()
        return (
          <div key={f.uuidName} className={styles.debugTreeRow}>
            <span className={styles.debugTreeBranch}>
              {isLast ? '└── ' : '├── '}
            </span>
            <span
              className={`${styles.debugMono} ${
                isEntry ? styles.debugTreeEntry : ''
              }`}
            >
              {f.uuidName}
            </span>
            <span className={styles.debugTreeOrig}>
              {'← '}
              {f.originalName}
              {isEntry ? ' (ran this)' : ''}
              {isKept ? ' (name kept for tooling)' : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}
