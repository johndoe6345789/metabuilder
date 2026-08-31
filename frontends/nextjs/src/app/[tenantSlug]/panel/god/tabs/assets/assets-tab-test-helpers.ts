import { vi } from 'vitest'

export const asset = (over: Record<string, unknown> = {}) => ({
  key: 'logo.png',
  size: 2048,
  ...over,
})

interface AssetsHookMock {
  useAssets: ReturnType<typeof vi.fn>
}

/** Shared across AssetsTab.test.tsx and AssetsTab.actions.test.tsx --
 *  points the mocked `useAssets` hook at a fresh return value. */
export const stub = (
  assetsHook: AssetsHookMock,
  over: Record<string, unknown> = {}
): void => {
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
