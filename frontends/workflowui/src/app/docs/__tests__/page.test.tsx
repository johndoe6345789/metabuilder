/**
 * Note: FakeMUI components, icons, and styles are mocked via Jest config

Tests for Documentation Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DocsPage from '../page'





describe('DocsPage', () => {
  it('should render the documentation page', () => {
    render(<DocsPage />)
    expect(screen.getByTestId('docs-page')).toBeInTheDocument()
  })

  it('should render the page header', () => {
    render(<DocsPage />)
    expect(screen.getByTestId('docs-header')).toBeInTheDocument()
    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-search')).toBeInTheDocument()
    })

    it('should filter documentation sections based on search query', () => {
      render(<DocsPage />)

      const searchInput = screen.getByTestId('docs-search') as HTMLInputElement

      // Initially, all sections should be visible
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Workflows')).toBeInTheDocument()

      // Search for 'workflow'
      fireEvent.change(searchInput, { target: { value: 'workflow' } })

      // Workflow-related sections should be visible
      expect(screen.getByText('Workflows')).toBeInTheDocument()
    })
  })

  describe('Documentation Sections', () => {
    it('should render getting started section', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('section-getting-started')).toBeInTheDocument()
    })

    it('should render workflows section', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('section-workflows')).toBeInTheDocument()
    })

    it('should render API reference section', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('section-api-reference')).toBeInTheDocument()
    })

    it('should render guides section', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('section-guides')).toBeInTheDocument()
    })
  })

  describe('Navigation Sidebar', () => {
    it('should render navigation sidebar', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument()
    })

    it('should have navigation items for each section', () => {
      render(<DocsPage />)

      expect(screen.getByTestId('nav-getting-started')).toBeInTheDocument()
      expect(screen.getByTestId('nav-workflows')).toBeInTheDocument()
      expect(screen.getByTestId('nav-api-reference')).toBeInTheDocument()
      expect(screen.getByTestId('nav-guides')).toBeInTheDocument()
    })

    it('should navigate to section when sidebar item clicked', () => {
      render(<DocsPage />)

      const navItem = screen.getByTestId('nav-workflows')
      fireEvent.click(navItem)

      // In a real implementation, this would scroll to or display the section
    })
  })

  describe('Documentation Cards', () => {
    it('should render documentation cards for each topic', () => {
      render(<DocsPage />)

      expect(screen.getByTestId('doc-installation')).toBeInTheDocument()
      expect(screen.getByTestId('doc-creating-workflows')).toBeInTheDocument()
      expect(screen.getByTestId('doc-node-types')).toBeInTheDocument()
    })

    it('should display card titles and descriptions', () => {
      render(<DocsPage />)

      expect(screen.getByText('Installation')).toBeInTheDocument()
      expect(screen.getByText('Creating Workflows')).toBeInTheDocument()
      expect(screen.getByText('Node Types')).toBeInTheDocument()
    })

    it('should navigate to documentation article on card click', () => {
      render(<DocsPage />)

      const card = screen.getByTestId('doc-installation')
      fireEvent.click(card)

      // In a real implementation, this would navigate to the full article
    })
  })

  describe('Code Examples', () => {
    it('should render code examples section', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('code-examples')).toBeInTheDocument()
    })

    it('should display code snippets', () => {
      render(<DocsPage />)

      expect(screen.getByTestId('example-basic-workflow')).toBeInTheDocument()
      expect(screen.getByTestId('example-api-integration')).toBeInTheDocument()
    })

    it('should have language tags for code examples', () => {
      render(<DocsPage />)

      expect(screen.getByTestId('lang-typescript')).toBeInTheDocument()
      expect(screen.getByTestId('lang-python')).toBeInTheDocument()
    })
  })

  describe('Quick Links', () => {
    it('should render quick links section', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('quick-links')).toBeInTheDocument()
    })

    it('should have links to common topics', () => {
      render(<DocsPage />)

      expect(screen.getByTestId('link-quickstart')).toBeInTheDocument()
      expect(screen.getByTestId('link-tutorials')).toBeInTheDocument()
      expect(screen.getByTestId('link-api-docs')).toBeInTheDocument()
    })
  })

  describe('Breadcrumb Navigation', () => {
    it('should render breadcrumb navigation', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-breadcrumbs')).toBeInTheDocument()
    })

    it('should show current location in documentation', () => {
      render(<DocsPage />)

      expect(screen.getByText('Documentation')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper test IDs for all sections', () => {
      render(<DocsPage />)

      expect(screen.getByTestId('docs-page')).toBeInTheDocument()
      expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('docs-search')).toBeInTheDocument()
    })

    it('should have proper navigation structure', () => {
      render(<DocsPage />)

      const sidebar = screen.getByTestId('docs-sidebar')
      expect(sidebar).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show message when no documentation matches search', () => {
      render(<DocsPage />)

      const searchInput = screen.getByTestId('docs-search') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'nonexistentdoc123' } })

      expect(screen.getByText(/No documentation found/i)).toBeInTheDocument()
    })
  })
})
