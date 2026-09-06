import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const store = vi.hoisted(() => ({
  css: [] as { id: string; name: string; props: Record<string, string> }[],
  dirty: false,
  dispatch: vi.fn(),
}))

// The tenant guard has its own tests; here the draft is this tenant's.
vi.mock('../use-god-tenant', () => ({
  useGodTenant: () => ({ tenant: 'acme', known: true, foreign: false }),
}))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => store.dispatch,
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ god: { css: store.css, dirty: { css: store.dirty } } }),
}))
vi.mock('@/store/slices/god-slice', () => ({
  setCss: (p: unknown) => ({ type: 'setCss', payload: p }),
  clearDirty: (p: unknown) => ({ type: 'clearDirty', payload: p }),
}))
vi.mock('@/lib/tenant/style-classes', async importOriginal => ({
  ...(await importOriginal<object>()),
  loadStyleClasses: vi.fn(async () => []),
  saveStyleClasses: vi.fn(async () => true),
}))

import { CssClassesTab } from './CssClassesTab'

describe('CssClassesTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.css = []
    store.dirty = false
  })

  it('prompts to name a style when there are none yet', () => {
    render(<CssClassesTab />)
    expect(screen.getByText(/Name a style above to start/)).toBeTruthy()
  })

  it('adds a class and selects it', () => {
    render(<CssClassesTab />)
    fireEvent.change(screen.getByLabelText('New style'), {
      target: { value: 'Big Heading' },
    })
    fireEvent.click(screen.getByText('+'))
    const persisted = store.dispatch.mock.calls
      .map(c => c[0])
      .find(a => a.type === 'setCss')
    expect(persisted.payload[0].name).toBe('big-heading')
  })

  it('shows the selected class in the editor', () => {
    store.css = [{ id: 'c1', name: 'card', props: { color: 'red' } }]
    render(<CssClassesTab />)
    expect(screen.getByDisplayValue('card')).toBeTruthy()
  })

  it('shows the published state', () => {
    store.dirty = false
    render(<CssClassesTab />)
    expect(screen.getByText('Published — up to date')).toBeTruthy()
  })

  it('shows the staged-changes state when dirty', () => {
    store.dirty = true
    render(<CssClassesTab />)
    expect(screen.getByText('Staged changes — not yet published')).toBeTruthy()
  })
})
