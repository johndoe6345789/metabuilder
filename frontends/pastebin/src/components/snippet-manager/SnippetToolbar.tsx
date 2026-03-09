import { useState, useEffect, useRef } from 'react'
import { Button, Input, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import { SnippetTemplate } from '@/lib/types'
import { TemplatePicker } from '@/components/features/snippet-editor/TemplatePicker'
import styles from './snippet-toolbar.module.scss'

interface SnippetToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectionMode: boolean
  onToggleSelectionMode: () => void
  onCreateNew: () => void
  onCreateFromTemplate: (templateId: string) => void
  templates: SnippetTemplate[]
}

export function SnippetToolbar({
  searchQuery,
  onSearchChange,
  selectionMode,
  onToggleSelectionMode,
  onCreateNew,
  onCreateFromTemplate,
  templates,
}: SnippetToolbarProps) {
  const t = useTranslation()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [inputValue, setInputValue] = useState(searchQuery)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  const handleSearchInput = (value: string) => {
    setInputValue(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => onSearchChange(value), 300)
  }

  return (
    <div className={styles.toolbar} data-testid="snippet-toolbar" role="toolbar" aria-label="Snippet management toolbar">
      <div className={styles.searchContainer} data-testid="search-container">
        <MaterialIcon
          name="search"
          className={styles.searchIcon}
          size={18}
          aria-hidden="true"
        />
        <Input
          placeholder={t.app.search.placeholder}
          value={inputValue}
          onChange={(e) => handleSearchInput(e.target.value)}
          className={styles.searchInput}
          data-testid="snippet-search-input"
          aria-label="Search snippets"
        />
      </div>
      <div className={styles.actions} data-testid="toolbar-actions">
        <Button
          variant={selectionMode ? "filled" : "outline"}
          onClick={onToggleSelectionMode}
          className={styles.btnGap}
          data-testid="snippet-selection-mode-btn"
          aria-pressed={selectionMode}
          aria-label={selectionMode ? "Cancel selection mode" : "Enter selection mode"}
        >
          {selectionMode ? (
            <>
              <MaterialIcon name="close" aria-hidden="true" />
              {t.snippetToolbar.cancelSelection}
            </>
          ) : (
            <>
              <MaterialIcon name="check_box" aria-hidden="true" />
              {t.snippetToolbar.select}
            </>
          )}
        </Button>
        <Button
          className={styles.createBtn}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          data-testid="snippet-create-menu-trigger"
          aria-label="Create new snippet"
          aria-haspopup="menu"
        >
          <MaterialIcon name="add" aria-hidden="true" />
          {t.app.header.newSnippetButton}
          <MaterialIcon name="expand_more" aria-hidden="true" />
        </Button>
        <TemplatePicker
          anchor={menuAnchor}
          onClose={() => setMenuAnchor(null)}
          onCreateNew={onCreateNew}
          onCreateFromTemplate={onCreateFromTemplate}
          data-testid="create-menu-content"
          sections={[
            { label: 'React Components', templates: templates.filter(t => t.category === 'react') },
            { label: 'JavaScript / TypeScript', templates: templates.filter(t => ['api', 'basics', 'async', 'types'].includes(t.category)) },
            { label: 'CSS Layouts', templates: templates.filter(t => t.category === 'layout') },
            { label: 'Python — Project Euler', templates: templates.filter(t => t.category === 'euler') },
            { label: 'Python — Algorithms', templates: templates.filter(t => t.category === 'algorithms' && t.language === 'Python') },
            { label: 'Python — Interactive', templates: templates.filter(t => t.category === 'interactive') },
            { label: 'Go / Rust / Java / C++', templates: templates.filter(t => t.category === 'example' && ['Go', 'Rust', 'Java', 'C++'].includes(t.language)) },
            { label: 'JS / TS Examples', templates: templates.filter(t => t.category === 'example' && ['JavaScript', 'TypeScript'].includes(t.language)) },
            { label: 'Ruby / PHP / Kotlin / Swift', templates: templates.filter(t => t.category === 'example' && ['Ruby', 'PHP', 'Kotlin', 'Swift'].includes(t.language)) },
            { label: 'Scala / Haskell / Elixir / Dart', templates: templates.filter(t => t.category === 'example' && ['Scala', 'Haskell', 'Elixir', 'Dart'].includes(t.language)) },
            { label: 'R / Julia / Lua / Perl / Bash / C#', templates: templates.filter(t => t.category === 'example' && ['R', 'Julia', 'Lua', 'Perl', 'Bash', 'C#'].includes(t.language)) },
          ]}
        />
      </div>
    </div>
  )
}
