import { Chip, Checkbox } from '@metabuilder/components/fakemui'
import { Snippet } from '@/lib/types'
import { LANGUAGE_COLORS } from '@/lib/config'
import styles from './snippet-card-header.module.scss'

interface SnippetCardHeaderProps {
  snippet: Snippet
  description: string
  selectionMode: boolean
  isSelected: boolean
  onToggleSelect: () => void
}

export function SnippetCardHeader({
  snippet,
  description,
  selectionMode,
  isSelected,
  onToggleSelect
}: SnippetCardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        {selectionMode && (
          <Checkbox
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect() }}
            onClick={(e) => e.stopPropagation()}
            className={styles.checkboxWrapper}
            data-testid={`snippet-select-checkbox-${snippet.id}`}
            aria-label={`Select snippet: ${snippet.title}`}
          />
        )}
        <div className={styles.titleGroup}>
          <h3
            className={styles.title}
            data-testid={`snippet-title-${snippet.id}`}
          >
            {snippet.title}
          </h3>
          {description && (
            <p
              className={styles.description}
              data-testid={`snippet-description-${snippet.id}`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      <Chip
        label={snippet.language}
        className={`${styles.chip} ${LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS['Other']}`}
        data-testid={`snippet-language-badge-${snippet.id}`}
        aria-label={`Language: ${snippet.language}`}
      />
    </div>
  )
}
