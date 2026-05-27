import type { RunDebugInfo } from '@/hooks/useCodeTerminal'
import styles from './snippet-view-page.module.scss'

interface DebugFilesTableProps {
  files: RunDebugInfo['files']
  entryPointSent: string
}

export function DebugFilesTable({
  files,
  entryPointSent,
}: DebugFilesTableProps) {
  return (
    <table className={styles.debugFilesTable}>
      <thead>
        <tr>
          <th>Your file name</th>
          <th>Sent to container as</th>
        </tr>
      </thead>
      <tbody>
        {files.map(f => {
          const isEntry = f.uuidName === entryPointSent
          const isKept =
            f.uuidName === f.originalName.split('/').pop()
          return (
            <tr
              key={f.uuidName}
              className={isEntry ? styles.debugFileEntry : ''}
            >
              <td className={styles.debugMono}>{f.originalName}</td>
              <td className={styles.debugMono}>
                {isKept ? (
                  <em title="Name kept — required by build tool">
                    {f.uuidName}
                  </em>
                ) : (
                  f.uuidName
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
