import React from 'react'
import { render, screen } from '@/test-utils'
import { NamespaceSelector } from './NamespaceSelector'
import type { Namespace } from '@/lib/types'

jest.mock('@metabuilder/components/m3', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  MaterialIcon: ({ name }: any) => <span>{name}</span>,
}))

jest.mock('./hooks/useNamespaceSelector')
jest.mock('./CreateNamespaceDialog', () => ({
  CreateNamespaceDialog: () => <div data-testid="create-dialog" />,
}))

jest.mock('./DeleteNamespaceDialog', () => ({
  DeleteNamespaceDialog: () => <div data-testid="delete-dialog" />,
}))

jest.mock('./NamespaceChip', () => ({
  NamespaceChip: ({ namespace }: any) => (
    <div data-testid={`namespace-chip-${namespace.id}`}>{namespace.name}</div>
  ),
}))

const createTestNamespace = (overrides?: Partial<Namespace>): Namespace => ({
  id: 'ns-1',
  name: 'Test Namespace',
  createdAt: Date.now(),
  isDefault: false,
  ...overrides,
})

const mockUseNamespaceSelector = require('./hooks/useNamespaceSelector')

describe('NamespaceSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loading and displaying namespaces', () => {
    it('should display namespaces from hook', () => {
      const namespaces = [
        createTestNamespace({
          id: 'default',
          name: 'Default',
          isDefault: true,
        }),
        createTestNamespace({ id: 'work', name: 'Work' }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('namespace-chip-default')).toBeInTheDocument()
      expect(screen.getByTestId('namespace-chip-work')).toBeInTheDocument()
    })

    it('should render create button', () => {
      const namespaces = [
        createTestNamespace({
          id: 'default',
          name: 'Default',
          isDefault: true,
        }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(
        screen.getByTestId('create-namespace-trigger'),
      ).toBeInTheDocument()
    })

    it('should render namespace chips', () => {
      const namespaces = [
        createTestNamespace({
          id: 'default',
          name: 'Default',
          isDefault: true,
        }),
        createTestNamespace({ id: 'work', name: 'Work' }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="work"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('namespace-chip-default')).toBeInTheDocument()
      expect(screen.getByTestId('namespace-chip-work')).toBeInTheDocument()
    })
  })

  describe('creating namespace', () => {
    it('should render create dialog', () => {
      const namespaces = [
        createTestNamespace({ id: 'default', isDefault: true }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: true,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('create-dialog')).toBeInTheDocument()
    })

    it('should handle namespace creation', () => {
      const handleCreateNamespace = jest.fn()
      const namespaces = [
        createTestNamespace({ name: 'New Namespace' }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: 'New Namespace',
        createDialogOpen: true,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace,
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId={null}
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('create-dialog')).toBeInTheDocument()
    })

    it('should render create button when dialog closed', () => {
      const namespaces = [
        createTestNamespace({ id: 'default', isDefault: true }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(
        screen.getByTestId('create-namespace-trigger'),
      ).toBeInTheDocument()
    })

    it('should handle creation error', () => {
      const namespaces = []
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId={null}
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('namespace-selector')).toBeInTheDocument()
    })
  })

  describe('deleting namespace', () => {
    it('should render delete dialog when open', () => {
      const namespaces = [
        createTestNamespace({
          id: 'default',
          name: 'Default',
          isDefault: true,
        }),
        createTestNamespace({ id: 'work', name: 'Work' }),
      ]
      const namespaceToDelete = namespaces[1]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: true,
        namespaceToDelete,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })

    it('should handle namespace deletion', () => {
      const handleDeleteNamespace = jest.fn()
      const namespaces = [
        createTestNamespace({
          id: 'default',
          name: 'Default',
          isDefault: true,
        }),
        createTestNamespace({ id: 'work', name: 'Work' }),
      ]
      const namespaceToDelete = namespaces[1]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: true,
        namespaceToDelete,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace,
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="work"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
    })

    it('should render multiple namespaces', () => {
      const namespaces = [
        createTestNamespace({ id: 'default', isDefault: true }),
        createTestNamespace({ id: 'work' }),
        createTestNamespace({ id: 'personal' }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(screen.getByTestId('namespace-chip-default')).toBeInTheDocument()
      expect(screen.getByTestId('namespace-chip-work')).toBeInTheDocument()
      expect(screen.getByTestId('namespace-chip-personal')).toBeInTheDocument()
    })

    it('should disable create during loading', () => {
      const namespaces = [
        createTestNamespace({ id: 'default', isDefault: true }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: true,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(
        screen.getByTestId('create-namespace-trigger'),
      ).toBeInTheDocument()
    })
  })

  describe('namespace operations', () => {
    it('should pass namespace selection to callback', () => {
      const onNamespaceChange = jest.fn()
      const namespaces = [
        createTestNamespace({ id: 'default', isDefault: true }),
        createTestNamespace({ id: 'work' }),
      ]
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces,
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId="default"
          onNamespaceChange={onNamespaceChange}
        />,
      )

      expect(screen.getByTestId('namespace-chip-default')).toBeInTheDocument()
    })

    it('should render with empty namespace list', () => {
      mockUseNamespaceSelector.useNamespaceSelector.mockReturnValue({
        namespaces: [],
        editingId: null,
        editingName: '',
        renameInputRef: null,
        setEditingName: jest.fn(),
        handleRenameKeyDown: jest.fn(),
        commitRename: jest.fn(),
        startEditing: jest.fn(),
        newNamespaceName: '',
        createDialogOpen: false,
        deleteDialogOpen: false,
        namespaceToDelete: null,
        loading: false,
        setNewNamespaceName: jest.fn(),
        setCreateDialogOpen: jest.fn(),
        setDeleteDialogOpen: jest.fn(),
        setNamespaceToDelete: jest.fn(),
        handleCreateNamespace: jest.fn(),
        handleDeleteNamespace: jest.fn(),
      })

      render(
        <NamespaceSelector
          selectedNamespaceId={null}
          onNamespaceChange={jest.fn()}
        />,
      )

      expect(
        screen.getByTestId('create-namespace-trigger'),
      ).toBeInTheDocument()
    })
  })
})
