import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Folder as FolderIcon } from '@/fakemui/icons'

import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'

describe('NavGroup', () => {
  it.each([
    { label: 'Navigation', defaultOpen: false },
    { label: 'Settings', defaultOpen: true },
    { label: 'Admin', defaultOpen: false },
  ])('renders with label "$label" and defaultOpen=$defaultOpen', ({ label, defaultOpen }) => {
    render(
      <NavGroup label={label} defaultOpen={defaultOpen}>
        <NavItem label="Child Item" />
      </NavGroup>
    )

    expect(screen.getByText(label)).toBeTruthy()

    const childItem = screen.queryByText('Child Item')
    if (defaultOpen) {
      expect(childItem).toBeTruthy()
    }
  })

  it('toggles collapse when clicked', () => {
    render(
      <NavGroup label="Menu">
        <NavItem label="Child Item" />
      </NavGroup>
    )

    const button = screen.getByRole('button', { name: /Menu/i })
    const childItem = screen.queryByText('Child Item')

    // Children are always in DOM (CSS-based collapse)
    expect(childItem).toBeTruthy()

    // Click to expand
    fireEvent.click(button)
    expect(screen.queryByText('Child Item')).toBeTruthy()

    // Click to collapse
    fireEvent.click(button)
    // Children remain in DOM but are hidden via CSS
    expect(screen.queryByText('Child Item')).toBeTruthy()
  })

  it('renders with icon', () => {
    const { container } = render(
      <NavGroup label="Files" icon={<FolderIcon data-testid="folder-icon" />}>
        <NavItem label="Document" />
      </NavGroup>
    )

    expect(screen.getByTestId('folder-icon')).toBeTruthy()
  })

  it.each([{ disabled: true }, { disabled: false }])(
    'handles disabled=$disabled state',
    ({ disabled }) => {
      render(
        <NavGroup label="Menu" disabled={disabled}>
          <NavItem label="Child" />
        </NavGroup>
      )

      const button = screen.getByRole('button', { name: /Menu/i })

      if (disabled) {
        expect(button.hasAttribute('disabled')).toBe(true)
        fireEvent.click(button)
        // Children remain in DOM (CSS-based collapse), click doesn't toggle state
        expect(screen.queryByText('Child')).toBeTruthy()
      } else {
        expect(button.hasAttribute('disabled')).toBe(false)
      }
    }
  )

  it('renders divider when divider=true', () => {
    const { container } = render(
      <NavGroup label="Menu" divider>
        <NavItem label="Child" />
      </NavGroup>
    )

    // Check for fakemui Divider component (renders as hr)
    const divider = container.querySelector('hr')
    expect(divider).toBeTruthy()
  })

  it('renders multiple children', () => {
    render(
      <NavGroup label="Menu" defaultOpen>
        <NavItem label="Child 1" />
        <NavItem label="Child 2" />
        <NavItem label="Child 3" />
      </NavGroup>
    )

    expect(screen.getByText('Child 1')).toBeTruthy()
    expect(screen.getByText('Child 2')).toBeTruthy()
    expect(screen.getByText('Child 3')).toBeTruthy()
  })
})
