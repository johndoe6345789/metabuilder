import { SnippetDialog } from '@/components/features/snippet-editor/SnippetDialog'
import { SnippetViewer } from '@/components/features/snippet-viewer/SnippetViewer'
import { EmptyState } from '@/components/features/snippet-display/EmptyState'
import { NamespaceSelector } from '@/components/features/namespace-manager/NamespaceSelector'
import { SnippetTemplate } from '@/lib/types'
import templatesData from '@/data/templates.json'
import { useSnippetManager } from '@/hooks/useSnippetManager'
import { SnippetToolbar } from '@/components/snippet-manager/SnippetToolbar'
import { SelectionControls } from '@/components/snippet-manager/SelectionControls'
import { SnippetGrid } from '@/components/snippet-manager/SnippetGrid'

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
    dialogOpen,
    viewerOpen,
    editingSnippet,
    viewingSnippet,
    searchQuery,
    handleSaveSnippet,
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
    handleDialogClose,
    handleViewerClose,
  } = useSnippetManager(templates)

  if (loading) {
    return (
      <div className="text-center py-20" data-testid="snippet-manager-loading" role="status" aria-busy="true" aria-label="Loading snippets">
        <p className="text-muted-foreground">Loading snippets...</p>
      </div>
    )
  }

  if (snippets.length === 0) {
    return (
      <>
        <div className="mb-6" data-testid="empty-state-namespace-selector">
          <NamespaceSelector
            selectedNamespaceId={selectedNamespaceId}
            onNamespaceChange={handleNamespaceChange}
          />
        </div>
        <EmptyState
          onCreateClick={handleCreateNew}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
        <SnippetDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          onSave={handleSaveSnippet}
          editingSnippet={editingSnippet}
        />
      </>
    )
  }

  return (
    <div className="space-y-6" data-testid="snippet-manager-redux" role="main" aria-label="Snippet manager">
      <NamespaceSelector
        selectedNamespaceId={selectedNamespaceId}
        onNamespaceChange={handleNamespaceChange}
      />
      
      <SnippetToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        onCreateNew={handleCreateNew}
        onCreateFromTemplate={handleCreateFromTemplate}
        templates={templates}
      />

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
        <div className="text-center py-20" data-testid="no-results-message" role="status">
          <p className="text-muted-foreground">No snippets found matching "{searchQuery}"</p>
        </div>
      )}

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

      <SnippetDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleSaveSnippet}
        editingSnippet={editingSnippet}
      />

      <SnippetViewer
        open={viewerOpen}
        onOpenChange={handleViewerClose}
        snippet={viewingSnippet}
        onEdit={handleEditSnippet}
        onCopy={handleCopyCode}
      />
    </div>
  )
}
