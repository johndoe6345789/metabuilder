import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog'

describe('Dialog Component', () => {
  // Basic rendering tests
  it('renders dialog container when open prop is not false', () => {
    render(
      <Dialog open={true}>
        <div>Dialog content</div>
      </Dialog>
    )
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    render(
      <Dialog open={false}>
        <div>Dialog content</div>
      </Dialog>
    )
    expect(screen.queryByText('Dialog content')).not.toBeInTheDocument()
  })

  it('renders dialog when open is undefined', () => {
    render(
      <Dialog>
        <div>Dialog content</div>
      </Dialog>
    )
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  // DialogTrigger tests
  it('renders dialog trigger button', () => {
    render(<DialogTrigger>Open Dialog</DialogTrigger>)
    expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument()
  })

  it('calls onClick handler on trigger button click', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    render(<DialogTrigger onClick={handleClick}>Open Dialog</DialogTrigger>)

    await user.click(screen.getByRole('button', { name: 'Open Dialog' }))
    expect(handleClick).toHaveBeenCalled()
  })

  // DialogContent tests
  it('renders dialog content with portal', async () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent>Dialog content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('applies custom className to dialog content', async () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent className="custom-dialog">Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))
    const dialog = document.querySelector('.mat-mdc-dialog-surface.custom-dialog')
    expect(dialog).toBeInTheDocument()
  })

  it('renders dialog with role="dialog"', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
  })

  it('sets aria-modal attribute on dialog', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  // DialogOverlay tests
  it('renders dialog overlay', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const overlays = document.querySelectorAll('[data-testid="dialog-overlay"]')
    expect(overlays.length).toBeGreaterThan(0)
  })

  it('overlay has correct classes', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const overlays = document.querySelectorAll('[data-testid="dialog-overlay"]')
    if (overlays.length > 0) {
      expect(overlays[0]).toHaveClass('cdk-overlay-backdrop')
      expect(overlays[0]).toHaveClass('cdk-overlay-dark-backdrop')
    }
  })

  it('overlay renders with aria-hidden attribute', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const overlays = document.querySelectorAll('[data-testid="dialog-overlay"]')
    if (overlays.length > 0) {
      expect(overlays[0]).toHaveAttribute('aria-hidden', 'true')
    }
  })

  // Escape key test
  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(
      <Dialog open={true}>
        <DialogContent onClose={handleClose}>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    await user.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalled()
  })

  // Dialog header and title tests
  it('renders dialog header', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>Header</DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('renders dialog title', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const title = screen.getByText('Dialog Title')
    expect(title.tagName).toBe('H2')
  })

  it('renders dialog description', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogDescription>This is a description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    const description = screen.getByText('This is a description')
    expect(description.tagName).toBe('P')
  })

  // Dialog footer test
  it('renders dialog footer', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogFooter>Footer content</DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  // Dialog close button test
  it('renders close button in dialog content', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const closeBtn = screen.getByTestId('dialog-close-btn')
    expect(closeBtn).toBeInTheDocument()
  })

  it('close button has correct aria-label', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const closeBtn = screen.getByTestId('dialog-close-btn')
    expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog')
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(
      <Dialog open={true}>
        <DialogContent onClose={handleClose}>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const closeBtn = screen.getByTestId('dialog-close-btn')
    await user.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  // DialogClose component test
  it('renders dialog close component', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogClose onClick={jest.fn()}>Close</DialogClose>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  // Full dialog flow test
  it('renders complete dialog with all components', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <DialogDescription>Are you sure?</DialogDescription>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  // Dialog container structure test
  it('renders dialog in correct portal structure', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const container = document.querySelector('.cdk-overlay-container')
    expect(container).toBeInTheDocument()

    const wrapper = document.querySelector('.cdk-global-overlay-wrapper')
    expect(wrapper).toBeInTheDocument()

    const pane = document.querySelector('.cdk-overlay-pane')
    expect(pane).toBeInTheDocument()
  })

  // Dialog with custom className test
  it('applies custom className to all dialog sub-components', async () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent className="custom-content">
          <DialogHeader className="custom-header">Header</DialogHeader>
          <DialogTitle className="custom-title">Title</DialogTitle>
          <DialogDescription className="custom-desc">Desc</DialogDescription>
          <DialogFooter className="custom-footer">Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(document.querySelector('.custom-content')).toBeInTheDocument()
    expect(document.querySelector('.custom-header')).toBeInTheDocument()
    expect(document.querySelector('.custom-title')).toBeInTheDocument()
    expect(document.querySelector('.custom-desc')).toBeInTheDocument()
    expect(document.querySelector('.custom-footer')).toBeInTheDocument()
  })
})
