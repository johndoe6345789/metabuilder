'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchSharedSnippet } from '@/store/slices/shareSlice'
import { selectSharedSnippet, selectShareLoading } from '@/store/selectors'
import { ForkDialog } from '@/components/features/snippet-viewer/ForkDialog'
import { LANGUAGE_COLORS } from '@/lib/config'
import styles from './share-page.module.scss'

const MonacoEditor = dynamic(
  () => import('@/components/features/snippet-editor/MonacoEditor').then(mod => ({ default: mod.MonacoEditor })),
  { ssr: false }
)

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const dispatch = useAppDispatch()
  const snippet = useAppSelector(state => selectSharedSnippet(state, token))
  const loading = useAppSelector(selectShareLoading)
  const [copied, setCopied] = useState(false)
  const [forkOpen, setForkOpen] = useState(false)

  useEffect(() => {
    if (token) dispatch(fetchSharedSnippet(token))
  }, [token, dispatch])

  function handleCopy() {
    if (!snippet) return
    const code = snippet.files?.length
      ? snippet.files.map(f => `// ${f.name}\n${f.content}`).join('\n\n')
      : snippet.code
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading && !snippet) {
    return (
      <div className={styles.centered}>
        <span className={styles.muted}>Loading…</span>
      </div>
    )
  }

  if (!snippet) {
    return (
      <div className={styles.centered}>
        <MaterialIcon name="link_off" size={48} className={styles.notFoundIcon} aria-hidden="true" />
        <h1 className={styles.notFoundTitle}>Link not found</h1>
        <p className={styles.notFoundText}>This share link has expired or been revoked.</p>
      </div>
    )
  }

  const langColor = LANGUAGE_COLORS[snippet.language] ?? '#888'
  const displayCode = snippet.files?.[0]?.content ?? snippet.code

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{snippet.title}</h1>
          <span
            className={styles.langChip}
            style={{ borderColor: langColor, color: langColor }}
          >
            {snippet.language}
          </span>
        </div>
        {snippet.description && (
          <p className={styles.description}>{snippet.description}</p>
        )}
        {snippet.authorUsername && (
          <p className={styles.author}>
            <MaterialIcon name="person" size={14} aria-hidden="true" />
            Shared by <strong>@{snippet.authorUsername}</strong>
          </p>
        )}
      </div>

      {/* File tabs if multi-file */}
      {snippet.files && snippet.files.length > 1 && (
        <div className={styles.fileTabs}>
          {snippet.files.map(f => (
            <span key={f.name} className={styles.fileTab}>{f.name}</span>
          ))}
        </div>
      )}

      {/* Code area */}
      <div className={styles.codeWrap}>
        <div className={styles.codeToolbar}>
          <button
            className={styles.copyBtn}
            onClick={handleCopy}
            aria-label="Copy code"
          >
            <MaterialIcon name={copied ? 'check' : 'content_copy'} size={14} aria-hidden="true" />
            {copied ? 'Copied!' : 'Copy code'}
          </button>
          <button
            className={styles.copyBtn}
            onClick={() => setForkOpen(true)}
            aria-label="Fork snippet"
          >
            <MaterialIcon name="call_split" size={14} aria-hidden="true" />
            Fork
          </button>
        </div>
        <MonacoEditor
          value={displayCode}
          language={snippet.language}
          readOnly
          height="60vh"
          onChange={() => {}}
        />
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <a href="/" className={styles.footerLink}>
          <MaterialIcon name="code" size={14} aria-hidden="true" />
          CodeSnippets — build your own
        </a>
      </div>

      <ForkDialog
        open={forkOpen}
        onClose={() => setForkOpen(false)}
        snippet={snippet}
        isShared
        token={token}
      />
    </div>
  )
}
