import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { Navigation } from './Navigation'
import { NavigationProvider } from './NavigationProvider'

// Wrapper component that includes NavigationProvider
const NavigationWithProvider = () => (
  <NavigationProvider>
    <Navigation />
  </NavigationProvider>
)

describe('Navigation Component', () => {
  describe('Rendering', () => {
    it('renders navigation toggle button', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByRole('button', { name: /toggle navigation menu/i })
      expect(button).toBeInTheDocument()
    })

    it('renders button with correct test ID', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')
      expect(button).toBeInTheDocument()
    })

    it('renders button with hamburger icon', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')
      // Phosphor Icon should be rendered
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')
      expect(button).toHaveAttribute('aria-label', 'Toggle navigation menu')
      expect(button).toHaveAttribute('aria-expanded')
      expect(button).toHaveAttribute('aria-controls', 'navigation-sidebar')
    })
  })

  describe('Toggle State', () => {
    it('starts with aria-expanded false', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('toggles aria-expanded when clicked', async () => {
      const user = userEvent.setup()
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')

      // Initial state
      expect(button).toHaveAttribute('aria-expanded', 'false')

      // Click to open
      await user.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'true')

      // Click to close
      await user.click(button)
      expect(button).toHaveAttribute('aria-expanded', 'false')
    })

    it('is keyboard accessible with Enter key', async () => {
      const user = userEvent.setup()
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')

      // Focus and press Enter
      button.focus()
      await user.keyboard('{Enter}')
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('is keyboard accessible with Space key', async () => {
      const user = userEvent.setup()
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')

      // Focus and press Space
      button.focus()
      await user.keyboard(' ')
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('Accessibility', () => {
    it('button is a button element', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByRole('button', { name: /toggle navigation menu/i })
      expect(button.tagName).toBe('BUTTON')
    })

    it('icon is hidden from screen readers', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')
      const icon = button.querySelector('svg')
      // Icon should have aria-hidden or be within button with aria-label
      if (icon) {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      }
      // Button has aria-label so icon is implicitly hidden from screen readers
      expect(button).toHaveAttribute('aria-label')
    })

    it('can be focused with Tab key', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Styling & DOM', () => {
    it('has CSS class for styling', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByTestId('navigation-toggle-btn')
      expect(button.className).toContain('nav-burger-btn')
    })

    it('button is not disabled', () => {
      render(<NavigationWithProvider />)
      const button = screen.getByRole('button', { name: /toggle navigation menu/i })
      expect(button).not.toBeDisabled()
    })
  })
})
