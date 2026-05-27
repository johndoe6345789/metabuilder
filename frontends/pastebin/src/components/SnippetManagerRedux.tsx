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
  const vm = useSnippetManager(templates)
  const isInitialLoad = vm.loading && vm.snippets.length === 0

  if (isInitialLoad) {
    return (
      <div
        className={styles.loadingContainer}
        data-testid="snippet-manager-loading"
        role="status"
        aria-busy="true"
        aria-label="Loading snippets"
      >
        <p className={styles.loadingText}>Loading snippets...</p>
      </div>
    )
  }

  if (!vm.loading && vm.snippets.length === 0) {
    return (
      <>
        <div
          className={styles.namespaceWrapper}
          data-testid="empty-state-namespace-selector"
        >
          <NamespaceSelector
            selectedNamespaceId={vm.selectedNamespaceId}
            onNamespaceChange={vm.handleNamespaceChange}
          />
        </div>
        <EmptyState
          onCreateClick={vm.handleCreateNew}
          onCreateFromTemplate={vm.handleCreateFromTemplate}
        />
      </>
    )
  }

  return (
    <div
      className={styles.root}
      data-testid="snippet-manager-redux"
      aria-label="Snippet manager"
    >
      <div className={styles.controlBar}>
        <NamespaceSelector
          selectedNamespaceId={vm.selectedNamespaceId}
          onNamespaceChange={vm.handleNamespaceChange}
        />
        {vm.loading && (
          <span
            className={styles.gridLoadingIndicator}
            role="status"
            aria-label="Loading snippets"
          >
            Loading...
          </span>
        )}
        <SnippetToolbar
          searchQuery={vm.searchQuery}
          onSearchChange={vm.handleSearchChange}
          selectionMode={vm.selectionMode}
          onToggleSelectionMode={vm.handleToggleSelectionMode}
          onCreateNew={vm.handleCreateNew}
          onCreateFromTemplate={vm.handleCreateFromTemplate}
          templates={templates}
        />
      </div>

      {vm.selectionMode && (
        <SelectionControls
          selectedIds={vm.selectedIds}
          totalFilteredCount={vm.filteredSnippets.length}
          namespaces={vm.namespaces}
          currentNamespaceId={vm.selectedNamespaceId}
          onSelectAll={vm.handleSelectAll}
          onBulkMove={vm.handleBulkMove}
        />
      )}

      {vm.filteredSnippets.length === 0 && vm.searchQuery && (
        <div
          className={styles.noResultsContainer}
          data-testid="no-results-message"
          role="status"
        >
          <p className={styles.noResultsText}>
            No snippets found matching &ldquo;{vm.searchQuery}&rdquo;
          </p>
        </div>
      )}

      <div
        className={`${styles.gridWrapper}${vm.loading ? ` ${styles.gridFading}` : ''}`}
        aria-busy={vm.loading}
      >
        <SnippetGrid
          snippets={vm.filteredSnippets}
          onView={vm.handleViewSnippet}
          onEdit={vm.handleEditSnippet}
          onDelete={vm.handleDeleteSnippet}
          onCopy={vm.handleCopyCode}
          onMove={vm.handleMoveSnippet}
          selectionMode={vm.selectionMode}
          selectedIds={vm.selectedIds}
          onToggleSelect={vm.handleToggleSnippetSelection}
        />
      </div>
    </div>
  )
}
