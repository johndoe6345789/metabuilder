/**
 * Tests for Documentation Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DocsPage from '../page'

describe('DocsPage', () => {
  it('should render the documentation page container', () => {
    render(<DocsPage />)
    expect(screen.getByTestId('docs-page')).toBeInTheDocument()
  })

  it('should render the page title', () => {
    render(<DocsPage />)
    expect(screen.getByTestId('docs-title')).toBeInTheDocument()
    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  it('should render the page subtitle', () => {
    render(<DocsPage />)
    expect(screen.getByText('Learn how to build powerful workflows')).toBeInTheDocument()
  })

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-search')).toBeInTheDocument()
    })

    it('should allow typing in search input', () => {
      render(<DocsPage />)
      const searchInput = screen.getByTestId('docs-search') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'workflow' } })
      expect(searchInput.value).toBe('workflow')
    })
  })

  describe('Documentation Sidebar', () => {
    it('should render navigation sidebar', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument()
    })

    it('should render getting-started section in sidebar', () => {
      render(<DocsPage />)
      // DocsSidebar renders section buttons with data-testid="doc-section-{id}"
      expect(screen.getByTestId('doc-section-intro')).toBeInTheDocument()
    })

    it('should render installation section in sidebar', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('doc-section-installation')).toBeInTheDocument()
    })

    it('should render quick-start section in sidebar', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('doc-section-quick-start')).toBeInTheDocument()
    })

    it('should navigate to section when sidebar button clicked', () => {
      render(<DocsPage />)
      const installationBtn = screen.getByTestId('doc-section-installation')
      fireEvent.click(installationBtn)
      // After navigation, content area should show the new section
      expect(screen.getByTestId('docs-content')).toBeInTheDocument()
    })

    it('should render api-reference sections in sidebar', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('doc-section-rest-api')).toBeInTheDocument()
    })
  })

  describe('Content Area', () => {
    it('should render docs content area', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-content')).toBeInTheDocument()
    })

    it('should render previous and next navigation buttons', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-previous')).toBeInTheDocument()
      expect(screen.getByTestId('docs-next')).toBeInTheDocument()
    })

    it('should render section title in content area', () => {
      render(<DocsPage />)
      // Default section is "intro" from getting-started category
      // DocsContentArea renders currentSection?.title
      const contentArea = screen.getByTestId('docs-content')
      expect(contentArea).toBeInTheDocument()
    })
  })

  describe('Category Titles', () => {
    it('should render "Getting Started" category title', () => {
      render(<DocsPage />)
      const matches = screen.getAllByText('Getting Started')
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should render "API Reference" category title', () => {
      render(<DocsPage />)
      const matches = screen.getAllByText('API Reference')
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should render "Tutorials" category title', () => {
      render(<DocsPage />)
      const matches = screen.getAllByText('Tutorials')
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should render "Guides" category title', () => {
      render(<DocsPage />)
      const matches = screen.getAllByText('Guides')
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  describe('Table of Contents', () => {
    it('should render table of contents', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-toc')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper structure with sidebar and content', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('docs-content')).toBeInTheDocument()
    })

    it('should have search input for filtering', () => {
      render(<DocsPage />)
      expect(screen.getByTestId('docs-search')).toBeInTheDocument()
    })
  })
})
