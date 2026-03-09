import { useTranslation } from '@/hooks/useTranslation'
import styles from './snippet-code-preview.module.scss'

interface SnippetCodePreviewProps {
  displayCode: string
  isTruncated: boolean
}

export function SnippetCodePreview({ displayCode, isTruncated }: SnippetCodePreviewProps) {
  const t = useTranslation()
  return (
    <div className={styles.previewContainer} data-testid="snippet-code-preview">
      <pre className={styles.code} data-testid="code-preview-content">
        {displayCode}
      </pre>
      {isTruncated && (
        <p className={styles.truncatedNotice} role="status" data-testid="code-truncated-notice">
          {t.snippetCard.viewFullCode}
        </p>
      )}
    </div>
  )
}
