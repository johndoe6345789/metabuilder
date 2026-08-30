import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const controller = vi.hoisted(() => ({ useVaultController: vi.fn() }))
vi.mock('./useVaultController', () => controller)

import { VaultTreeRenderer } from './VaultTreeRenderer'
import { vaultView } from './vault-view'

/** Answers any vault.events.* access with a no-op, so the real (large,
 *  declarative) view trees can render without a hand-written stub for
 *  every event they might reference. */
const events = new Proxy(
  {},
  { get: () => () => undefined }
)

describe('VaultTreeRenderer', () => {
  it('renders the locked view when signed out', () => {
    controller.useVaultController.mockReturnValue({
      authLoading: false,
      authenticated: false,
      notice: null,
      masterPassword: '',
      events,
    })
    render(<VaultTreeRenderer />)
    expect(screen.getByText(vaultView.title)).toBeTruthy()
  })

  it('renders the loading label while auth is resolving', () => {
    controller.useVaultController.mockReturnValue({
      authLoading: true,
      authenticated: false,
      notice: null,
      events,
    })
    render(<VaultTreeRenderer />)
    expect(screen.getByText(vaultView.loadingLabel)).toBeTruthy()
  })
})
