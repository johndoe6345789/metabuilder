import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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

// Split out of AdminContent.test.tsx (which covers headline rendering) to
// stay under the 80-line file limit.
describe('AdminContent search and tab wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters visible users by the search box wiring', () => {
    adminDataHook.useAdminData.mockReturnValue(makeAdminData())
    render(<AdminContent />)
    expect(screen.getByTestId('users-visible').textContent).toBe(
      'alice,bob'
    )
    fireEvent.click(screen.getByText('change-search'))
    // "bob" matches only the second user's username.
    expect(screen.getByTestId('header-search').textContent).toBe('bob')
    expect(screen.getByTestId('users-visible').textContent).toBe('bob')
  })

  it('threads activeTab through AdminTabs onChange to state', () => {
    adminDataHook.useAdminData.mockReturnValue(makeAdminData())
    render(<AdminContent />)
    expect(screen.getByTestId('tabs-active').textContent).toBe('0')
    fireEvent.click(screen.getByText('change-tab'))
    expect(screen.getByTestId('tabs-active').textContent).toBe('2')
  })
})
