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

// Split out of AdminContent.test.tsx to stay under the 80-line file limit.
describe('AdminContent delete flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens the confirm dialog with the deleted user on onDelete', () => {
    adminDataHook.useAdminData.mockReturnValue(makeAdminData())
    render(<AdminContent />)
    expect(screen.getByTestId('confirm-user').textContent).toBe('')
    fireEvent.click(screen.getByText('delete-alice'))
    expect(screen.getByTestId('confirm-user').textContent).toBe('alice')
  })

  it('clears the pending user without removing on cancel', () => {
    const data = makeAdminData()
    adminDataHook.useAdminData.mockReturnValue(data)
    render(<AdminContent />)
    fireEvent.click(screen.getByText('delete-alice'))
    fireEvent.click(screen.getByText('cancel'))
    expect(screen.getByTestId('confirm-user').textContent).toBe('')
    expect(data.removeUser).not.toHaveBeenCalled()
  })

  it('calls removeUser with the pending id and clears it on confirm', () => {
    const data = makeAdminData()
    adminDataHook.useAdminData.mockReturnValue(data)
    render(<AdminContent />)
    fireEvent.click(screen.getByText('delete-alice'))
    fireEvent.click(screen.getByText('confirm'))
    expect(data.removeUser).toHaveBeenCalledWith('u1')
    expect(screen.getByTestId('confirm-user').textContent).toBe('')
  })
})
