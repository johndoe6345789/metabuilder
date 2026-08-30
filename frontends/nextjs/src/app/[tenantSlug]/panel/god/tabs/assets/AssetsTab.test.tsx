import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

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

const asset = (over: Record<string, unknown> = {}) => ({
  key: 'logo.png',
  size: 2048,
  ...over,
})

const stub = (over: Record<string, unknown> = {}): void => {
  assetsHook.useAssets.mockReturnValue({
    assets: [],
    loading: false,
    busy: false,
    error: null,
    upload: vi.fn(),
    remove: vi.fn(),
    ...over,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  auth.value = authValue(asUser({ tenantId: 'acme' }))
  stub()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  Object.assign(navigator, { clipboard: { writeText: vi.fn() } })
})

describe('AssetsTab', () => {
  it('shows the empty message with no files', () => {
    render(<AssetsTab />)
    expect(screen.getByText(/No files yet/)).toBeTruthy()
  })

  it('shows a loading message while loading', () => {
    stub({ loading: true })
    render(<AssetsTab />)
    expect(screen.getByText('Loading files…')).toBeTruthy()
  })

  it('shows the reported error', () => {
    stub({ error: 'Upload failed' })
    render(<AssetsTab />)
    expect(screen.getByText('Upload failed')).toBeTruthy()
  })

  it('renders one card per asset', () => {
    stub({ assets: [asset(), asset({ key: 'doc.pdf' })] })
    render(<AssetsTab />)
    expect(screen.getByText('logo.png')).toBeTruthy()
    expect(screen.getByText('doc.pdf')).toBeTruthy()
  })

  it('confirms before deleting', () => {
    const remove = vi.fn()
    stub({ assets: [asset()], remove })
    render(<AssetsTab />)
    fireEvent.click(screen.getByText('Delete'))
    expect(window.confirm).toHaveBeenCalledWith('Delete logo.png?')
    expect(remove).toHaveBeenCalledWith('logo.png')
  })

  it('does not delete when the confirmation is declined', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const remove = vi.fn()
    stub({ assets: [asset()], remove })
    render(<AssetsTab />)
    fireEvent.click(screen.getByText('Delete'))
    expect(remove).not.toHaveBeenCalled()
  })

  it('copies the asset URL and shows feedback', () => {
    stub({ assets: [asset()] })
    render(<AssetsTab />)
    fireEvent.click(screen.getByText('Copy address'))
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getByText('Copied')).toBeTruthy()
  })
})
