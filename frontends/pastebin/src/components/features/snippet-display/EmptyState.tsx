import { Button, MaterialIcon } from '@metabuilder/components/m3'
import { useTranslation } from '@/hooks/useTranslation'
// eslint-disable-next-line max-len
import { TemplatePicker } from '@/components/features/snippet-editor/TemplatePicker'
import { useEmptyState } from './hooks/useEmptyState'
import { EMPTY_STATE_SECTIONS } from './empty-state-sections'
import styles from './empty-state.module.scss'

interface EmptyStateProps {
  onCreateClick: () => void
  onCreateFromTemplate?: (templateId: string) => void
}

export function EmptyState({
  onCreateClick,
  onCreateFromTemplate,
}: EmptyStateProps) {
  const t = useTranslation()
  const { menuAnchor, setMenuAnchor } = useEmptyState()

  return (
    <div
      className={
        `${styles.container} flex flex-col items-center ` +
        `justify-center py-20 px-4 text-center`
      }
      data-testid="empty-state"
      role="status"
      aria-live="polite"
      aria-label="No snippets available"
    >
      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="empty-state-message"
      >
        {t.emptyState.title}. {t.emptyState.description}
      </div>

      <div
        className={`${styles.iconContainer} bg-accent rounded-full`}
        aria-hidden="true"
      >
        <MaterialIcon name="code" className={styles.icon} />
      </div>
      <h2 className={styles.title}>{t.emptyState.title}</h2>
      <p className={`${styles.description} text-muted-foreground`}>
        {t.emptyState.description}
      </p>
      <Button
        size="lg"
        className="gap-2"
        data-testid="empty-state-create-menu"
        aria-label="Create new snippet from templates"
        aria-haspopup="menu"
        aria-expanded={Boolean(menuAnchor)}
        onClick={e => setMenuAnchor(menuAnchor ? null : e.currentTarget)}
      >
        <span className={styles.btnInner}>
          <MaterialIcon name="code" size={20} aria-hidden="true" />
          {t.emptyState.buttonText}
          <MaterialIcon
            name="expand_more"
            aria-hidden="true"
            className={
              menuAnchor ? `${styles.caret} ${styles.caretOpen}` : styles.caret
            }
          />
        </span>
      </Button>
      <TemplatePicker
        anchor={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        onCreateNew={onCreateClick}
        onCreateFromTemplate={id => {
          onCreateFromTemplate?.(id)
        }}
        data-testid="empty-state-menu-content"
        sections={EMPTY_STATE_SECTIONS}
      />
    </div>
  )
}
