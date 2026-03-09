import { EmptyState } from '@/components/features/snippet-display/EmptyState'
import { NamespaceSelector } from '@/components/features/namespace-manager/NamespaceSelector'
import { SnippetTemplate } from '@/lib/types'
import templatesData from '@/data/templates.json'
import { useSnippetManager } from '@/hooks/useSnippetManager'
import { SnippetToolbar } from '@/components/snippet-manager/SnippetToolbar'
import { SelectionControls } from '@/components/snippet-manager/SelectionControls'
import { SnippetGrid } from '@/components/snippet-manager/SnippetGrid'
import styles from '@/components/snippet-manager/snippet-manager.module.scss'

const templates = templatesData as SnippetTemplate[]

export function SnippetManagerRedux() {
  const {
    snippets,
    filteredSnippets,
    loading,
    selectionMode,
    selectedIds,
    namespaces,
    selectedNamespaceId,
    searchQuery,
    handleEditSnippet,
    handleDeleteSnippet,
    handleCopyCode,
    handleViewSnippet,
    handleMoveSnippet,
    handleCreateNew,
    handleCreateFromTemplate,
    handleToggleSelectionMode,
    handleToggleSnippetSelection,
    handleSelectAll,
    handleBulkMove,
    handleNamespaceChange,
    handleSearchChange,
  } = useSnippetManager(templates)

  const isInitialLoad = loading && snippets.length === 0

  if (isInitialLoad) {
    return (
      <div className={styles.loadingContainer} data-testid="snippet-manager-loading" role="status" aria-busy="true" aria-label="Loading snippets">
        <p className={styles.loadingText}>Loading snippets...</p>
      </div>
    )
  }

  if (!loading && snippets.length === 0) {
    return (
      <>
        <div className={styles.namespaceWrapper} data-testid="empty-state-namespace-selector">
          <NamespaceSelector
            selectedNamespaceId={selectedNamespaceId}
            onNamespaceChange={handleNamespaceChange}
          />
        </div>
        <EmptyState
          onCreateClick={handleCreateNew}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      </>
    )
  }

  return (
    <div className={styles.root} data-testid="snippet-manager-redux" aria-label="Snippet manager">
      <div className={styles.controlBar}>
        <NamespaceSelector
          selectedNamespaceId={selectedNamespaceId}
          onNamespaceChange={handleNamespaceChange}
        />
        {loading && <span className={styles.gridLoadingIndicator} role="status" aria-label="Loading snippets">Loading...</span>}
        <SnippetToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectionMode={selectionMode}
          onToggleSelectionMode={handleToggleSelectionMode}
          onCreateNew={handleCreateNew}
          onCreateFromTemplate={handleCreateFromTemplate}
          templates={templates}
        />
      </div>

      {selectionMode && (
        <SelectionControls
          selectedIds={selectedIds}
          totalFilteredCount={filteredSnippets.length}
          namespaces={namespaces}
          currentNamespaceId={selectedNamespaceId}
          onSelectAll={handleSelectAll}
          onBulkMove={handleBulkMove}
        />
      )}

      {filteredSnippets.length === 0 && searchQuery && (
        <div className={styles.noResultsContainer} data-testid="no-results-message" role="status">
          <p className={styles.noResultsText}>No snippets found matching &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}

      <div className={`${styles.gridWrapper}${loading ? ` ${styles.gridFading}` : ''}`} aria-busy={loading}>
        <SnippetGrid
          snippets={filteredSnippets}
          onView={handleViewSnippet}
          onEdit={handleEditSnippet}
          onDelete={handleDeleteSnippet}
          onCopy={handleCopyCode}
          onMove={handleMoveSnippet}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSnippetSelection}
        />
      </div>

    </div>
  )
}
