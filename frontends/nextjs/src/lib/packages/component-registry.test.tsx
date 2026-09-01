import { describe, expect, it, vi } from 'vitest'

vi.mock('@/app/[tenantSlug]/panel/dashboard/DashboardContent', () => ({
  DashboardContent: () => <div data-testid="dashboard-content" />,
}))
vi.mock('@/app/[tenantSlug]/panel/admin/AdminContent', () => ({
  AdminContent: () => <div data-testid="admin-content" />,
}))
vi.mock('@/app/[tenantSlug]/panel/profile/ProfileContent', () => ({
  ProfileContent: () => <div data-testid="profile-content" />,
}))
vi.mock('@/app/[tenantSlug]/panel/comments/CommentsContent', () => ({
  CommentsContent: () => <div data-testid="comments-content" />,
}))
vi.mock('@/app/[tenantSlug]/panel/chat/ChatContent', () => ({
  ChatContent: () => <div data-testid="chat-content" />,
}))
vi.mock('@/app/[tenantSlug]/panel/vault/VaultShell', () => ({
  VaultShell: () => <div data-testid="vault-shell" />,
}))

import {
  COMPONENT_REGISTRY,
  resolveComponent,
} from './component-registry'

describe('COMPONENT_REGISTRY', () => {
  it('registers every known page component name', () => {
    expect(Object.keys(COMPONENT_REGISTRY).sort()).toEqual(
      [
        'comments_wall',
        'dashboard_home',
        'irc_home',
        'user_list_admin',
        'user_profile',
        'vault_shell',
      ].sort()
    )
  })
})

describe('resolveComponent', () => {
  it('resolves a registered name to its component', () => {
    expect(resolveComponent('dashboard_home')).toBe(
      COMPONENT_REGISTRY.dashboard_home
    )
  })

  it('returns null for an unregistered name', () => {
    expect(resolveComponent('not_a_real_page')).toBeNull()
  })

  it('returns null for null', () => {
    expect(resolveComponent(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(resolveComponent(undefined)).toBeNull()
  })
})
