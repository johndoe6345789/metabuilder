// Shared mock components + fixtures for AdminContent's split test files.
// Kept as .ts (no JSX) so it falls outside the 80-line .tsx guardrail that
// forces AdminContent's own tests to be split across several files.
import { createElement } from 'react'
import { vi } from 'vitest'
import type { UserRecord, EntityStat } from './admin-types'
import type { AdminData } from './use-admin-data'

export const adminDataHook = { useAdminData: vi.fn() }

export function mockAdminHeader(props: {
  search: string
  onSearchChange: (v: string) => void
}) {
  return createElement(
    'div',
    { 'data-testid': 'admin-header' },
    createElement('span', { 'data-testid': 'header-search' }, props.search),
    createElement(
      'button',
      { onClick: () => { props.onSearchChange('bob'); } },
      'change-search'
    )
  )
}

export function mockAdminTabs(props: {
  activeTab: number
  onChange: (i: number) => void
  userCount: number
  commentCount: number
  children: React.ReactNode
}) {
  return createElement(
    'div',
    { 'data-testid': 'admin-tabs' },
    createElement('span', { 'data-testid': 'tabs-active' }, props.activeTab),
    createElement(
      'span',
      { 'data-testid': 'tabs-usercount' },
      props.userCount
    ),
    createElement(
      'span',
      { 'data-testid': 'tabs-commentcount' },
      props.commentCount
    ),
    createElement(
      'button',
      { onClick: () => { props.onChange(2); } },
      'change-tab'
    ),
    props.children
  )
}

export function mockStatsGrid(props: { stats: EntityStat[] }) {
  return createElement(
    'div',
    { 'data-testid': 'stats-grid' },
    JSON.stringify(props.stats)
  )
}

export function mockUsersTable(props: {
  users: UserRecord[]
  emptyMessage: string
  onDelete: (u: UserRecord) => void
}) {
  const alice: UserRecord = {
    id: 'u1',
    username: 'alice',
    email: 'alice@x.com',
    role: 'user',
    createdAt: '2026-01-01',
  }
  return createElement(
    'div',
    { 'data-testid': 'users-table' },
    createElement(
      'span',
      { 'data-testid': 'users-visible' },
      props.users.map(u => u.username).join(',')
    ),
    createElement(
      'span',
      { 'data-testid': 'users-empty-message' },
      props.emptyMessage
    ),
    createElement(
      'button',
      { onClick: () => { props.onDelete(alice); } },
      'delete-alice'
    )
  )
}

export function mockConfirmDeleteUser(props: {
  user: UserRecord | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return createElement(
    'div',
    { 'data-testid': 'confirm-delete' },
    createElement(
      'span',
      { 'data-testid': 'confirm-user' },
      props.user?.username ?? ''
    ),
    createElement('button', { onClick: props.onCancel }, 'cancel'),
    createElement('button', { onClick: props.onConfirm }, 'confirm')
  )
}

export function makeAdminData(overrides: Partial<AdminData> = {}): AdminData {
  return {
    users: [
      {
        id: 'u1',
        username: 'alice',
        email: 'alice@x.com',
        role: 'user',
        createdAt: '2026-01-01',
      },
      {
        id: 'u2',
        username: 'bob',
        email: 'bob@x.com',
        role: 'admin',
        createdAt: '2026-01-02',
      },
    ],
    stats: [{ label: 'Total Users', count: 2, icon: 'U' }],
    commentCount: 3,
    status: 'ready',
    removeUser: vi.fn().mockResolvedValue(true),
    ...overrides,
  }
}
