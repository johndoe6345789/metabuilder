import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
})

describe('AssetsTab', () => {
  it('shows the empty message with no files', () => {
    render(<AssetsTab />)
    expect(screen.getByText(/No files yet/)).toBeTruthy()
  })

  it('shows a loading message while loading', () => {
    stub(assetsHook, { loading: true })
    render(<AssetsTab />)
    expect(screen.getByText('Loading files…')).toBeTruthy()
  })

  it('shows the reported error', () => {
    stub(assetsHook, { error: 'Upload failed' })
    render(<AssetsTab />)
    expect(screen.getByText('Upload failed')).toBeTruthy()
  })

  it('renders one card per asset', () => {
    stub(assetsHook, { assets: [asset(), asset({ key: 'doc.pdf' })] })
    render(<AssetsTab />)
    expect(screen.getByText('logo.png')).toBeTruthy()
    expect(screen.getByText('doc.pdf')).toBeTruthy()
  })
})
