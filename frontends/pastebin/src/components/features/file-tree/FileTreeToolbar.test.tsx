import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileTreeToolbar } from './FileTreeToolbar'

jest.mock('@metabuilder/components/m3', () => ({
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

describe('FileTreeToolbar', () => {
  const uploadInputRef = { current: null } as React.RefObject<HTMLInputElement>

  const defaultProps = {
    title: 'Files',
    addLabel: 'Add new file',
    uploadLabel: 'Upload file',
    uploadInputRef,
    onAddFile: jest.fn(),
    onUploadClick: jest.fn(),
    onUploadChange: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders the toolbar title', () => {
    render(<FileTreeToolbar {...defaultProps} />)
    expect(screen.getByText('Files')).toBeInTheDocument()
  })

  it('renders add button with data-testid', () => {
    render(<FileTreeToolbar {...defaultProps} />)
    expect(screen.getByTestId('file-tree-add-btn')).toBeInTheDocument()
  })

  it('renders upload button with data-testid', () => {
    render(<FileTreeToolbar {...defaultProps} />)
    expect(screen.getByTestId('file-tree-upload-btn')).toBeInTheDocument()
  })

  it('renders hidden file input', () => {
    render(<FileTreeToolbar {...defaultProps} />)
    expect(screen.getByTestId('file-tree-upload-input')).toBeInTheDocument()
  })

  it('add button has correct aria-label', () => {
    render(<FileTreeToolbar {...defaultProps} />)
    expect(screen.getByLabelText('Add new file')).toBeInTheDocument()
  })

  it('upload button has correct aria-label', () => {
    render(<FileTreeToolbar {...defaultProps} />)
    expect(screen.getByLabelText('Upload file')).toBeInTheDocument()
  })

  it('calls onAddFile when add button clicked', async () => {
    const user = userEvent.setup()
    render(<FileTreeToolbar {...defaultProps} />)
    await user.click(screen.getByTestId('file-tree-add-btn'))
    expect(defaultProps.onAddFile).toHaveBeenCalledTimes(1)
  })

  it('calls onUploadClick when upload button clicked', async () => {
    const user = userEvent.setup()
    render(<FileTreeToolbar {...defaultProps} />)
    await user.click(screen.getByTestId('file-tree-upload-btn'))
    expect(defaultProps.onUploadClick).toHaveBeenCalledTimes(1)
  })

  it('hidden input is aria-hidden and tabIndex -1', () => {
    render(<FileTreeToolbar {...defaultProps} />)
    const input = screen.getByTestId('file-tree-upload-input')
    expect(input).toHaveAttribute('aria-hidden', 'true')
    expect(input).toHaveAttribute('tabIndex', '-1')
  })
})
