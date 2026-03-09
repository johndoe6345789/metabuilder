import { useState } from 'react'
import { Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import { SnippetTemplate } from '@/lib/types'
import templatesData from '@/data/templates.json'
import { TemplatePicker } from '@/components/features/snippet-editor/TemplatePicker'
import styles from './empty-state.module.scss'

const templates = templatesData as SnippetTemplate[]

interface EmptyStateProps {
  onCreateClick: () => void
  onCreateFromTemplate?: (templateId: string) => void
}

export function EmptyState({ onCreateClick, onCreateFromTemplate }: EmptyStateProps) {
  const t = useTranslation()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  return (
    <div
      className={`${styles.container} flex flex-col items-center justify-center py-20 px-4 text-center`}
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

      <div className={`${styles.iconContainer} bg-accent rounded-full`} aria-hidden="true">
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
        onClick={(e) => setMenuAnchor(menuAnchor ? null : e.currentTarget)}
      >
        <span className={styles.btnInner}>
          <MaterialIcon name="code" size={20} aria-hidden="true" />
          {t.emptyState.buttonText}
          <MaterialIcon name="expand_more" aria-hidden="true" className={menuAnchor ? `${styles.caret} ${styles.caretOpen}` : styles.caret} />
        </span>
      </Button>
      <TemplatePicker
        anchor={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        onCreateNew={onCreateClick}
        onCreateFromTemplate={(id) => { onCreateFromTemplate?.(id) }}
        data-testid="empty-state-menu-content"
        sections={[
          { label: 'React Components', templates: templates.filter(t => t.category === 'react') },
          { label: 'JavaScript / TypeScript', templates: templates.filter(t => ['api', 'basics', 'async', 'types'].includes(t.category)) },
          { label: 'CSS Layouts', templates: templates.filter(t => t.category === 'layout') },
          { label: 'Python - Project Euler', templates: templates.filter(t => t.category === 'euler') },
          { label: 'Python - Algorithms', templates: templates.filter(t => t.category === 'algorithms' && t.language === 'Python') },
          { label: 'Python - Interactive Programs', templates: templates.filter(t => t.category === 'interactive') },
          { label: 'Go / Rust / Java / C++', templates: templates.filter(t => t.category === 'example' && ['Go', 'Rust', 'Java', 'C++'].includes(t.language)) },
          { label: 'JS / TS Examples', templates: templates.filter(t => t.category === 'example' && ['JavaScript', 'TypeScript'].includes(t.language)) },
          { label: 'Ruby / PHP / Kotlin / Swift', templates: templates.filter(t => t.category === 'example' && ['Ruby', 'PHP', 'Kotlin', 'Swift'].includes(t.language)) },
          { label: 'Scala / Haskell / Elixir / Dart', templates: templates.filter(t => t.category === 'example' && ['Scala', 'Haskell', 'Elixir', 'Dart'].includes(t.language)) },
          { label: 'R / Julia / Lua / Perl / Bash / C#', templates: templates.filter(t => t.category === 'example' && ['R', 'Julia', 'Lua', 'Perl', 'Bash', 'C#'].includes(t.language)) },
        ]}
      />
    </div>
  )
}
