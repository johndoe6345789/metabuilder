import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadPackage = vi.hoisted(() => ({
  loadInstalledPackage: vi.fn(),
}))
const resolveConfig = vi.hoisted(() => ({
  resolveActionConfig: vi.fn(),
}))
const notFound = vi.hoisted(() => ({
  notFoundResult: vi.fn(() => ({ success: false, error: 'not found' })),
}))
const tenantId = vi.hoisted(() => ({
  resolveTenantId: vi.fn(() => 'system'),
}))

vi.mock('./package-action/load-package', () => loadPackage)
vi.mock('./package-action/resolve-action-config', () => resolveConfig)
vi.mock('./package-action/not-found-result', () => notFound)
vi.mock('./resolve-tenant-id', () => tenantId)

import { executePackageAction } from './execute-package-action'

beforeEach(() => {
  vi.clearAllMocks()
  notFound.notFoundResult.mockReturnValue({ success: false, error: 'not found' })
  tenantId.resolveTenantId.mockReturnValue('system')
})

describe('executePackageAction', () => {
  it('reports not-found when the package is missing or disabled', async () => {
    loadPackage.loadInstalledPackage.mockResolvedValue(null)

    const result = await executePackageAction('blog', 'Post', 'publish', '1')

    expect(notFound.notFoundResult).toHaveBeenCalledWith(
      expect.stringContaining('blog'),
      undefined
    )
    expect(result.success).toBe(false)
  })

  it('passes allowFallback through to notFoundResult', async () => {
    loadPackage.loadInstalledPackage.mockResolvedValue(null)

    await executePackageAction('blog', 'Post', 'publish', '1', undefined, {
      allowFallback: true,
    })

    expect(notFound.notFoundResult).toHaveBeenCalledWith(
      expect.anything(),
      true
    )
  })

  it('reports INVALID_CONFIG when resolveActionConfig flags an error', async () => {
    loadPackage.loadInstalledPackage.mockResolvedValue({ id: 'blog' })
    resolveConfig.resolveActionConfig.mockReturnValue({
      invalidConfigError: 'bad shape',
    })

    const result = await executePackageAction('blog', 'Post', 'publish', '1')

    expect(result).toEqual({
      success: false,
      error: 'bad shape',
      code: 'INVALID_CONFIG',
    })
  })

  it('reports not-found when the action is not registered', async () => {
    loadPackage.loadInstalledPackage.mockResolvedValue({ id: 'blog' })
    resolveConfig.resolveActionConfig.mockReturnValue({})

    const result = await executePackageAction('blog', 'Post', 'ghost', '1')

    expect(notFound.notFoundResult).toHaveBeenCalledWith(
      expect.stringContaining('Post.ghost'),
      undefined
    )
    expect(result.success).toBe(false)
  })

  it('succeeds with the action, id, packageId and resolved tenant', async () => {
    loadPackage.loadInstalledPackage.mockResolvedValue({ id: 'blog' })
    resolveConfig.resolveActionConfig.mockReturnValue({ config: {} })
    tenantId.resolveTenantId.mockReturnValue('acme')

    const result = await executePackageAction('blog', 'Post', 'publish', '42')

    expect(result).toEqual({
      success: true,
      data: {
        action: 'Post.publish',
        entityId: '42',
        packageId: 'blog',
        tenantId: 'acme',
      },
    })
  })

  it('reports a failure result when loading the package throws', async () => {
    loadPackage.loadInstalledPackage.mockRejectedValue(new Error('DB down'))

    const result = await executePackageAction('blog', 'Post', 'publish', '1')

    expect(result).toEqual({ success: false, error: 'DB down' })
  })

  it('reports a generic message for a non-Error rejection', async () => {
    class NotAnError {}
    loadPackage.loadInstalledPackage.mockRejectedValue(new NotAnError())

    const result = await executePackageAction('blog', 'Post', 'publish', '1')

    expect(result).toEqual({ success: false, error: 'Action failed' })
  })
})
