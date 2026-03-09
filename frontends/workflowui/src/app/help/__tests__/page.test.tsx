/**
 * Note: FakeMUI components, icons, and styles are mocked via Jest config

Tests for Help Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import HelpPage from '../page'





describe('HelpPage', () => {
  it('should render the help page', () => {
    render(<HelpPage />)
    expect(screen.getByTestId('help-page')).toBeInTheDocument()
  })

  it('should render the page header', () => {
    render(<HelpPage />)
    expect(screen.getByTestId('help-header')).toBeInTheDocument()
    expect(screen.getByText('Help & Support')).toBeInTheDocument()
  })

  describe('Search Section', () => {
    it('should render search input', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('help-search')).toBeInTheDocument()
    })

    it('should filter FAQs based on search query', () => {
      render(<HelpPage />)

      const searchInput = screen.getByTestId('help-search') as HTMLInputElement

      // Initially, all FAQs should be visible
      expect(screen.getByText(/How do I create my first workflow/i)).toBeInTheDocument()
      expect(screen.getByText(/What programming languages are supported/i)).toBeInTheDocument()

      // Search for 'workflow'
      fireEvent.change(searchInput, { target: { value: 'workflow' } })

      // FAQ about workflows should be visible
      expect(screen.getByText(/How do I create my first workflow/i)).toBeInTheDocument()
    })

    it('should show message when no FAQs match search', () => {
      render(<HelpPage />)

      const searchInput = screen.getByTestId('help-search') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'nonexistentquery123' } })

      expect(screen.getByText(/No help articles found/i)).toBeInTheDocument()
    })
  })

  describe('Quick Links', () => {
    it('should render quick links section', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('quick-links')).toBeInTheDocument()
    })

    it('should render all quick link cards', () => {
      render(<HelpPage />)

      expect(screen.getByTestId('quick-link-getting-started')).toBeInTheDocument()
      expect(screen.getByTestId('quick-link-workflows')).toBeInTheDocument()
      expect(screen.getByTestId('quick-link-api')).toBeInTheDocument()
    })

    it('should have correct links in quick links', () => {
      render(<HelpPage />)

      const gettingStartedLink = screen.getByTestId('quick-link-getting-started-btn')
      expect(gettingStartedLink).toHaveTextContent('View Guide')
    })
  })

  describe('FAQ Section', () => {
    it('should render FAQ section', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('faq-section')).toBeInTheDocument()
    })

    it('should render FAQ category chips', () => {
      render(<HelpPage />)

      expect(screen.getByTestId('category-chip-all')).toBeInTheDocument()
      expect(screen.getByTestId('category-chip-Getting Started')).toBeInTheDocument()
      expect(screen.getByTestId('category-chip-Workflows')).toBeInTheDocument()
    })

    it('should filter FAQs by category', () => {
      render(<HelpPage />)

      const workflowsChip = screen.getByTestId('category-chip-Workflows')
      fireEvent.click(workflowsChip)

      // Should show workflow-related FAQs
      expect(screen.getByText(/What programming languages are supported/i)).toBeInTheDocument()
    })

    it('should show all FAQs when "All" category is selected', () => {
      render(<HelpPage />)

      // First filter to specific category
      const workflowsChip = screen.getByTestId('category-chip-Workflows')
      fireEvent.click(workflowsChip)

      // Then click All
      const allChip = screen.getByTestId('category-chip-all')
      fireEvent.click(allChip)

      // All FAQs should be visible again
      expect(screen.getByText(/How do I create my first workflow/i)).toBeInTheDocument()
      expect(screen.getByText(/Can I share workflows with my team/i)).toBeInTheDocument()
    })

    it('should render FAQ items', () => {
      render(<HelpPage />)

      expect(screen.getByTestId('faq-1')).toBeInTheDocument()
      expect(screen.getByTestId('faq-2')).toBeInTheDocument()
      expect(screen.getByTestId('faq-3')).toBeInTheDocument()
    })
  })

  describe('Contact Support', () => {
    it('should render contact support section', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('contact-support')).toBeInTheDocument()
    })

    it('should render contact button', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('contact-support-btn')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper test IDs for all interactive elements', () => {
      render(<HelpPage />)

      expect(screen.getByTestId('help-page')).toBeInTheDocument()
      expect(screen.getByTestId('help-search')).toBeInTheDocument()
      expect(screen.getByTestId('quick-links')).toBeInTheDocument()
      expect(screen.getByTestId('faq-section')).toBeInTheDocument()
    })
  })
})
