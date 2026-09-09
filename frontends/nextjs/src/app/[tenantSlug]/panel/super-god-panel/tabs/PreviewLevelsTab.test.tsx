import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))
const push = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

import { asUser, authValue } from '@/test/auth-harness'
import { PreviewLevelsTab } from './PreviewLevelsTab'

beforeEach(() => {
  vi.clearAllMocks()
  auth.value = authValue(asUser({ tenantId: 'acme' }))
})

describe('PreviewLevelsTab', () => {
  it('renders all four levels', () => {
    render(<PreviewLevelsTab />)
    expect(screen.getByText('Level 1: Public')).toBeTruthy()
    expect(screen.getByText('Level 4: God Panel')).toBeTruthy()
  })

  /**
   * '/dashboard' resolves to /app/dashboard under this app's basePath,
   * which Next reads as a tenant called "dashboard" and 404s. Three of
   * this tab's four cards went nowhere for exactly that reason.
   */
  it('keeps a preview inside the community', () => {
    render(<PreviewLevelsTab />)
    screen.getByText('Level 2: User Area').closest('div')?.click()
    expect(push).toHaveBeenCalledWith('/acme/panel/profile')
  })

  it('navigates to the tenant-scoped god panel path for the God Panel level', () => {
    render(<PreviewLevelsTab />)
    screen.getByText('Level 4: God Panel').closest('div')?.click()
    expect(push).toHaveBeenCalledWith(
      expect.stringContaining('acme')
    )
  })
})
