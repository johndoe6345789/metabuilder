import type { RunDebugInfo } from '@/hooks/useCodeTerminal'
import { DebugFilesTable } from './DebugFilesTable'
import { DebugTree } from './DebugTree'
import styles from './snippet-view-page.module.scss'

interface DebugPanelProps {
  lastRunInfo: RunDebugInfo | null
}

export function DebugPanel({ lastRunInfo }: DebugPanelProps) {
  if (!lastRunInfo) return (
    <section className={styles.debugSection}>
      <p className={styles.debugEmpty}>
        Press <strong>Run</strong> to see how this snippet is executed.
      </p>
    </section>
  )

  const {
    language, runnerKey, interactive, startedAt,
    entryPointOriginal, entryPointSent, files,
  } = lastRunInfo

  return (
    <>
      <section className={styles.debugSection}>
        <h3 className={styles.debugHeading}>How it ran</h3>
        <p className={styles.debugNote}>
          Your files were renamed to random IDs before being sent to
          the runner, so your file names never appear in the
          container. The file to run was picked by matching the
          stored entry point — if it didn&apos;t match any file
          name, the first file was used instead.
        </p>
      </section>

      <section className={styles.debugSection}>
        <h3 className={styles.debugHeading}>Runner</h3>
        <dl className={styles.debugTable}>
          <dt>Language</dt><dd>{language}</dd>
          <dt>Runner</dt>
          <dd className={styles.debugMono}>{runnerKey}</dd>
          <dt>Mode</dt>
          <dd>
            {interactive
              ? 'Interactive — reads input() in real time'
              : 'Non-interactive — runs to completion'}
          </dd>
          <dt>Started at</dt>
          <dd>{new Date(startedAt).toLocaleTimeString()}</dd>
        </dl>
      </section>

      <section className={styles.debugSection}>
        <h3 className={styles.debugHeading}>Entry point</h3>
        <dl className={styles.debugTable}>
          <dt>Stored value</dt>
          <dd className={styles.debugMono}>
            {entryPointOriginal || <em>not set</em>}
          </dd>
          <dt>Ran as</dt>
          <dd className={styles.debugMono}>{entryPointSent}</dd>
          {entryPointOriginal !== entryPointSent && (
            <>
              <dt></dt>
              <dd className={styles.debugWarn}>
                Stored value didn&apos;t match any file — fell back
                to the first file.
              </dd>
            </>
          )}
        </dl>
      </section>

      <section className={styles.debugSection}>
        <h3 className={styles.debugHeading}>Files</h3>
        <DebugFilesTable
          files={files}
          entryPointSent={entryPointSent}
        />
      </section>

      <section className={styles.debugSection}>
        <h3 className={styles.debugHeading}>
          Container workspace
        </h3>
        <p className={styles.debugNote}>
          What <code>/workspace/</code> looked like inside the
          runner container:
        </p>
        <DebugTree
          files={files}
          entryPointSent={entryPointSent}
        />
      </section>
    </>
  )
}
