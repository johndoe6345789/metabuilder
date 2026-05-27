/**
 * Tests for NotificationMenu component
 */

jest.mock('../HeaderIcons', () => ({
  NotificationIcon: () => <span data-testid="notification-icon" />,
}))

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationMenu } from '../NotificationMenu'

describe('NotificationMenu', () => {
  it('should render the notification button', () => {
    render(<NotificationMenu />)
    expect(screen.getByTestId('button-notifications')).toBeInTheDocument()
  })

  it('should show unread count badge', () => {
    render(<NotificationMenu />)
    // 2 unread notifications in mockNotifications
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should not show notification menu initially', () => {
    render(<NotificationMenu />)
    // Menu starts closed
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
  })

  it('should open menu when notification button clicked', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('should show unread count in menu header', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    expect(screen.getByText('2 new')).toBeInTheDocument()
  })

  it('should show notification titles in menu', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    expect(screen.getByText('Workflow completed')).toBeInTheDocument()
    expect(screen.getByText('New plugin available')).toBeInTheDocument()
    expect(screen.getByText('System update')).toBeInTheDocument()
  })

  it('should show notification messages', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    expect(screen.getByText('My Workflow ran successfully')).toBeInTheDocument()
  })

  it('should show notification times', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    expect(screen.getByText('2 min ago')).toBeInTheDocument()
  })

  it('should show View all notifications link', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    expect(screen.getByText('View all notifications')).toBeInTheDocument()
  })

  it('should close menu when View all notifications clicked', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    fireEvent.click(screen.getByText('View all notifications'))
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
  })

  it('should close menu when notification item clicked', () => {
    render(<NotificationMenu />)
    fireEvent.click(screen.getByTestId('button-notifications'))
    fireEvent.click(screen.getByText('Workflow completed'))
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
  })
})
