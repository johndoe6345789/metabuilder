import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

const styleClasses = vi.hoisted(() => ({
  loadStyleClasses: vi.fn(),
  styleSheetText: vi.fn(),
}))
vi.mock('@/lib/tenant/style-classes', () => styleClasses)

import { TenantStyleSheet } from './TenantStyleSheet'

beforeEach(() => {
  vi.clearAllMocks()
  styleClasses.loadStyleClasses.mockResolvedValue([])
})

describe('TenantStyleSheet', () => {
  it('renders a <style> tag with the generated CSS', async () => {
    styleClasses.styleSheetText.mockReturnValue('.foo { color: red; }')
    const element = await TenantStyleSheet({ tenant: 'acme' })
    render(element)
    // React hoists a precedence-carrying <style> into <head>, renaming
    // href/precedence to data-href/data-precedence in the process.
    const style = document.querySelector(
      'style[data-href="tenant-styles-acme"]'
    )
    expect(style?.textContent).toBe('.foo { color: red; }')
  })

  it('renders nothing when there is no CSS to emit', async () => {
    styleClasses.styleSheetText.mockReturnValue('')
    const element = await TenantStyleSheet({ tenant: 'acme' })
    expect(element).toBeNull()
  })

  it('loads style classes scoped to the given tenant', async () => {
    styleClasses.styleSheetText.mockReturnValue('')
    await TenantStyleSheet({ tenant: 'acme' })
    expect(styleClasses.loadStyleClasses).toHaveBeenCalledWith(
      expect.any(String),
      'acme'
    )
  })
})
