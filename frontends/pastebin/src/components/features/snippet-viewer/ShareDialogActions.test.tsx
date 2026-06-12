import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShareDialogActions } from './ShareDialogActions'

jest.mock('@metabuilder/components/fakemui', () => ({
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

describe('ShareDialogActions', () => {
  const defaultProps = {
    shareUrl: 'https://example.com/share/abc',
    copied: false,
    revoking: false,
    onCopy: jest.fn(),
    onNativeShare: jest.fn(),
    onRevoke: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Copy Link button', () => {
    render(<ShareDialogActions {...defaultProps} />)
    expect(screen.getByLabelText('Copy link')).toBeInTheDocument()
  })

  it('shows "Copy Link" label when not copied', () => {
    render(<ShareDialogActions {...defaultProps} copied={false} />)
    expect(screen.getByText('Copy Link')).toBeInTheDocument()
  })

  it('shows "Copied!" label when copied', () => {
    render(<ShareDialogActions {...defaultProps} copied={true} />)
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('calls onCopy when Copy button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShareDialogActions {...defaultProps} />)
    await user.click(screen.getByLabelText('Copy link'))
    expect(defaultProps.onCopy).toHaveBeenCalledTimes(1)
  })

  it('renders Open button', () => {
    render(<ShareDialogActions {...defaultProps} />)
    expect(screen.getByLabelText('Open in new tab')).toBeInTheDocument()
  })

  it('renders Revoke button', () => {
    render(<ShareDialogActions {...defaultProps} />)
    expect(screen.getByLabelText('Revoke share link')).toBeInTheDocument()
  })

  it('disables Revoke button when revoking is true', () => {
    render(<ShareDialogActions {...defaultProps} revoking={true} />)
    expect(screen.getByLabelText('Revoke share link')).toBeDisabled()
  })

  it('enables Revoke button when revoking is false', () => {
    render(<ShareDialogActions {...defaultProps} revoking={false} />)
    expect(screen.getByLabelText('Revoke share link')).not.toBeDisabled()
  })

  it('shows "Revoking…" text while revoking', () => {
    render(<ShareDialogActions {...defaultProps} revoking={true} />)
    expect(screen.getByText('Revoking…')).toBeInTheDocument()
  })

  it('shows "Revoke" text when not revoking', () => {
    render(<ShareDialogActions {...defaultProps} revoking={false} />)
    expect(screen.getByText('Revoke')).toBeInTheDocument()
  })

  it('calls onRevoke when Revoke button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShareDialogActions {...defaultProps} />)
    await user.click(screen.getByLabelText('Revoke share link'))
    expect(defaultProps.onRevoke).toHaveBeenCalledTimes(1)
  })

  it('opens shareUrl in new tab when Open is clicked', async () => {
    const user = userEvent.setup()
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<ShareDialogActions {...defaultProps} />)
    await user.click(screen.getByLabelText('Open in new tab'))
    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/share/abc',
      '_blank',
    )
    openSpy.mockRestore()
  })

  describe('native share button', () => {
    it('renders native share button when navigator.share is available', () => {
      Object.defineProperty(navigator, 'share', {
        value: jest.fn(),
        configurable: true,
      })
      render(<ShareDialogActions {...defaultProps} />)
      expect(
        screen.getByLabelText('Share via system share sheet'),
      ).toBeInTheDocument()
    })

    it('calls onNativeShare when native share button is clicked', async () => {
      Object.defineProperty(navigator, 'share', {
        value: jest.fn(),
        configurable: true,
      })
      const user = userEvent.setup()
      render(<ShareDialogActions {...defaultProps} />)
      await user.click(screen.getByLabelText('Share via system share sheet'))
      expect(defaultProps.onNativeShare).toHaveBeenCalledTimes(1)
    })
  })
})
