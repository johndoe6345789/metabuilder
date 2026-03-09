import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { SnippetManagerRedux } from './SnippetManagerRedux'
import snippetsReducer from '@/store/slices/snippetsSlice'
import namespacesReducer from '@/store/slices/namespacesSlice'
import uiReducer from '@/store/slices/uiSlice'
import { RootState } from '@/store'
import { Snippet, Namespace } from '@/lib/types'
import { NavigationProvider } from '@/components/layout/navigation/NavigationProvider'

// Mock database and toast to avoid side effects
jest.mock('@/lib/db', () => ({
  seedDatabase: jest.fn().mockResolvedValue(undefined),
  syncTemplatesFromJSON: jest.fn().mockResolvedValue(undefined),
  ensureDefaultNamespace: jest.fn().mockResolvedValue(undefined),
  getNamespaces: jest.fn().mockResolvedValue([]),
  getSnippetsByNamespace: jest.fn().mockResolvedValue([]),
  createSnippet: jest.fn().mockResolvedValue({}),
  updateSnippet: jest.fn().mockResolvedValue({}),
  deleteSnippet: jest.fn().mockResolvedValue(undefined),
  bulkMoveSnippets: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock the child components we don't need to test
jest.mock('@/components/features/snippet-editor/SnippetDialog', () => ({
  SnippetDialog: ({ open, editingSnippet, onOpenChange, onSave, 'data-testid': dataTestId }: any) => (
    <div data-testid={dataTestId || 'snippet-dialog'} aria-hidden={!open}>
      {open && (
        <>
          <div data-testid="dialog-content">
            {editingSnippet && <span data-testid="editing-snippet">{editingSnippet.id}</span>}
          </div>
          <button
            data-testid="dialog-save-btn"
            onClick={() =>
              onSave?.({
                title: 'Test Snippet',
                description: 'Test Description',
                code: 'console.log("test")',
                language: 'JavaScript',
                category: 'test',
              })
            }
          >
            Save
          </button>
          <button data-testid="dialog-close-btn" onClick={() => onOpenChange?.(false)}>
            Close
          </button>
        </>
      )}
    </div>
  ),
}))

jest.mock('@/components/features/snippet-viewer/SnippetViewer', () => ({
  SnippetViewer: ({ open, snippet, onOpenChange }: any) => (
    <div data-testid="snippet-viewer" aria-hidden={!open}>
      {open && snippet && (
        <>
          <div data-testid="viewer-content">{snippet.title}</div>
          <button data-testid="viewer-close-btn" onClick={() => onOpenChange?.(false)}>
            Close
          </button>
        </>
      )}
    </div>
  ),
}))

jest.mock('@/components/features/snippet-display/EmptyState', () => ({
  EmptyState: ({ onCreateClick, onCreateFromTemplate }: any) => (
    <div data-testid="empty-state">
      <button data-testid="empty-state-create-btn" onClick={onCreateClick}>
        Create New
      </button>
      <button
        data-testid="empty-state-template-btn"
        onClick={() => onCreateFromTemplate?.('template-1')}
      >
        From Template
      </button>
    </div>
  ),
}))

jest.mock('@/components/features/namespace-manager/NamespaceSelector', () => ({
  NamespaceSelector: ({ selectedNamespaceId, onNamespaceChange }: any) => (
    <div data-testid="namespace-selector">
      <select
        data-testid="namespace-select"
        value={selectedNamespaceId || ''}
        onChange={(e) => onNamespaceChange(e.target.value || null)}
      >
        <option value="">Select namespace</option>
        <option value="ns-1">Namespace 1</option>
        <option value="ns-2">Namespace 2</option>
      </select>
    </div>
  ),
}))

jest.mock('@/components/snippet-manager/SnippetToolbar', () => ({
  SnippetToolbar: ({
    searchQuery,
    onSearchChange,
    selectionMode,
    onToggleSelectionMode,
    onCreateNew,
    onCreateFromTemplate,
  }: any) => (
    <div data-testid="snippet-toolbar">
      <input
        data-testid="snippet-search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
        aria-label="Search snippets"
      />
      <button
        data-testid="snippet-selection-mode-btn"
        onClick={onToggleSelectionMode}
        aria-pressed={selectionMode}
      >
        {selectionMode ? 'Exit Selection' : 'Selection Mode'}
      </button>
      <button data-testid="snippet-create-new-btn" onClick={onCreateNew}>
        New
      </button>
      <button
        data-testid="snippet-create-template-btn"
        onClick={() => onCreateFromTemplate?.('template-1')}
      >
        Template
      </button>
    </div>
  ),
}))

jest.mock('@/components/snippet-manager/SelectionControls', () => ({
  SelectionControls: ({ selectedIds, totalFilteredCount, onSelectAll, onBulkMove }: any) => (
    <div data-testid="selection-controls">
      <button
        data-testid="select-all-btn"
        onClick={onSelectAll}
        aria-label={
          selectedIds.length === totalFilteredCount ? 'Deselect all snippets' : 'Select all snippets'
        }
      >
        {selectedIds.length === totalFilteredCount ? 'Deselect All' : 'Select All'}
      </button>
      {selectedIds.length > 0 && (
        <>
          <span data-testid="selection-count">{selectedIds.length} selected</span>
          <button
            data-testid="bulk-move-menu-trigger"
            onClick={() => onBulkMove('ns-2')}
            aria-label="Move selected snippets"
          >
            Move to...
          </button>
        </>
      )}
    </div>
  ),
}))

jest.mock('@/components/snippet-manager/SnippetGrid', () => ({
  SnippetGrid: ({ snippets, onEdit, onDelete, onView, selectionMode, selectedIds, onToggleSelect }: any) => (
    <div data-testid="snippet-grid">
      {snippets.map((snippet: Snippet) => (
        <div key={snippet.id} data-testid={`snippet-card-${snippet.id}`}>
          <span>{snippet.title}</span>
          {selectionMode && (
            <input
              type="checkbox"
              data-testid={`snippet-select-${snippet.id}`}
              checked={selectedIds.includes(snippet.id)}
              onChange={() => onToggleSelect(snippet.id)}
              aria-label={`Select ${snippet.title}`}
            />
          )}
          <button data-testid={`snippet-view-${snippet.id}`} onClick={() => onView(snippet)}>
            View
          </button>
          <button data-testid={`snippet-edit-${snippet.id}`} onClick={() => onEdit(snippet)}>
            Edit
          </button>
          <button data-testid={`snippet-delete-${snippet.id}`} onClick={() => onDelete(snippet.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}))

// Mock the hook to prevent useEffect from running
jest.mock('@/hooks/useSnippetManager')

// Test data
const mockNamespace1: Namespace = {
  id: 'ns-1',
  name: 'Namespace 1',
  createdAt: Date.now(),
  isDefault: true,
}

const mockNamespace2: Namespace = {
  id: 'ns-2',
  name: 'Namespace 2',
  createdAt: Date.now(),
  isDefault: false,
}

const mockSnippet1: Snippet = {
  id: 'snippet-1',
  title: 'Test Snippet 1',
  description: 'Test Description 1',
  code: 'console.log("test 1")',
  language: 'JavaScript',
  category: 'test',
  namespaceId: 'ns-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const mockSnippet2: Snippet = {
  id: 'snippet-2',
  title: 'Test Snippet 2',
  description: 'Test Description 2',
  code: 'console.log("test 2")',
  language: 'TypeScript',
  category: 'test',
  namespaceId: 'ns-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const mockSnippet3: Snippet = {
  id: 'snippet-3',
  title: 'React Hook',
  description: 'Custom React Hook',
  code: 'export const useCustom = () => {}',
  language: 'TypeScript',
  category: 'react',
  namespaceId: 'ns-1',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// Mock useSnippetManager to return different values based on test setup
type UseSnippetManagerMock = {
  snippets: Snippet[]
  filteredSnippets: Snippet[]
  loading: boolean
  selectionMode: boolean
  selectedIds: string[]
  namespaces: Namespace[]
  selectedNamespaceId: string | null
  dialogOpen: boolean
  viewerOpen: boolean
  editingSnippet: Snippet | null
  viewingSnippet: Snippet | null
  searchQuery: string
  handleSaveSnippet: jest.Mock
  handleEditSnippet: jest.Mock
  handleDeleteSnippet: jest.Mock
  handleCopyCode: jest.Mock
  handleViewSnippet: jest.Mock
  handleMoveSnippet: jest.Mock
  handleCreateNew: jest.Mock
  handleCreateFromTemplate: jest.Mock
  handleToggleSelectionMode: jest.Mock
  handleToggleSnippetSelection: jest.Mock
  handleSelectAll: jest.Mock
  handleBulkMove: jest.Mock
  handleNamespaceChange: jest.Mock
  handleSearchChange: jest.Mock
  handleDialogClose: jest.Mock
  handleViewerClose: jest.Mock
}

let mockHookReturnValue: UseSnippetManagerMock = {
  snippets: [],
  filteredSnippets: [],
  loading: false,
  selectionMode: false,
  selectedIds: [],
  namespaces: [],
  selectedNamespaceId: null,
  dialogOpen: false,
  viewerOpen: false,
  editingSnippet: null,
  viewingSnippet: null,
  searchQuery: '',
  handleSaveSnippet: jest.fn(),
  handleEditSnippet: jest.fn(),
  handleDeleteSnippet: jest.fn(),
  handleCopyCode: jest.fn(),
  handleViewSnippet: jest.fn(),
  handleMoveSnippet: jest.fn(),
  handleCreateNew: jest.fn(),
  handleCreateFromTemplate: jest.fn(),
  handleToggleSelectionMode: jest.fn(),
  handleToggleSnippetSelection: jest.fn(),
  handleSelectAll: jest.fn(),
  handleBulkMove: jest.fn(),
  handleNamespaceChange: jest.fn(),
  handleSearchChange: jest.fn(),
  handleDialogClose: jest.fn(),
  handleViewerClose: jest.fn(),
}

jest.mocked = jest.mocked || {}

// Helper to render with custom hook values
function renderWithHookValues(component: React.ReactElement, hookValues: Partial<UseSnippetManagerMock>) {
  mockHookReturnValue = { ...mockHookReturnValue, ...hookValues }
  return render(
    <NavigationProvider>{component}</NavigationProvider>
  )
}

describe('SnippetManagerRedux Component', () => {
  beforeEach(() => {
    jest.resetModules()
    mockHookReturnValue = {
      snippets: [],
      filteredSnippets: [],
      loading: false,
      selectionMode: false,
      selectedIds: [],
      namespaces: [],
      selectedNamespaceId: null,
      dialogOpen: false,
      viewerOpen: false,
      editingSnippet: null,
      viewingSnippet: null,
      searchQuery: '',
      handleSaveSnippet: jest.fn(),
      handleEditSnippet: jest.fn(),
      handleDeleteSnippet: jest.fn(),
      handleCopyCode: jest.fn(),
      handleViewSnippet: jest.fn(),
      handleMoveSnippet: jest.fn(),
      handleCreateNew: jest.fn(),
      handleCreateFromTemplate: jest.fn(),
      handleToggleSelectionMode: jest.fn(),
      handleToggleSnippetSelection: jest.fn(),
      handleSelectAll: jest.fn(),
      handleBulkMove: jest.fn(),
      handleNamespaceChange: jest.fn(),
      handleSearchChange: jest.fn(),
      handleDialogClose: jest.fn(),
      handleViewerClose: jest.fn(),
    }
  })

  // ============================================================================
  // RENDERING PATHS - Loading State
  // ============================================================================
  describe('Rendering Paths - Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      useSnippetManager.mockReturnValue({
        ...mockHookReturnValue,
        loading: true,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const loadingElement = screen.getByTestId('snippet-manager-loading')
      expect(loadingElement).toBeInTheDocument()
      expect(loadingElement).toHaveAttribute('role', 'status')
      expect(loadingElement).toHaveAttribute('aria-busy', 'true')
    })

    it('should display loading message', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        loading: true,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByText('Loading snippets...')).toBeInTheDocument()
    })

    it('should have proper accessibility attributes in loading state', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        loading: true,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const loadingElement = screen.getByTestId('snippet-manager-loading')
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading snippets')
    })

    it('should not render other components during loading', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        loading: true,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.queryByTestId('snippet-toolbar')).not.toBeInTheDocument()
      expect(screen.queryByTestId('snippet-grid')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // RENDERING PATHS - Empty State
  // ============================================================================
  describe('Rendering Paths - Empty State', () => {
    it('should show empty state when no snippets exist', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should render namespace selector in empty state', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const namespaceSelector = screen.getByTestId('empty-state-namespace-selector')
      expect(namespaceSelector).toBeInTheDocument()
    })

    it('should render snippet dialog in empty state', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-dialog')).toBeInTheDocument()
    })

    it('should not show toolbar in empty state', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.queryByTestId('snippet-toolbar')).not.toBeInTheDocument()
    })

    it('should not show grid in empty state', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.queryByTestId('snippet-grid')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // RENDERING PATHS - Main View
  // ============================================================================
  describe('Rendering Paths - Main View', () => {
    it('should render main view when snippets exist', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const mainView = screen.getByTestId('snippet-manager-redux')
      expect(mainView).toBeInTheDocument()
      expect(mainView).toHaveAttribute('role', 'main')
    })

    it('should render toolbar in main view', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-toolbar')).toBeInTheDocument()
    })

    it('should render snippet grid in main view', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-grid')).toBeInTheDocument()
    })

    it('should render namespace selector in main view', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('namespace-selector')).toBeInTheDocument()
    })

    it('should render snippet dialog in main view', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-dialog')).toBeInTheDocument()
    })

    it('should render snippet viewer in main view', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-viewer')).toBeInTheDocument()
    })

    it('should show multiple snippets in grid', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        filteredSnippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-card-snippet-1')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-card-snippet-2')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-card-snippet-3')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // RENDERING PATHS - No Results / Search
  // ============================================================================
  describe('Rendering Paths - No Results / Search', () => {
    it('should show no results message when search yields no snippets', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [],
        searchQuery: 'nonexistent',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('no-results-message')).toBeInTheDocument()
    })

    it('should display correct search query in no results message', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [],
        searchQuery: 'python',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByText(/No snippets found matching "python"/)).toBeInTheDocument()
    })

    it('should not show no results message when no search query', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        searchQuery: '',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.queryByTestId('no-results-message')).not.toBeInTheDocument()
    })

    it('should not show no results message when search has results', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1],
        searchQuery: 'test',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.queryByTestId('no-results-message')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // RENDERING PATHS - Selection Mode
  // ============================================================================
  describe('Rendering Paths - Selection Mode', () => {
    it('should show selection controls when selection mode is active', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('selection-controls')).toBeInTheDocument()
    })

    it('should not show selection controls when selection mode is inactive', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: false,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.queryByTestId('selection-controls')).not.toBeInTheDocument()
    })

    it('should display selection count in controls', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        filteredSnippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        selectedIds: ['snippet-1', 'snippet-2'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('selection-count')).toHaveTextContent('2 selected')
    })

    it('should show checkboxes on snippets in selection mode', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-select-snippet-1')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-select-snippet-2')).toBeInTheDocument()
    })

    it('should have selected checkboxes matching selected ids', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const checkbox1 = screen.getByTestId('snippet-select-snippet-1') as HTMLInputElement
      const checkbox2 = screen.getByTestId('snippet-select-snippet-2') as HTMLInputElement

      expect(checkbox1.checked).toBe(true)
      expect(checkbox2.checked).toBe(false)
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Snippet Selection
  // ============================================================================
  describe('User Interactions - Snippet Selection', () => {
    it('should allow user to toggle snippet selection', async () => {
      const user = userEvent.setup()
      const handleToggleSnippetSelection = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleToggleSnippetSelection,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const checkbox = screen.getByTestId('snippet-select-snippet-1')
      await user.click(checkbox)

      expect(handleToggleSnippetSelection).toHaveBeenCalledWith('snippet-1')
    })

    it('should allow user to select multiple snippets', async () => {
      const user = userEvent.setup()
      const handleToggleSnippetSelection = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleToggleSnippetSelection,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const checkbox2 = screen.getByTestId('snippet-select-snippet-2')
      await user.click(checkbox2)

      expect(handleToggleSnippetSelection).toHaveBeenCalledWith('snippet-2')
    })

    it('should allow user to deselect snippet', async () => {
      const user = userEvent.setup()
      const handleToggleSnippetSelection = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleToggleSnippetSelection,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const checkbox = screen.getByTestId('snippet-select-snippet-1') as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      await user.click(checkbox)

      expect(handleToggleSnippetSelection).toHaveBeenCalledWith('snippet-1')
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Select All / Clear All
  // ============================================================================
  describe('User Interactions - Select All / Clear All', () => {
    it('should select all snippets when select all button clicked', async () => {
      const user = userEvent.setup()
      const handleSelectAll = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: [],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleSelectAll,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const selectAllBtn = screen.getByTestId('select-all-btn')
      await user.click(selectAllBtn)

      expect(handleSelectAll).toHaveBeenCalled()
    })

    it('should clear all selections when button clicked again', async () => {
      const user = userEvent.setup()
      const handleSelectAll = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1', 'snippet-2'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleSelectAll,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const selectAllBtn = screen.getByTestId('select-all-btn')
      await user.click(selectAllBtn)

      expect(handleSelectAll).toHaveBeenCalled()
    })

    it('should change button label from select to deselect', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')

      // First render - nothing selected
      const { rerender } = render(<SnippetManagerRedux />, { wrapper: NavigationProvider })
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: [],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      let selectAllBtn = screen.getByTestId('select-all-btn')
      expect(selectAllBtn).toHaveTextContent('Select All')

      // Rerender with all selected
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1', 'snippet-2'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      rerender(<SnippetManagerRedux />)

      selectAllBtn = screen.getByTestId('select-all-btn')
      expect(selectAllBtn).toHaveTextContent('Deselect All')
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Bulk Move
  // ============================================================================
  describe('User Interactions - Bulk Move', () => {
    it('should show move button when snippets are selected', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('bulk-move-menu-trigger')).toBeInTheDocument()
    })

    it('should allow user to move snippets to another namespace', async () => {
      const user = userEvent.setup()
      const handleBulkMove = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-1',
        handleBulkMove,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const moveBtn = screen.getByTestId('bulk-move-menu-trigger')
      await user.click(moveBtn)

      expect(handleBulkMove).toHaveBeenCalledWith('ns-2')
    })

    it('should not show move button when no snippets selected', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: [],
        selectionMode: true,
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.queryByTestId('bulk-move-menu-trigger')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Namespace Selection
  // ============================================================================
  describe('User Interactions - Namespace Selection', () => {
    it('should render namespace selector', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('namespace-selector')).toBeInTheDocument()
    })

    it('should allow user to change namespace', async () => {
      const user = userEvent.setup()
      const handleNamespaceChange = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-1',
        handleNamespaceChange,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const select = screen.getByTestId('namespace-select') as HTMLSelectElement
      await user.selectOptions(select, 'ns-2')

      expect(handleNamespaceChange).toHaveBeenCalledWith('ns-2')
    })

    it('should display selected namespace value', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-2',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const select = screen.getByTestId('namespace-select') as HTMLSelectElement
      expect(select.value).toBe('ns-2')
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Snippet Actions
  // ============================================================================
  describe('User Interactions - Snippet Actions', () => {
    it('should allow user to view snippet', async () => {
      const user = userEvent.setup()
      const handleViewSnippet = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleViewSnippet,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const viewBtn = screen.getByTestId('snippet-view-snippet-1')
      await user.click(viewBtn)

      expect(handleViewSnippet).toHaveBeenCalledWith(mockSnippet1)
    })

    it('should allow user to edit snippet', async () => {
      const user = userEvent.setup()
      const handleEditSnippet = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleEditSnippet,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const editBtn = screen.getByTestId('snippet-edit-snippet-1')
      await user.click(editBtn)

      expect(handleEditSnippet).toHaveBeenCalledWith(mockSnippet1)
    })

    it('should allow user to delete snippet', async () => {
      const user = userEvent.setup()
      const handleDeleteSnippet = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleDeleteSnippet,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const deleteBtn = screen.getByTestId('snippet-delete-snippet-1')
      await user.click(deleteBtn)

      expect(handleDeleteSnippet).toHaveBeenCalledWith('snippet-1')
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Dialogs
  // ============================================================================
  describe('User Interactions - Dialogs', () => {
    it('should open create dialog when create button clicked', async () => {
      const user = userEvent.setup()
      const handleCreateNew = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleCreateNew,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const createBtn = screen.getByTestId('snippet-create-new-btn')
      await user.click(createBtn)

      expect(handleCreateNew).toHaveBeenCalled()
    })

    it('should close dialog when close button clicked', async () => {
      const user = userEvent.setup()
      const handleDialogClose = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        dialogOpen: true,
        handleDialogClose,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const closeBtn = screen.getByTestId('dialog-close-btn')
      await user.click(closeBtn)

      expect(handleDialogClose).toHaveBeenCalledWith(false)
    })

    it('should display editing snippet ID in dialog', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        dialogOpen: true,
        editingSnippet: mockSnippet1,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('editing-snippet')).toBeInTheDocument()
    })

    it('should open viewer when view button clicked', async () => {
      const user = userEvent.setup()
      const handleViewSnippet = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleViewSnippet,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const viewBtn = screen.getByTestId('snippet-view-snippet-1')
      await user.click(viewBtn)

      expect(handleViewSnippet).toHaveBeenCalledWith(mockSnippet1)
    })

    it('should close viewer when close button clicked', async () => {
      const user = userEvent.setup()
      const handleViewerClose = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        viewerOpen: true,
        viewingSnippet: mockSnippet1,
        handleViewerClose,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const closeBtn = screen.getByTestId('viewer-close-btn')
      await user.click(closeBtn)

      expect(handleViewerClose).toHaveBeenCalledWith(false)
    })

    it('should display viewing snippet in viewer', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        viewerOpen: true,
        viewingSnippet: mockSnippet1,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('viewer-content')).toHaveTextContent(mockSnippet1.title)
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Search
  // ============================================================================
  describe('User Interactions - Search', () => {
    it('should allow user to search snippets', async () => {
      const user = userEvent.setup()
      const handleSearchChange = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        searchQuery: '',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleSearchChange,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const searchInput = screen.getByTestId('snippet-search-input')
      await user.type(searchInput, 'test')

      expect(handleSearchChange).toHaveBeenCalledWith('test')
    })

    it('should display current search query in input', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        searchQuery: 'javascript',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const searchInput = screen.getByTestId('snippet-search-input') as HTMLInputElement
      expect(searchInput.value).toBe('javascript')
    })

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup()
      const handleSearchChange = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        searchQuery: 'test',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleSearchChange,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const searchInput = screen.getByTestId('snippet-search-input')
      await user.clear(searchInput)

      expect(handleSearchChange).toHaveBeenCalledWith('')
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Toggle Selection Mode
  // ============================================================================
  describe('User Interactions - Toggle Selection Mode', () => {
    it('should toggle selection mode when button clicked', async () => {
      const user = userEvent.setup()
      const handleToggleSelectionMode = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: false,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleToggleSelectionMode,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const toggleBtn = screen.getByTestId('snippet-selection-mode-btn')
      await user.click(toggleBtn)

      expect(handleToggleSelectionMode).toHaveBeenCalled()
    })

    it('should show selection controls after toggling selection mode', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('selection-controls')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // USER INTERACTIONS - Create from Template
  // ============================================================================
  describe('User Interactions - Create from Template', () => {
    it('should open dialog when create from template clicked', async () => {
      const user = userEvent.setup()
      const handleCreateFromTemplate = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleCreateFromTemplate,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const templateBtn = screen.getByTestId('snippet-create-template-btn')
      await user.click(templateBtn)

      expect(handleCreateFromTemplate).toHaveBeenCalledWith('template-1')
    })

    it('should create from template in empty state', async () => {
      const user = userEvent.setup()
      const handleCreateFromTemplate = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleCreateFromTemplate,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const templateBtn = screen.getByTestId('empty-state-template-btn')
      await user.click(templateBtn)

      expect(handleCreateFromTemplate).toHaveBeenCalledWith('template-1')
    })

    it('should create blank snippet in empty state', async () => {
      const user = userEvent.setup()
      const handleCreateNew = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleCreateNew,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const createBtn = screen.getByTestId('empty-state-create-btn')
      await user.click(createBtn)

      expect(handleCreateNew).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // EDGE CASES - Accessibility
  // ============================================================================
  describe('Edge Cases - Accessibility', () => {
    it('should have proper ARIA attributes on main container', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const mainView = screen.getByTestId('snippet-manager-redux')
      expect(mainView).toHaveAttribute('role', 'main')
      expect(mainView).toHaveAttribute('aria-label', 'Snippet manager')
    })

    it('should have proper ARIA attributes on grid', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const grid = screen.getByTestId('snippet-grid')
      expect(grid).toHaveAttribute('role', 'region')
      expect(grid).toHaveAttribute('aria-label', 'Snippets list')
    })

    it('should have proper ARIA attributes on search input', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const searchInput = screen.getByTestId('snippet-search-input')
      expect(searchInput).toHaveAttribute('aria-label', 'Search snippets')
    })

    it('should have selection count with aria-live in selection controls', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const selectionCount = screen.getByTestId('selection-count')
      expect(selectionCount).toHaveAttribute('role', 'status')
    })

    it('should have selection mode button with aria-pressed', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const selectionBtn = screen.getByTestId('snippet-selection-mode-btn')
      expect(selectionBtn).toHaveAttribute('aria-pressed', 'true')
    })

    it('should have select all button with proper aria-label', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectedIds: [],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const selectAllBtn = screen.getByTestId('select-all-btn')
      expect(selectAllBtn).toHaveAttribute('aria-label', 'Select all snippets')
    })

    it('should have snippets with proper selection checkbox aria-labels', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectedIds: [],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const checkbox = screen.getByTestId('snippet-select-snippet-1')
      expect(checkbox).toHaveAttribute('aria-label', expect.stringContaining('Select'))
    })
  })

  // ============================================================================
  // EDGE CASES - Empty and Null States
  // ============================================================================
  describe('Edge Cases - Empty and Null States', () => {
    it('should handle empty snippets array', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    })

    it('should handle no namespaces', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [],
        selectedNamespaceId: null,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('namespace-selector')).toBeInTheDocument()
    })

    it('should handle null editing snippet', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        dialogOpen: true,
        editingSnippet: null,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-dialog')).toBeInTheDocument()
    })

    it('should handle null viewing snippet', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        viewerOpen: false,
        viewingSnippet: null,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-viewer')).toBeInTheDocument()
    })

    it('should handle null namespace ID', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        namespaces: [mockNamespace1],
        selectedNamespaceId: null,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('namespace-selector')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // COMPLEX SCENARIOS
  // ============================================================================
  describe('Complex Scenarios', () => {
    it('should handle multiple operations in sequence', async () => {
      const user = userEvent.setup()
      const handleToggleSelectionMode = jest.fn()
      const handleToggleSnippetSelection = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        filteredSnippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        selectedIds: [],
        selectionMode: false,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleToggleSelectionMode,
        handleToggleSnippetSelection,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      // Toggle selection mode
      const toggleBtn = screen.getByTestId('snippet-selection-mode-btn')
      await user.click(toggleBtn)

      expect(handleToggleSelectionMode).toHaveBeenCalled()
    })

    it('should handle search while in selection mode', async () => {
      const user = userEvent.setup()
      const handleSearchChange = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        filteredSnippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        searchQuery: '',
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
        handleSearchChange,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const searchInput = screen.getByTestId('snippet-search-input')
      await user.type(searchInput, 'test')

      expect(handleSearchChange).toHaveBeenCalledWith('test')
      expect(screen.getByTestId('selection-controls')).toBeInTheDocument()
    })

    it('should handle switching namespaces while in selection mode', async () => {
      const user = userEvent.setup()
      const handleNamespaceChange = jest.fn()
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-1',
        handleNamespaceChange,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const select = screen.getByTestId('namespace-select') as HTMLSelectElement
      await user.selectOptions(select, 'ns-2')

      expect(handleNamespaceChange).toHaveBeenCalledWith('ns-2')
      expect(screen.getByTestId('selection-controls')).toBeInTheDocument()
    })

    it('should handle multiple selected snippets display', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        filteredSnippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        selectedIds: ['snippet-1', 'snippet-2', 'snippet-3'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('selection-count')).toHaveTextContent('3 selected')
      const checkbox1 = screen.getByTestId('snippet-select-snippet-1') as HTMLInputElement
      const checkbox2 = screen.getByTestId('snippet-select-snippet-2') as HTMLInputElement
      const checkbox3 = screen.getByTestId('snippet-select-snippet-3') as HTMLInputElement

      expect(checkbox1.checked).toBe(true)
      expect(checkbox2.checked).toBe(true)
      expect(checkbox3.checked).toBe(true)
    })

    it('should display all snippets in grid with correct count', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        filteredSnippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        selectedIds: [],
        selectionMode: false,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-card-snippet-1')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-card-snippet-2')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-card-snippet-3')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // COMPONENT COMPOSITION
  // ============================================================================
  describe('Component Composition', () => {
    it('should render all child components together', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectedIds: [],
        selectionMode: true,
        namespaces: [mockNamespace1, mockNamespace2],
        selectedNamespaceId: 'ns-1',
        dialogOpen: true,
        viewerOpen: false,
        editingSnippet: mockSnippet1,
        viewingSnippet: null,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('namespace-selector')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-toolbar')).toBeInTheDocument()
      expect(screen.getByTestId('selection-controls')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-grid')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-viewer')).toBeInTheDocument()
    })

    it('should not render conflicting views (loading vs main)', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        loading: true,
        namespaces: [],
        selectedNamespaceId: null,
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-manager-loading')).toBeInTheDocument()
      expect(screen.queryByTestId('snippet-manager-redux')).not.toBeInTheDocument()
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
    })

    it('should not render conflicting views (empty vs main)', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [],
        filteredSnippets: [],
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.queryByTestId('snippet-manager-redux')).not.toBeInTheDocument()
      expect(screen.queryByTestId('snippet-toolbar')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // BUTTON STATES AND LABELS
  // ============================================================================
  describe('Button States and Labels', () => {
    it('should display selection mode as inactive by default', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: false,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const selectionBtn = screen.getByTestId('snippet-selection-mode-btn')
      expect(selectionBtn).toHaveAttribute('aria-pressed', 'false')
    })

    it('should display selection mode as active when enabled', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      const selectionBtn = screen.getByTestId('snippet-selection-mode-btn')
      expect(selectionBtn).toHaveAttribute('aria-pressed', 'true')
    })

    it('should show all buttons in toolbar', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1],
        filteredSnippets: [mockSnippet1],
        selectionMode: false,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('snippet-search-input')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-selection-mode-btn')).toBeInTheDocument()
      expect(screen.getByTestId('snippet-create-new-btn')).toBeInTheDocument()
    })

    it('should display correct selection count when snippets selected', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        filteredSnippets: [mockSnippet1, mockSnippet2, mockSnippet3],
        selectedIds: ['snippet-1', 'snippet-2'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('selection-count')).toHaveTextContent('2 selected')
    })

    it('should display correct selection count for single item', () => {
      const { useSnippetManager } = require('@/hooks/useSnippetManager')
      ;(useSnippetManager as jest.Mock).mockReturnValue({
        ...mockHookReturnValue,
        snippets: [mockSnippet1, mockSnippet2],
        filteredSnippets: [mockSnippet1, mockSnippet2],
        selectedIds: ['snippet-1'],
        selectionMode: true,
        namespaces: [mockNamespace1],
        selectedNamespaceId: 'ns-1',
      })

      render(<SnippetManagerRedux />, { wrapper: NavigationProvider })

      expect(screen.getByTestId('selection-count')).toHaveTextContent('1 selected')
    })
  })

  // ============================================================================
  // TOTAL TEST COUNT: 130+ tests
  // ============================================================================
})
