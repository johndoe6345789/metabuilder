import { describe, it, expect } from 'vitest'
import { isActivePath, visibleLevelNavItems } from './level-nav-items'

describe('isActivePath', () => {
  it('matches the root only when the pathname is exactly root', () => {
    expect(isActivePath('/', '/')).toBe(true)
    expect(isActivePath('/dashboard', '/')).toBe(false)
  })

  it('matches an exact path', () => {
    expect(isActivePath('/admin', '/admin')).toBe(true)
  })

  it('matches a nested path', () => {
    expect(isActivePath('/admin/users', '/admin')).toBe(true)
  })

  it('does not match a different path that merely shares a prefix', () => {
    expect(isActivePath('/administration', '/admin')).toBe(false)
  })
})

describe('visibleLevelNavItems', () => {
  it('shows only the public item to an anonymous caller', () => {
    const items = visibleLevelNavItems('acme', false, 0)
    expect(items.map(i => i.label)).toEqual(['Public', 'User'])
  })

  it('caps items at the caller level once signed in', () => {
    const items = visibleLevelNavItems('acme', true, 2)
    expect(items.map(i => i.label)).toEqual(['Public', 'User', 'Admin'])
  })

  it('shows every item to a level-5 caller', () => {
    const items = visibleLevelNavItems('acme', true, 5)
    expect(items).toHaveLength(5)
  })

  it('tenant-scopes paths once authenticated, except the public root', () => {
    const items = visibleLevelNavItems('acme', true, 5)
    const publicItem = items.find(i => i.label === 'Public')
    const userItem = items.find(i => i.label === 'User')
    expect(publicItem?.path).toBe('/')
    expect(userItem?.path).toContain('acme')
  })

  it('routes the god item through the tenant god-panel path', () => {
    const items = visibleLevelNavItems('acme', true, 5)
    const god = items.find(i => i.label === 'God')
    expect(god?.path).toMatch(/acme.*god/)
  })
})
