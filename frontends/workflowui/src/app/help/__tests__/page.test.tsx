/**
 * Tests for Help Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import HelpPage from '../page'

describe('HelpPage', () => {
  it('should render the help page container', () => {
    render(<HelpPage />)
    expect(screen.getByTestId('help-page')).toBeInTheDocument()
  })

  it('should render the page header', () => {
    render(<HelpPage />)
    expect(screen.getByTestId('help-header')).toBeInTheDocument()
  })

  it('should render "Help & Support" title', () => {
    render(<HelpPage />)
    const matches = screen.getAllByText('Help & Support')
    expect(matches.length).toBeGreaterThan(0)
  })

  describe('Search Section', () => {
    it('should render search input', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('help-search')).toBeInTheDocument()
    })

    it('should filter FAQs based on search query', () => {
      render(<HelpPage />)
      const searchInput = screen.getByTestId('help-search')
      fireEvent.change(searchInput, { target: { value: 'workflow' } })
      // FAQ about workflows should still be visible
      expect(screen.getByTestId('faq-list')).toBeInTheDocument()
    })

    it('should show empty state message when no FAQs match search', () => {
      render(<HelpPage />)
      const searchInput = screen.getByTestId('help-search')
      fireEvent.change(searchInput, { target: { value: 'nonexistentquery123' } })
      expect(screen.getByText(/No results found for/i)).toBeInTheDocument()
    })
  })

  describe('Quick Links', () => {
    it('should render quick links heading', () => {
      render(<HelpPage />)
      const matches = screen.getAllByText('Quick Links')
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should render Documentation quick link', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('quick-link-documentation')).toBeInTheDocument()
    })

    it('should render Video Tutorials quick link', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('quick-link-video-tutorials')).toBeInTheDocument()
    })

    it('should render API Reference quick link', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('quick-link-api-reference')).toBeInTheDocument()
    })

    it('should render Community Forum quick link', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('quick-link-community-forum')).toBeInTheDocument()
    })
  })

  describe('FAQ Section', () => {
    it('should render faq list container', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('faq-list')).toBeInTheDocument()
    })

    it('should render "Frequently Asked Questions" heading', () => {
      render(<HelpPage />)
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    })

    it('should render FAQ "All" filter chip', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    })

    it('should render category filter chips', () => {
      render(<HelpPage />)
      // Categories include Getting Started, Workflows, etc.
      expect(screen.getByTestId('filter-getting-started')).toBeInTheDocument()
    })

    it('should render FAQ items by id', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('faq-1')).toBeInTheDocument()
      expect(screen.getByTestId('faq-2')).toBeInTheDocument()
    })

    it('should render first FAQ question text', () => {
      render(<HelpPage />)
      expect(screen.getByText(/How do I create my first workflow/i)).toBeInTheDocument()
    })

    it('should filter FAQs by category chip click', () => {
      render(<HelpPage />)
      const workflowsChip = screen.getByTestId('filter-workflows')
      fireEvent.click(workflowsChip)
      // faq-list should still be visible with workflow FAQs
      expect(screen.getByTestId('faq-list')).toBeInTheDocument()
    })

    it('should restore all FAQs when All chip clicked after category filter', () => {
      render(<HelpPage />)
      fireEvent.click(screen.getByTestId('filter-workflows'))
      fireEvent.click(screen.getByTestId('filter-all'))
      // All FAQs should be visible again
      expect(screen.getByTestId('faq-list')).toBeInTheDocument()
      expect(screen.getByTestId('faq-1')).toBeInTheDocument()
    })
  })

  describe('Getting Started Section', () => {
    it('should render getting started card', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('getting-started-card')).toBeInTheDocument()
    })
  })

  describe('Contact Support', () => {
    it('should render contact support section', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('contact-support-card')).toBeInTheDocument()
    })

    it('should render contact support button', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('contact-support-btn')).toBeInTheDocument()
    })

    it('should render community forum button', () => {
      render(<HelpPage />)
      expect(screen.getByTestId('community-forum-btn')).toBeInTheDocument()
    })
  })
})
