import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'
import FolderIcon from '@mui/icons-material/Folder'

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
    let childItem = screen.queryByText('Child Item')
    
    // Initially collapsed - item should not be visible
    expect(childItem).toBeNull()
    
    // Click to expand
    fireEvent.click(button)
    childItem = screen.queryByText('Child Item')
    expect(childItem).toBeTruthy()
    
    // Click to collapse
    fireEvent.click(button)
    // After collapsing, wait for animation and check
    setTimeout(() => {
      childItem = screen.queryByText('Child Item')
      expect(childItem).toBeNull()
    }, 500)
  })

  it('renders with icon', () => {
    const { container } = render(
      <NavGroup label="Files" icon={<FolderIcon data-testid="folder-icon" />}>
        <NavItem label="Document" />
      </NavGroup>
    )
    
    expect(screen.getByTestId('folder-icon')).toBeTruthy()
  })

  it.each([
    { disabled: true },
    { disabled: false },
  ])('handles disabled=$disabled state', ({ disabled }) => {
    render(
      <NavGroup label="Menu" disabled={disabled}>
        <NavItem label="Child" />
      </NavGroup>
    )
    
    const button = screen.getByRole('button', { name: /Menu/i })
    
    if (disabled) {
      expect(button.getAttribute('aria-disabled')).toBe('true')
      fireEvent.click(button)
      // Should not expand when disabled
      expect(screen.queryByText('Child')).toBeNull()
    } else {
      expect(button.getAttribute('aria-disabled')).toBe(null)
    }
  })

  it('renders divider when divider=true', () => {
    const { container } = render(
      <NavGroup label="Menu" divider>
        <NavItem label="Child" />
      </NavGroup>
    )
    
    // Check for MUI Divider component
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
