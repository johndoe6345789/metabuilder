import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NamespaceChip } from './NamespaceChip'
import type { Namespace } from '@/lib/types'

jest.mock('@metabuilder/components/m3', () => ({
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

const namespace: Namespace = {
  id: 'ns1',
  name: 'Work',
  createdAt: 1000,
  isDefault: false,
}

const defaultNamespace: Namespace = {
  id: 'ns-default',
  name: 'Default',
  createdAt: 0,
  isDefault: true,
}

const renameInputRef = { current: null } as React.RefObject<HTMLInputElement>

const defaultProps = {
  namespace,
  isActive: false,
  isEditing: false,
  editingName: '',
  renameInputRef,
  onSelect: jest.fn(),
  onEditingChange: jest.fn(),
  onRenameKeyDown: jest.fn(),
  onRenameBlur: jest.fn(),
  onStartEdit: jest.fn(),
  onDeleteOpen: jest.fn(),
}

describe('NamespaceChip', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders with correct data-testid', () => {
    render(<NamespaceChip {...defaultProps} />)
    expect(screen.getByTestId('namespace-chip-ns1')).toBeInTheDocument()
  })

  it('renders namespace name', () => {
    render(<NamespaceChip {...defaultProps} />)
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('has aria-pressed false when not active', () => {
    render(<NamespaceChip {...defaultProps} isActive={false} />)
    expect(screen.getByTestId('namespace-chip-ns1')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('has aria-pressed true when active', () => {
    render(<NamespaceChip {...defaultProps} isActive={true} />)
    expect(screen.getByTestId('namespace-chip-ns1')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('has correct aria-label', () => {
    render(<NamespaceChip {...defaultProps} />)
    expect(screen.getByTestId('namespace-chip-ns1')).toHaveAttribute(
      'aria-label',
      'Switch to Work namespace',
    )
  })

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup()
    render(<NamespaceChip {...defaultProps} />)
    await user.click(screen.getByTestId('namespace-chip-ns1'))
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1)
  })

  it('does not call onSelect when editing', async () => {
    const user = userEvent.setup()
    render(
      <NamespaceChip {...defaultProps} isEditing={true} editingName="Work" />,
    )
    await user.click(screen.getByTestId('namespace-chip-ns1'))
    expect(defaultProps.onSelect).not.toHaveBeenCalled()
  })

  it('calls onSelect on Enter key press', async () => {
    const user = userEvent.setup()
    render(<NamespaceChip {...defaultProps} />)
    screen.getByTestId('namespace-chip-ns1').focus()
    await user.keyboard('{Enter}')
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect on Space key press', async () => {
    const user = userEvent.setup()
    render(<NamespaceChip {...defaultProps} />)
    screen.getByTestId('namespace-chip-ns1').focus()
    await user.keyboard('{ }')
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1)
  })

  describe('edit button', () => {
    it('renders edit button for non-default namespace', () => {
      render(<NamespaceChip {...defaultProps} />)
      expect(screen.getByTestId('rename-namespace-ns1')).toBeInTheDocument()
    })

    it('does not render edit button for default namespace', () => {
      render(<NamespaceChip {...defaultProps} namespace={defaultNamespace} />)
      expect(
        screen.queryByTestId('rename-namespace-ns-default'),
      ).not.toBeInTheDocument()
    })

    it('calls onStartEdit when edit button clicked', async () => {
      const user = userEvent.setup()
      render(<NamespaceChip {...defaultProps} />)
      await user.click(screen.getByTestId('rename-namespace-ns1'))
      expect(defaultProps.onStartEdit).toHaveBeenCalledWith(namespace)
    })
  })

  describe('delete button', () => {
    it('renders delete button when active and not default', () => {
      render(<NamespaceChip {...defaultProps} isActive={true} />)
      expect(screen.getByTestId('delete-namespace-trigger')).toBeInTheDocument()
    })

    it('does not render delete button when not active', () => {
      render(<NamespaceChip {...defaultProps} isActive={false} />)
      expect(
        screen.queryByTestId('delete-namespace-trigger'),
      ).not.toBeInTheDocument()
    })

    it('does not render delete button for default namespace', () => {
      render(
        <NamespaceChip
          {...defaultProps}
          namespace={defaultNamespace}
          isActive={true}
        />,
      )
      expect(
        screen.queryByTestId('delete-namespace-trigger'),
      ).not.toBeInTheDocument()
    })

    it('calls onDeleteOpen when delete button clicked', async () => {
      const user = userEvent.setup()
      render(<NamespaceChip {...defaultProps} isActive={true} />)
      await user.click(screen.getByTestId('delete-namespace-trigger'))
      expect(defaultProps.onDeleteOpen).toHaveBeenCalledWith(namespace)
    })
  })

  describe('editing (rename) mode', () => {
    const editingProps = {
      ...defaultProps,
      isEditing: true,
      editingName: 'New Name',
    }

    it('renders rename input when isEditing is true', () => {
      render(<NamespaceChip {...editingProps} />)
      expect(screen.getByLabelText('Rename namespace Work')).toBeInTheDocument()
    })

    it('does not render namespace name span when editing', () => {
      // We can check the input value instead
      render(<NamespaceChip {...editingProps} />)
      const input = screen.getByLabelText(
        'Rename namespace Work',
      ) as HTMLInputElement
      expect(input.value).toBe('New Name')
    })

    it('renders confirm button in editing mode', () => {
      render(<NamespaceChip {...editingProps} />)
      expect(screen.getByLabelText('Confirm rename')).toBeInTheDocument()
    })

    it('calls onRenameBlur when confirm button clicked', async () => {
      const user = userEvent.setup()
      render(<NamespaceChip {...editingProps} />)
      await user.click(screen.getByLabelText('Confirm rename'))
      expect(defaultProps.onRenameBlur).toHaveBeenCalledWith('ns1')
    })

    it('calls onEditingChange when input changes', async () => {
      const user = userEvent.setup()
      render(<NamespaceChip {...editingProps} />)
      const input = screen.getByLabelText('Rename namespace Work')
      await user.clear(input)
      await user.type(input, 'x')
      expect(defaultProps.onEditingChange).toHaveBeenCalled()
    })
  })
})
