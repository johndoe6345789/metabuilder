import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

// Delete/copy interactions -- split out of AssetsTab.test.tsx (which
// covers plain rendering) to stay under the 80-line file limit.

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))
const assetsHook = vi.hoisted(() => ({ useAssets: vi.fn() }))
vi.mock('./use-assets', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useAssets: assetsHook.useAssets }
})

import { asUser, authValue } from '@/test/auth-harness'
import { AssetsTab } from './AssetsTab'
import { asset, stub } from './assets-tab-test-helpers'

beforeEach(() => {
  vi.clearAllMocks()
  auth.value = authValue(asUser({ tenantId: 'acme' }))
  stub(assetsHook)
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  Object.assign(navigator, { clipboard: { writeText: vi.fn() } })
})

describe('AssetsTab actions', () => {
  it('confirms before deleting', () => {
    const remove = vi.fn()
    stub(assetsHook, { assets: [asset()], remove })
    render(<AssetsTab />)
    fireEvent.click(screen.getByText('Delete'))
    expect(window.confirm).toHaveBeenCalledWith('Delete logo.png?')
    expect(remove).toHaveBeenCalledWith('logo.png')
  })

  it('does not delete when the confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const remove = vi.fn()
    stub(assetsHook, { assets: [asset()], remove })
    render(<AssetsTab />)
    fireEvent.click(screen.getByText('Delete'))
    expect(remove).not.toHaveBeenCalled()
  })

  it('copies the asset URL and shows feedback', () => {
    stub(assetsHook, { assets: [asset()] })
    render(<AssetsTab />)
    fireEvent.click(screen.getByText('Copy address'))
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getByText('Copied')).toBeTruthy()
  })
})
