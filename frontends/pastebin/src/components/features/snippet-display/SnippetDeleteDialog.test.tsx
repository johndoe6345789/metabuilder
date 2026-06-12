import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SnippetDeleteDialog } from './SnippetDeleteDialog'

jest.mock('@metabuilder/components/fakemui', () => ({
  Button: ({ children, onClick, variant, 'data-testid': testId }: any) => (
    <button onClick={onClick} data-variant={variant} data-testid={testId}>
      {children}
    </button>
  ),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Dialog: ({ open, onClose, children }: any) =>
    open ? (
      <div role="dialog" data-testid="delete-dialog">
        {children}
      </div>
    ) : null,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogActions: ({ children }: any) => <div>{children}</div>,
}))

describe('SnippetDeleteDialog', () => {
  const defaultProps = {
    open: true,
    snippetTitle: 'My Snippet',
    onCancel: jest.fn(),
    onConfirm: jest.fn(),
  }

  beforeEach(() => jest.clearAllMocks())

  it('renders when open is true', () => {
    render(<SnippetDeleteDialog {...defaultProps} />)
    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(<SnippetDeleteDialog {...defaultProps} open={false} />)
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog title', () => {
    render(<SnippetDeleteDialog {...defaultProps} />)
    expect(screen.getByText('Delete snippet?')).toBeInTheDocument()
  })

  it('renders snippet title in body text', () => {
    render(<SnippetDeleteDialog {...defaultProps} />)
    expect(
      screen.getByText(/"My Snippet" will be permanently deleted./),
    ).toBeInTheDocument()
  })

  it('renders cancel button', () => {
    render(<SnippetDeleteDialog {...defaultProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('renders confirm delete button with data-testid', () => {
    render(<SnippetDeleteDialog {...defaultProps} />)
    expect(screen.getByTestId('confirm-delete-snippet-btn')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<SnippetDeleteDialog {...defaultProps} />)
    await user.click(screen.getByText('Cancel'))
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(<SnippetDeleteDialog {...defaultProps} />)
    await user.click(screen.getByTestId('confirm-delete-snippet-btn'))
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('renders delete label on confirm button', () => {
    render(<SnippetDeleteDialog {...defaultProps} />)
    expect(screen.getByTestId('confirm-delete-snippet-btn').textContent).toBe(
      'Delete',
    )
  })

  it('uses the snippetTitle in the body correctly', () => {
    render(
      <SnippetDeleteDialog
        {...defaultProps}
        snippetTitle="special & snippet"
      />,
    )
    expect(
      screen.getByText(/"special & snippet" will be permanently deleted./),
    ).toBeInTheDocument()
  })
})
