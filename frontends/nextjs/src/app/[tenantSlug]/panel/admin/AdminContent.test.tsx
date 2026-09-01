import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  adminDataHook,
  mockAdminHeader,
  mockAdminTabs,
  mockStatsGrid,
  mockUsersTable,
  mockConfirmDeleteUser,
  makeAdminData,
} from './admin-content-test-mocks'

vi.mock('./use-admin-data', () => adminDataHook)
vi.mock('./AdminHeader', () => ({ AdminHeader: mockAdminHeader }))
vi.mock('./AdminTabs', () => ({ AdminTabs: mockAdminTabs }))
vi.mock('./StatsGrid', () => ({ StatsGrid: mockStatsGrid }))
vi.mock('./UsersTable', () => ({ UsersTable: mockUsersTable }))
vi.mock('./ConfirmDeleteUser', () => ({
  ConfirmDeleteUser: mockConfirmDeleteUser,
}))

import { AdminContent } from './AdminContent'

describe('AdminContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not show the unreachable message when status is ready', () => {
    adminDataHook.useAdminData.mockReturnValue(
      makeAdminData({ status: 'ready' })
    )
    render(<AdminContent />)
    expect(screen.queryByText(/data layer is unreachable/)).toBeNull()
  })

  it('shows the unreachable message and empty-message when unreachable', () => {
    adminDataHook.useAdminData.mockReturnValue(
      makeAdminData({ status: 'unreachable' })
    )
    render(<AdminContent />)
    expect(screen.getByText(/data layer is unreachable/)).toBeTruthy()
    expect(screen.getByTestId('users-empty-message').textContent).toBe(
      'Could not load accounts'
    )
  })

  it('shows the default empty message when reachable', () => {
    adminDataHook.useAdminData.mockReturnValue(
      makeAdminData({ status: 'ready' })
    )
    render(<AdminContent />)
    expect(screen.getByTestId('users-empty-message').textContent).toBe(
      'No users found'
    )
  })

  it('threads stats, user count and comment count to their children', () => {
    adminDataHook.useAdminData.mockReturnValue(makeAdminData())
    render(<AdminContent />)
    expect(screen.getByTestId('stats-grid').textContent).toContain(
      'Total Users'
    )
    expect(screen.getByTestId('tabs-usercount').textContent).toBe('2')
    expect(screen.getByTestId('tabs-commentcount').textContent).toBe('3')
  })
})
