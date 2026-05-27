import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileTreeAddRow } from './FileTreeAddRow'

jest.mock('@metabuilder/components/fakemui', () => ({
  Input: ({ value, onChange, onKeyDown, placeholder, autoFocus, 'aria-label': ariaLabel, 'data-testid': testId, ...rest }: any) => (
    <input
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      data-testid={testId}
    />
  ),
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

describe('FileTreeAddRow', () => {
  const defaultProps = {
    newFileName: '',
    placeholder: 'New file name',
    label: 'New file name input',
    onChange: jest.fn(),
    onKeyDown: jest.fn(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders with data-testid "file-tree-adding-row"', () => {
    render(<FileTreeAddRow {...defaultProps} />)
    expect(screen.getByTestId('file-tree-adding-row')).toBeInTheDocument()
  })

  it('renders input with correct placeholder', () => {
    render(<FileTreeAddRow {...defaultProps} />)
    expect(screen.getByPlaceholderText('New file name')).toBeInTheDocument()
  })

  it('renders input with correct aria-label', () => {
    render(<FileTreeAddRow {...defaultProps} />)
    expect(screen.getByLabelText('New file name input')).toBeInTheDocument()
  })

  it('renders confirm and cancel buttons', () => {
    render(<FileTreeAddRow {...defaultProps} />)
    expect(screen.getByLabelText('Confirm add')).toBeInTheDocument()
    expect(screen.getByLabelText('Cancel add')).toBeInTheDocument()
  })

  it('calls onChange when input changes', async () => {
    const user = userEvent.setup()
    render(<FileTreeAddRow {...defaultProps} />)
    await user.type(screen.getByTestId('file-tree-new-name-input'), 'a')
    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup()
    render(<FileTreeAddRow {...defaultProps} />)
    await user.click(screen.getByLabelText('Confirm add'))
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(<FileTreeAddRow {...defaultProps} />)
    await user.click(screen.getByLabelText('Cancel add'))
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders input with provided value', () => {
    render(<FileTreeAddRow {...defaultProps} newFileName="app.ts" />)
    const input = screen.getByTestId('file-tree-new-name-input') as HTMLInputElement
    expect(input.value).toBe('app.ts')
  })
})
