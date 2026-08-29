import { describe, expect, it } from 'vitest'

import {
  DEFAULT_GOD_PANEL_TAB,
  DEFAULT_TENANT_ID,
  normalizeTenantId,
  tenantGodPanelPath,
  tenantPanelPath,
  tenantPath,
} from './workspace-paths'

describe('normalizeTenantId', () => {
  it('keeps a real tenant name', () => {
    expect(normalizeTenantId('acme')).toBe('acme')
  })

  it.each([undefined, null, '', '   '])(
    'falls back to the system tenant for %p',
    value => {
      expect(normalizeTenantId(value)).toBe(DEFAULT_TENANT_ID)
    }
  )

  it('trims surrounding whitespace', () => {
    expect(normalizeTenantId('  acme  ')).toBe('acme')
  })

  // A slash would open a second path segment, so it cannot survive into a
  // URL built from this value.
  it('replaces every separator', () => {
    expect(normalizeTenantId('a/b/c')).toBe('a-b-c')
  })
})

describe('tenantPanelPath', () => {
  it('points at the tenant\'s panel', () => {
    expect(tenantPanelPath('acme')).toBe('/acme/panel')
  })

  it('falls back to the system panel', () => {
    expect(tenantPanelPath(null)).toBe('/system/panel')
  })

  it('appends a section', () => {
    expect(tenantPanelPath('acme', 'dashboard')).toBe('/acme/panel/dashboard')
  })

  it('does not double the separator when the section has one', () => {
    expect(tenantPanelPath('acme', '/dashboard')).toBe('/acme/panel/dashboard')
    expect(tenantPanelPath('acme', '///deep')).toBe('/acme/panel/deep')
  })

  it('encodes a tenant name that needs it', () => {
    expect(tenantPanelPath('a b')).toBe('/a%20b/panel')
  })
})

describe('tenantGodPanelPath', () => {
  it('points at the god panel', () => {
    expect(tenantGodPanelPath('acme')).toBe('/acme/panel/god')
  })

  it('appends a tab', () => {
    expect(tenantGodPanelPath('acme', 'overview')).toBe(
      '/acme/panel/god/overview'
    )
  })

  it('encodes a tab id that needs it', () => {
    expect(tenantGodPanelPath('acme', 'a b')).toBe('/acme/panel/god/a%20b')
  })

  it('names a default tab for a URL that gives none', () => {
    expect(DEFAULT_GOD_PANEL_TAB).toBe('overview')
  })
})

describe('tenantPath', () => {
  it('puts a workspace route under the panel', () => {
    expect(tenantPath('acme', '/dashboard')).toBe('/acme/panel/dashboard')
  })

  it('accepts a path with no leading slash', () => {
    expect(tenantPath('acme', 'dashboard')).toBe('/acme/panel/dashboard')
  })

  it('treats the root as the panel itself', () => {
    expect(tenantPath('acme', '/')).toBe('/acme/panel')
  })

  // Applying the rule twice must not nest the panel inside itself.
  it('leaves a path that is already under the panel alone', () => {
    expect(tenantPath('acme', '/acme/panel/dashboard')).toBe(
      '/acme/panel/dashboard'
    )
    expect(tenantPath('acme', tenantPath('acme', '/x'))).toBe(
      '/acme/panel/x'
    )
  })

  it('falls back to the system tenant', () => {
    expect(tenantPath(null, '/x')).toBe('/system/panel/x')
  })
})
