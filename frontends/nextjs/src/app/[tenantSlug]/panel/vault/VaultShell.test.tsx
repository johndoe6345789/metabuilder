import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('./VaultTreeRenderer', () => ({
  VaultTreeRenderer: () => (
    <div data-testid="vault-tree-renderer">Vault Tree Renderer</div>
  ),
}))

import { VaultShell } from './VaultShell'

describe('VaultShell', () => {
  it('renders the VaultTreeRenderer', () => {
    render(<VaultShell />)
    expect(screen.getByTestId('vault-tree-renderer')).toBeTruthy()
  })
})
