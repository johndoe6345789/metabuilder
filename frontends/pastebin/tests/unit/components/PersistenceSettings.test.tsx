import React from 'react'
import { render, screen } from '@/test-utils'
import { PersistenceSettings } from '@/components/demo/PersistenceSettings'

describe('PersistenceSettings Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<PersistenceSettings />)
      expect(screen.getByTestId('persistence-settings')).toBeInTheDocument()
    })

    it('should display the card title', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('Redux Persistence')).toBeInTheDocument()
    })

    it('should display the description', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText(/Automatic IndexedDB persistence/i)).toBeInTheDocument()
    })

    it('should render an icon in the header', () => {
      const { container } = render(<PersistenceSettings />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Config Stats', () => {
    it('should display Persist Key value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('pastebin')).toBeInTheDocument()
    })

    it('should display Storage Backend value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('IndexedDB')).toBeInTheDocument()
    })

    it('should display Throttle value', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('100ms')).toBeInTheDocument()
    })

    it('should display Persisted Slices count', () => {
      render(<PersistenceSettings />)
      const threeLabels = screen.getAllByText('3')
      expect(threeLabels.length).toBeGreaterThan(0)
    })
  })

  describe('Persisted Slices Section', () => {
    it('should render persisted-slices-section', () => {
      render(<PersistenceSettings />)
      expect(screen.getByTestId('persisted-slices-section')).toBeInTheDocument()
    })

    it('should display all slice badge names', () => {
      render(<PersistenceSettings />)
      expect(screen.getByTestId('slice-badge-snippets')).toBeInTheDocument()
      expect(screen.getByTestId('slice-badge-namespaces')).toBeInTheDocument()
      expect(screen.getByTestId('slice-badge-ui')).toBeInTheDocument()
    })

    it('should display slice names as text', () => {
      render(<PersistenceSettings />)
      expect(screen.getByText('snippets')).toBeInTheDocument()
      expect(screen.getByText('namespaces')).toBeInTheDocument()
      expect(screen.getByText('ui')).toBeInTheDocument()
    })
  })
})
