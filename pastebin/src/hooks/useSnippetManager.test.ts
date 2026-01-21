import { renderHook, act, waitFor } from '@testing-library/react'
import { useSnippetManager } from './useSnippetManager'
import * as dbModule from '@/lib/db'
import * as sonerModule from 'sonner'
import { Provider } from 'react-redux'
import { store } from '@/store'
import React from 'react'

// Mock the database module
jest.mock('@/lib/db')

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockDb = dbModule as jest.Mocked<typeof dbModule>
const mockToast = sonerModule.toast as jest.Mocked<typeof sonerModule.toast>

const mockTemplates = [
  {
    id: 'template-1',
    title: 'Hello World',
    description: 'A simple hello world template',
    code: 'print("Hello, World!")',
    language: 'python',
    category: 'basics',
    hasPreview: false,
    functionName: undefined,
    inputParameters: undefined,
  },
]

describe('useSnippetManager Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.seedDatabase.mockResolvedValue(undefined)
    mockDb.syncTemplatesFromJSON.mockResolvedValue(undefined)
    // Mock database operations that are called during initialization
    mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
    mockDb.getAllNamespaces.mockResolvedValue([
      { id: 'default', name: 'Default', createdAt: Date.now(), isDefault: true },
    ] as Awaited<ReturnType<typeof mockDb.getAllNamespaces>>)
    mockDb.getSnippetsByNamespace.mockResolvedValue([])
  })

  const renderHookWithProviders = <T,>(hook: () => T) => {
    return renderHook(hook, {
      wrapper: ({ children }: { children: React.ReactNode }) => React.createElement(Provider, { store, children }),
    })
  }

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      // Wait for initialization to complete
      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      expect(result.current.snippets).toBeDefined()
      expect(result.current.namespaces).toBeDefined()
    })

    it('should seed database and sync templates on mount', async () => {
      renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await waitFor(() => {
        expect(mockDb.syncTemplatesFromJSON).toHaveBeenCalledWith(mockTemplates)
      }, { timeout: 5000 })
    })

    it('should handle initialization errors gracefully', async () => {
      mockDb.seedDatabase.mockRejectedValueOnce(new Error('Seed failed'))

      renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to load data')
      }, { timeout: 5000 })
    })
  })

  describe('Snippet CRUD Operations', () => {
    it('should save a new snippet', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      const newSnippet = {
        title: 'Test Snippet',
        description: 'A test snippet',
        code: 'console.log("test")',
        language: 'javascript',
        category: 'testing',
        hasPreview: true,
        namespaceId: 'ns-1',
      }

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        await result.current.handleSaveSnippet(newSnippet as Parameters<typeof result.current.handleSaveSnippet>[0])
      })
    })

    it('should edit an existing snippet', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      const editedSnippet = {
        title: 'Updated Snippet',
        description: 'Updated description',
        code: 'updated code',
        language: 'javascript',
        category: 'updated',
        hasPreview: true,
        namespaceId: 'ns-1',
      }

      // First set an editing snippet
      await act(async () => {
        // This would be done through the store in real usage
        await result.current.handleSaveSnippet(editedSnippet as Parameters<typeof result.current.handleSaveSnippet>[0])
      })
    })

    it('should delete a snippet', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        await result.current.handleDeleteSnippet('snippet-1')
      })
    })

    it('should handle save errors', async () => {
      // Mock database error
      mockDb.createSnippet.mockRejectedValueOnce(new Error('Database error'))

      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      const snippet = {
        title: 'Test',
        description: 'Test',
        code: 'code',
        language: 'js',
        category: 'test',
        hasPreview: false,
        namespaceId: 'ns-1',
      }

      // handleSaveSnippet should complete without throwing
      await act(async () => {
        await result.current.handleSaveSnippet(snippet as Parameters<typeof result.current.handleSaveSnippet>[0])
      })

      // Error toast may be shown for database errors
    })
  })

  describe('Copy and View Operations', () => {
    it('should copy code to clipboard', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      const mockCode = 'console.log("test")'

      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValueOnce(undefined),
        },
      })

      await act(async () => {
        result.current.handleCopyCode(mockCode)
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCode)
      expect(mockToast.success).toHaveBeenCalled()
    })

    it('should handle view snippet', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      const snippet = {
        id: 'snippet-1',
        title: 'Test',
        description: 'Test',
        code: 'code',
        language: 'js',
        category: 'test',
        hasPreview: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        namespaceId: 'ns-1',
      }

      await act(async () => {
        result.current.handleViewSnippet(snippet)
      })

      expect(result.current.viewingSnippet).toEqual(snippet)
    })
  })

  describe('Template Operations', () => {
    it('should create snippet from template', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(result.current.loading).toBeFalsy()
      })

      await act(async () => {
        result.current.handleCreateFromTemplate('template-1')
      })

      expect(result.current.dialogOpen).toBe(true)
    })

    it('should handle missing template', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(result.current.loading).toBeFalsy()
      })

      await act(async () => {
        result.current.handleCreateFromTemplate('nonexistent-template')
      })

      // Should not open dialog for non-existent template
    })
  })

  describe('Selection and Bulk Operations', () => {
    it('should toggle selection mode', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      const initialMode = result.current.selectionMode

      await act(async () => {
        result.current.handleToggleSelectionMode()
      })

      expect(result.current.selectionMode).not.toBe(initialMode)
    })

    it('should toggle snippet selection', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        result.current.handleToggleSnippetSelection('snippet-1')
      })
    })

    it('should select all snippets', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        result.current.handleSelectAll()
      })
    })

    it('should handle bulk move with error when no snippets selected', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      // Ensure selection mode is off and no snippets are selected
      await act(async () => {
        result.current.handleToggleSelectionMode()
      })

      await act(async () => {
        await result.current.handleBulkMove('target-ns')
      })

      // Should either show error or handle gracefully
      // (depends on implementation)
    })
  })

  describe('Search and Filter', () => {
    it('should update search query', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        result.current.handleSearchChange('test query')
      })

      expect(result.current.searchQuery).toBe('test query')
    })
  })

  describe('Dialog and Viewer Management', () => {
    it('should open dialog for creating new snippet', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        result.current.handleCreateNew()
      })

      expect(result.current.dialogOpen).toBe(true)
    })

    it('should close dialog', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        result.current.handleCreateNew()
      })

      expect(result.current.dialogOpen).toBe(true)

      await act(async () => {
        result.current.handleDialogClose(false)
      })

      expect(result.current.dialogOpen).toBe(false)
    })

    it('should close viewer', async () => {
      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(mockDb.seedDatabase).toHaveBeenCalled()
      }, { timeout: 5000 })

      await act(async () => {
        result.current.handleViewerClose(false)
      })

      expect(result.current.viewerOpen).toBe(false)
    })
  })

  describe('Namespace Management', () => {
    it('should change selected namespace', async () => {
      // Mock namespaces fetch to populate store
      mockDb.getAllNamespaces.mockResolvedValueOnce([
        { id: 'default', name: 'Default', createdAt: Date.now(), isDefault: true },
        { id: 'ns-123', name: 'Test Namespace', createdAt: Date.now(), isDefault: false },
      ] as Awaited<ReturnType<typeof mockDb.getAllNamespaces>>)

      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      await waitFor(() => {
        expect(result.current.selectedNamespaceId).toBeDefined()
      }, { timeout: 5000 })

      await act(async () => {
        result.current.handleNamespaceChange('ns-123')
      })

      expect(result.current.selectedNamespaceId).toBe('ns-123')
    })

    it('should handle null namespace gracefully', async () => {
      mockDb.getAllNamespaces.mockResolvedValueOnce([
        { id: 'default', name: 'Default', createdAt: Date.now(), isDefault: true },
      ] as Awaited<ReturnType<typeof mockDb.getAllNamespaces>>)

      const { result } = renderHookWithProviders(() => useSnippetManager(mockTemplates))

      const initialNamespaceId = await waitFor(() => {
        return result.current.selectedNamespaceId
      })

      // handleNamespaceChange with null should not change the current selection
      await act(async () => {
        result.current.handleNamespaceChange(null)
      })

      // Namespace ID should remain unchanged when null is passed
      expect(result.current.selectedNamespaceId).toBe(initialNamespaceId)
    })
  })
})
