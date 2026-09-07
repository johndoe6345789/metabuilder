import { vi } from 'vitest'

const persistGateMock = vi.hoisted(() => ({
  usePersistGate: vi.fn(() => true),
}))
const reduxProvider = vi.hoisted(() => ({
  Provider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="redux-provider">{children}</div>
  ),
}))
const m3Mock = vi.hoisted(() => ({
  CssBaseline: () => <div data-testid="css-baseline" />,
}))
const errorBoundary = vi.hoisted(() => ({
  RetryableErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))
const themeMock = vi.hoisted(() => ({
  resolveTenantTheme: vi.fn().mockResolvedValue({ light: {}, dark: {} }),
  applyTenantTheme: vi.fn(),
}))

vi.mock('react-redux', () => reduxProvider)
vi.mock('@metabuilder/redux-persist', () => persistGateMock)
vi.mock('@/m3', () => m3Mock)
vi.mock('@/components/RetryableErrorBoundary', () => errorBoundary)
vi.mock('@/components/theme-editor/apply-tenant-theme', () => themeMock)
vi.mock('@/store/store', () => ({ store: {}, persistor: {} }))
// The theme applied is the visited tenant's, so these tests need to be
// somewhere: outside a tenant there is deliberately no branding to apply.
vi.mock('next/navigation', () => ({ usePathname: () => '/acme' }))

export { persistGateMock, m3Mock, themeMock }
