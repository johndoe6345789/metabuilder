import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  pkgMod,
  renderMod,
  tenantMod,
  navMod,
  mockUIPageRenderer,
  props,
  comp,
  pkgData,
} from './page-test-mocks'

vi.mock('@/lib/packages/json/functions/load-json-package', () => pkgMod)
vi.mock('@/lib/packages/json/render-json-component', () => renderMod)
vi.mock('@/lib/tenant/fetch-tenant-page', () => tenantMod)
vi.mock('@/components/ui-page-renderer/UIPageRenderer', () => ({
  UIPageRenderer: mockUIPageRenderer,
}))
vi.mock('next/navigation', () => navMod)

import PackagePage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PackagePage home component selection', () => {
  it('prefers the component with id home_page', async () => {
    pkgMod.loadJSONPackage.mockResolvedValue(
      pkgData([comp('other', 'Other'), comp('home_page', 'Landing')])
    )
    const result = await PackagePage(props())
    render(result)
    expect(screen.getByTestId('rendered').textContent).toBe('home_page')
    expect(renderMod.renderJSONComponent).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'home_page' }),
      { tenant: 'acme', package: 'blog' },
      {}
    )
  })

  it('falls back to a component named HomePage', async () => {
    pkgMod.loadJSONPackage.mockResolvedValue(
      pkgData([comp('a', 'Other'), comp('b', 'HomePage')])
    )
    const result = await PackagePage(props())
    render(result)
    expect(screen.getByTestId('rendered').textContent).toBe('b')
  })

  it('falls back to a component named Home', async () => {
    pkgMod.loadJSONPackage.mockResolvedValue(
      pkgData([comp('a', 'Other'), comp('b', 'Home')])
    )
    const result = await PackagePage(props())
    render(result)
    expect(screen.getByTestId('rendered').textContent).toBe('b')
  })

  it('falls back to the first component when none match', async () => {
    pkgMod.loadJSONPackage.mockResolvedValue(
      pkgData([comp('first', 'Other'), comp('second', 'Second')])
    )
    const result = await PackagePage(props())
    render(result)
    expect(screen.getByTestId('rendered').textContent).toBe('first')
  })
})
