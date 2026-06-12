import { Button, Input, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import { SnippetTemplate } from '@/lib/types'
// eslint-disable-next-line max-len
import { TemplatePicker } from '@/components/features/snippet-editor/TemplatePicker'
import { useSnippetToolbar } from './hooks/useSnippetToolbar'
import { buildTemplateSections } from './template-sections'
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
  const { menuAnchor, inputValue, setMenuAnchor, handleSearchInput } =
    useSnippetToolbar(searchQuery, onSearchChange)

  return (
    <div
      className={styles.toolbar}
      data-testid="snippet-toolbar"
      role="toolbar"
      aria-label="Snippet management toolbar"
    >
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
          onChange={e => handleSearchInput(e.target.value)}
          className={styles.searchInput}
          data-testid="snippet-search-input"
          aria-label="Search snippets"
        />
      </div>
      <div className={styles.actions} data-testid="toolbar-actions">
        <Button
          variant={selectionMode ? 'filled' : 'outline'}
          onClick={onToggleSelectionMode}
          className={styles.btnGap}
          data-testid="snippet-selection-mode-btn"
          aria-pressed={selectionMode}
          aria-label={
            selectionMode ? 'Cancel selection mode' : 'Enter selection mode'
          }
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
          onClick={e => setMenuAnchor(e.currentTarget)}
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
          sections={buildTemplateSections(templates)}
        />
      </div>
    </div>
  )
}
