import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileTreeItem } from './FileTreeItem'
import type { SnippetFile } from '@/lib/types'

jest.mock('@metabuilder/components/m3', () => ({
  Input: ({
    value,
    onChange,
    onKeyDown,
    autoFocus,
    'aria-label': ariaLabel,
    'data-testid': testId,
  }: any) => (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      data-testid={testId}
    />
  ),
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

const file: SnippetFile = { name: 'index.ts', content: 'export {}' }

const defaultProps = {
  file,
  isActive: false,
  isRenaming: false,
  renameValue: '',
  renameLabel: 'Rename file',
  deleteLabel: 'Delete',
  fileCount: 2,
  onSelect: jest.fn(),
  onStartRename: jest.fn(),
  onDelete: jest.fn(),
  onRenameChange: jest.fn(),
  onRenameKeyDown: jest.fn(),
  onRenameConfirm: jest.fn(),
  onRenameCancel: jest.fn(),
}

describe('FileTreeItem', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('normal (non-renaming) mode', () => {
    it('renders with correct data-testid', () => {
      render(<FileTreeItem {...defaultProps} />)
      expect(screen.getByTestId('file-tree-item-index.ts')).toBeInTheDocument()
    })

    it('renders file button with file name', () => {
      render(<FileTreeItem {...defaultProps} />)
      expect(screen.getByText('index.ts')).toBeInTheDocument()
    })

    it('renders file button with correct data-testid', () => {
      render(<FileTreeItem {...defaultProps} />)
      expect(screen.getByTestId('file-tree-btn-index.ts')).toBeInTheDocument()
    })

    it('calls onSelect when file button clicked', async () => {
      const user = userEvent.setup()
      render(<FileTreeItem {...defaultProps} />)
      await user.click(screen.getByTestId('file-tree-btn-index.ts'))
      expect(defaultProps.onSelect).toHaveBeenCalledTimes(1)
    })

    it('calls onStartRename on double-click', async () => {
      const user = userEvent.setup()
      render(<FileTreeItem {...defaultProps} />)
      await user.dblClick(screen.getByTestId('file-tree-btn-index.ts'))
      expect(defaultProps.onStartRename).toHaveBeenCalled()
    })

    it('renders delete button', () => {
      render(<FileTreeItem {...defaultProps} />)
      expect(
        screen.getByTestId('file-tree-delete-index.ts'),
      ).toBeInTheDocument()
    })

    it('disables delete button when fileCount is 1', () => {
      render(<FileTreeItem {...defaultProps} fileCount={1} />)
      expect(screen.getByTestId('file-tree-delete-index.ts')).toBeDisabled()
    })

    it('enables delete button when fileCount > 1', () => {
      render(<FileTreeItem {...defaultProps} fileCount={2} />)
      expect(screen.getByTestId('file-tree-delete-index.ts')).not.toBeDisabled()
    })

    it('calls onDelete when delete button clicked', async () => {
      const user = userEvent.setup()
      render(<FileTreeItem {...defaultProps} fileCount={2} />)
      await user.click(screen.getByTestId('file-tree-delete-index.ts'))
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
    })

    it('marks item as active when isActive is true', () => {
      render(<FileTreeItem {...defaultProps} isActive={true} />)
      const li = screen.getByTestId('file-tree-item-index.ts')
      expect(li).toHaveAttribute('aria-selected', 'true')
    })

    it('marks item as inactive when isActive is false', () => {
      render(<FileTreeItem {...defaultProps} isActive={false} />)
      const li = screen.getByTestId('file-tree-item-index.ts')
      expect(li).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('rename mode', () => {
    const renamingProps = {
      ...defaultProps,
      isRenaming: true,
      renameValue: 'newname.ts',
    }

    it('renders rename input when isRenaming is true', () => {
      render(<FileTreeItem {...renamingProps} />)
      expect(screen.getByTestId('file-tree-rename-input')).toBeInTheDocument()
    })

    it('does not render file button in rename mode', () => {
      render(<FileTreeItem {...renamingProps} />)
      expect(
        screen.queryByTestId('file-tree-btn-index.ts'),
      ).not.toBeInTheDocument()
    })

    it('renders confirm and cancel buttons in rename mode', () => {
      render(<FileTreeItem {...renamingProps} />)
      expect(screen.getByLabelText('Confirm rename')).toBeInTheDocument()
      expect(screen.getByLabelText('Cancel rename')).toBeInTheDocument()
    })

    it('does not render delete button in rename mode', () => {
      render(<FileTreeItem {...renamingProps} />)
      expect(
        screen.queryByTestId('file-tree-delete-index.ts'),
      ).not.toBeInTheDocument()
    })

    it('rename input shows renameValue', () => {
      render(<FileTreeItem {...renamingProps} />)
      const input = screen.getByTestId(
        'file-tree-rename-input',
      ) as HTMLInputElement
      expect(input.value).toBe('newname.ts')
    })

    it('calls onRenameConfirm when confirm clicked', async () => {
      const user = userEvent.setup()
      render(<FileTreeItem {...renamingProps} />)
      await user.click(screen.getByLabelText('Confirm rename'))
      expect(defaultProps.onRenameConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onRenameCancel when cancel clicked', async () => {
      const user = userEvent.setup()
      render(<FileTreeItem {...renamingProps} />)
      await user.click(screen.getByLabelText('Cancel rename'))
      expect(defaultProps.onRenameCancel).toHaveBeenCalledTimes(1)
    })
  })
})
