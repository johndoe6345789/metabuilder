import React from 'react'
import { render, screen } from '@testing-library/react'
import { PersistenceSettings } from './PersistenceSettings'
import '@testing-library/jest-dom'

describe('PersistenceSettings', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('renders Card component', () => {
      const { container } = render(<PersistenceSettings />)
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
    })

    it('renders card title', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('renders card description mentioning redux-persist', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText(/redux-persist/)).toBeInTheDocument()
    })
  })

  describe('Card Header', () => {
    it('renders header with icon', () => {
      const { container } = render(<PersistenceSettings />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('icon container has proper styling', () => {
      const { container } = render(<PersistenceSettings />)
      const iconContainer = container.querySelector('[class*="h-10"]')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Persist Config Section', () => {
    it('displays persist key', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('pastebin')).toBeInTheDocument()
    })

    it('displays storage backend', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('IndexedDB')).toBeInTheDocument()
    })

    it('displays throttle value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
    })

    it('displays persisted slices count', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  describe('Persisted Slices Section', () => {
    it('renders persisted slices section', () => {
      render(<PersistenceSettings />)
      expect(screen.getAllByText('Persisted Slices').length).toBeGreaterThan(0)
    })

    it('renders all slice badges', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('snippets')).toBeInTheDocument()
      expect(screen.getByText('namespaces')).toBeInTheDocument()
      expect(screen.getByText('ui')).toBeInTheDocument()
    })

    it('slice badges have monospace font', () => {
      render(<PersistenceSettings />)
      const snippetsBadge = screen.getByText('snippets')
      expect(snippetsBadge).toHaveClass('font-mono')
    })
  })

  describe('Layout Structure', () => {
    it('has proper overall spacing', () => {
      const { container } = render(<PersistenceSettings />)
      const content = container.querySelector('[class*="space-y-6"]')
      expect(content).toBeInTheDocument()
    })

    it('has section separator', () => {
      const { container } = render(<PersistenceSettings />)
      const separators = container.querySelectorAll('[class*="border-t"]')
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('all text content is readable', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
      expect(screen.getByText('Persist Key')).toBeInTheDocument()
      expect(screen.getByText('Storage Backend')).toBeInTheDocument()
    })

    it('persisted slices section has aria label', () => {
      render(<PersistenceSettings />)
      expect(screen.getByRole('region', { name: 'Persisted slices' })).toBeInTheDocument()
    })
  })

  describe('Client Component', () => {
    it('component renders on client side', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })
  })
})
