import React from 'react'
import { render, screen } from '@testing-library/react'
import { ShareDialogEmailApps } from './ShareDialogEmailApps'

jest.mock('@metabuilder/components/fakemui', () => ({
  MaterialIcon: ({ name }: any) => <span data-icon={name} />,
}))

describe('ShareDialogEmailApps', () => {
  const defaultProps = {
    gmailUrl: 'https://mail.google.com/mail/?view=cm&body=hello',
    outlookUrl:
      'https://outlook.live.com/owa/?path=/mail/action/compose&body=hello',
    mailtoUrl: 'mailto:?body=hello',
  }

  it('renders Gmail link', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    expect(screen.getByLabelText('Share via Gmail')).toBeInTheDocument()
  })

  it('Gmail link has correct href', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    const link = screen.getByLabelText('Share via Gmail')
    expect(link).toHaveAttribute('href', defaultProps.gmailUrl)
  })

  it('Gmail link opens in new tab', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    const link = screen.getByLabelText('Share via Gmail')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders Outlook link', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    expect(screen.getByLabelText('Share via Outlook')).toBeInTheDocument()
  })

  it('Outlook link has correct href', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    const link = screen.getByLabelText('Share via Outlook')
    expect(link).toHaveAttribute('href', defaultProps.outlookUrl)
  })

  it('Outlook link opens in new tab', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    const link = screen.getByLabelText('Share via Outlook')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders Email (mailto) link', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    expect(screen.getByLabelText('Share via email')).toBeInTheDocument()
  })

  it('Email link uses mailtoUrl', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    const link = screen.getByLabelText('Share via email')
    expect(link).toHaveAttribute('href', defaultProps.mailtoUrl)
  })

  it('Email link does not have target=_blank (uses mailto)', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    const link = screen.getByLabelText('Share via email')
    expect(link).not.toHaveAttribute('target', '_blank')
  })

  it('renders label text for each app', () => {
    render(<ShareDialogEmailApps {...defaultProps} />)
    expect(screen.getByText('Gmail')).toBeInTheDocument()
    expect(screen.getByText('Outlook')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })
})
