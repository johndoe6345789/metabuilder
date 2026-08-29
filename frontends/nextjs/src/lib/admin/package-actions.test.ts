import { describe, expect, it } from 'vitest'

import { pkg } from './test-support/package-fixtures'
import {
  canDisablePackage,
  canEnablePackage,
  canInstallPackage,
  canUninstallPackage,
  getAvailableActions,
} from '@/lib/admin/package-utils'

describe('canInstallPackage', () => {
  it('is true for an available, disabled package', () => {
    expect(canInstallPackage(pkg({ status: 'available' }))).toBe(true)
  })

  it.each(['installed', 'disabled'])('is false when %s', status => {
    expect(canInstallPackage(pkg({ status }))).toBe(false)
  })

  // An enabled package is already in the product; offering to install it
  // would be offering to install it twice.
  it('is false for an available package that is somehow enabled', () => {
    expect(canInstallPackage(pkg({ status: 'available', enabled: true }))).toBe(
      false
    )
  })
})

describe('canUninstallPackage', () => {
  it.each(['installed', 'disabled'])('is true when %s', status => {
    expect(canUninstallPackage(pkg({ status }))).toBe(true)
  })

  it('is false for a package that was never installed', () => {
    expect(canUninstallPackage(pkg({ status: 'available' }))).toBe(false)
  })
})

describe('canEnablePackage', () => {
  it('is true for an installed but disabled package', () => {
    expect(canEnablePackage(pkg({ status: 'installed' }))).toBe(true)
  })

  it('is false when it is already enabled', () => {
    expect(canEnablePackage(pkg({ status: 'installed', enabled: true }))).toBe(
      false
    )
  })

  it('is false for a package that is not installed', () => {
    expect(canEnablePackage(pkg({ status: 'available' }))).toBe(false)
  })
})

describe('canDisablePackage', () => {
  it('is true for an installed, enabled package', () => {
    expect(canDisablePackage(pkg({ status: 'installed', enabled: true }))).toBe(
      true
    )
  })

  it('is false when it is already disabled', () => {
    expect(canDisablePackage(pkg({ status: 'installed' }))).toBe(false)
  })
})

describe('getAvailableActions', () => {
  it('offers only install for an available package', () => {
    expect(getAvailableActions(pkg({ status: 'available' }))).toEqual([
      'install',
    ])
  })

  it('offers uninstall and enable for an installed, disabled one', () => {
    expect(getAvailableActions(pkg({ status: 'installed' }))).toEqual([
      'uninstall',
      'enable',
    ])
  })

  it('offers uninstall and disable for an installed, enabled one', () => {
    expect(
      getAvailableActions(pkg({ status: 'installed', enabled: true }))
    ).toEqual(['uninstall', 'disable'])
  })

  // Enable and disable are opposites; a package can never be offered both.
  it.each([
    { status: 'available', enabled: false },
    { status: 'installed', enabled: false },
    { status: 'installed', enabled: true },
    { status: 'disabled', enabled: false },
  ])('never offers both enable and disable for %j', over => {
    const actions = getAvailableActions(pkg(over))
    expect(actions.includes('enable') && actions.includes('disable')).toBe(
      false
    )
  })

  it('offers nothing for a status it does not recognise', () => {
    expect(getAvailableActions(pkg({ status: 'quarantined' }))).toEqual([])
  })
})
