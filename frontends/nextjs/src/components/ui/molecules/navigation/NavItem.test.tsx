import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NavItem } from './NavItem'
import HomeIcon from '@mui/icons-material/Home'

describe('NavItem', () => {
  it.each([
    { label: 'Home', icon: <HomeIcon />, active: false },
    { label: 'Dashboard', icon: <HomeIcon />, active: true },
    { label: 'Settings', icon: undefined, active: false },
  ])('renders with label "$label", icon presence, active=$active', ({ label, icon, active }) => {
    render(<NavItem label={label} icon={icon} active={active} />)
    
    expect(screen.getByText(label)).toBeTruthy()
    
    const button = screen.getByRole('button')
    if (active) {
      expect(button.classList.contains('Mui-selected')).toBe(true)
    }
  })

  it.each([
    { badge: 5, badgeColor: 'primary' as const },
    { badge: '99+', badgeColor: 'error' as const },
    { badge: undefined, badgeColor: 'default' as const },
  ])('displays badge=$badge with badgeColor=$badgeColor', ({ badge, badgeColor }) => {
    render(<NavItem label="Messages" icon={<HomeIcon />} badge={badge} badgeColor={badgeColor} />)
    
    if (badge !== undefined) {
      expect(screen.getByText(badge.toString())).toBeTruthy()
    }
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<NavItem label="Home" onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalled()
  })

  it.each([
    { disabled: true, shouldBeDisabled: true },
    { disabled: false, shouldBeDisabled: false },
  ])('handles disabled=$disabled state', ({ disabled, shouldBeDisabled }) => {
    render(<NavItem label="Home" disabled={disabled} />)
    
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-disabled')).toBe(shouldBeDisabled ? 'true' : null)
  })

  it('renders with secondary label', () => {
    render(<NavItem label="Home" secondaryLabel="Main page" />)
    
    expect(screen.getByText('Home')).toBeTruthy()
    expect(screen.getByText('Main page')).toBeTruthy()
  })

  it('renders with href for navigation', () => {
    render(<NavItem label="Home" href="/home" />)
    
    // When href is provided, MUI renders it as a link, not a button
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/home')
  })
})
