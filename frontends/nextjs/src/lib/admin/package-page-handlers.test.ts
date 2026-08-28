import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createPackagePageHandlers } from './package-page-handlers'

const pkg = { id: 'p1', name: 'Forum', status: 'available' }

function deps(over: { confirmed?: boolean } = {}) {
  const showToast = vi.fn()
  const showConfirmation = vi.fn(async (opts: { onConfirm: () => unknown }) => {
    await opts.onConfirm()
    return over.confirmed ?? true
  })

  const packageHandlers = {
    searchPackages: vi.fn(),
    filterByStatus: vi.fn(async () => {}),
    changePage: vi.fn(async () => {}),
    changeLimit: vi.fn(async () => {}),
    refetchPackages: vi.fn(async () => {}),
  }
  const actionHandlers = {
    installPackage: vi.fn(async () => {}),
    uninstallPackage: vi.fn(async () => {}),
    enablePackage: vi.fn(async () => {}),
    disablePackage: vi.fn(async () => {}),
  }
  const detailHandlers = {
    openDetails: vi.fn(async () => {}),
    closeDetails: vi.fn(),
  }

  const built = createPackagePageHandlers({
    usePackages: { state: { packages: [pkg] }, handlers: packageHandlers },
    usePackageActions: { state: {}, handlers: actionHandlers },
    usePackageDetails: { state: {}, handlers: detailHandlers },
    showConfirmation,
    showToast,
  } as never)

  return {
    handlers: built as Record<string, (a?: unknown) => Promise<void>>,
    showToast,
    showConfirmation,
    packageHandlers,
    actionHandlers,
    detailHandlers,
  }
}

const errorToast = (showToast: ReturnType<typeof vi.fn>) =>
  showToast.mock.calls.map(c => c[0]).filter(a => a.type === 'error')

describe('createPackagePageHandlers', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('list controls', () => {
    it('passes a search term straight through', () => {
      const d = deps()
      d.handlers.handleSearch('forum')
      expect(d.packageHandlers.searchPackages).toHaveBeenCalledWith('forum')
    })

    it.each([
      ['handleFilterChange', 'filterByStatus', 'Failed to filter packages'],
      ['handlePageChange', 'changePage', 'Failed to change page'],
      ['handleLimitChange', 'changeLimit', 'Failed to change page size'],
    ])('%s reports a failure as a toast', async (handler, fn, message) => {
      const d = deps()
      ;(d.packageHandlers as never as Record<string, ReturnType<typeof vi.fn>>)[
        fn
      ].mockRejectedValue(new Error('boom'))

      await d.handlers[handler](1)

      expect(errorToast(d.showToast)[0].message).toBe(message)
    })

    it.each([
      ['handleFilterChange', 'filterByStatus'],
      ['handlePageChange', 'changePage'],
      ['handleLimitChange', 'changeLimit'],
    ])('%s says nothing when it succeeds', async (handler, fn) => {
      const d = deps()
      await d.handlers[handler](1)

      expect(
        (d.packageHandlers as never as Record<string, ReturnType<typeof vi.fn>>)[
          fn
        ]
      ).toHaveBeenCalled()
      expect(errorToast(d.showToast)).toHaveLength(0)
    })
  })

  describe('details modal', () => {
    it('opens details for the given package', async () => {
      const d = deps()
      await d.handlers.handleShowDetails('p1')
      expect(d.detailHandlers.openDetails).toHaveBeenCalledWith('p1')
    })

    it('toasts when details cannot be loaded', async () => {
      const d = deps()
      d.detailHandlers.openDetails.mockRejectedValue(new Error('nope'))

      await d.handlers.handleShowDetails('p1')

      expect(errorToast(d.showToast)).toHaveLength(1)
    })

    it('closes without asking anything', () => {
      const d = deps()
      d.handlers.handleCloseModal()
      expect(d.detailHandlers.closeDetails).toHaveBeenCalled()
    })
  })

  const lifecycle: [string, string, string][] = [
    ['handleInstall', 'installPackage', 'Forum installed successfully'],
    ['handleUninstall', 'uninstallPackage', 'Forum uninstalled successfully'],
    ['handleEnable', 'enablePackage', 'Forum enabled'],
    ['handleDisable', 'disablePackage', 'Forum disabled'],
  ]

  describe.each(lifecycle)('%s', (handler, action, success) => {
    it('confirms before acting', async () => {
      const d = deps()
      await d.handlers[handler]('p1')
      expect(d.showConfirmation).toHaveBeenCalled()
    })

    it('performs the action', async () => {
      const d = deps()
      await d.handlers[handler]('p1')
      expect(
        (d.actionHandlers as Record<string, ReturnType<typeof vi.fn>>)[action]
      ).toHaveBeenCalledWith('p1')
    })

    it('refetches the list and reports success', async () => {
      const d = deps()
      await d.handlers[handler]('p1')

      expect(d.packageHandlers.refetchPackages).toHaveBeenCalled()
      expect(
        d.showToast.mock.calls.map(c => c[0]).some(a => a.message === success)
      ).toBe(true)
    })

    it('says nothing more when the user cancels', async () => {
      const d = deps({ confirmed: false })
      await d.handlers[handler]('p1')

      expect(d.packageHandlers.refetchPackages).not.toHaveBeenCalled()
      expect(d.showToast).not.toHaveBeenCalled()
    })

    it('refuses a package that is not in the list', async () => {
      const d = deps()
      await d.handlers[handler]('missing')

      expect(errorToast(d.showToast)[0].message).toBe('Package not found')
      expect(d.showConfirmation).not.toHaveBeenCalled()
    })

    it('toasts when the action itself throws', async () => {
      const d = deps()
      ;(d.actionHandlers as Record<string, ReturnType<typeof vi.fn>>)[
        action
      ].mockRejectedValue(new Error('server said no'))

      await d.handlers[handler]('p1')

      expect(errorToast(d.showToast)).toHaveLength(1)
    })
  })
})
