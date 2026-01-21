import React from 'react'
import { render, screen } from '@/test-utils'
import { DatabaseStatsCard } from './DatabaseStatsCard'

describe('DatabaseStatsCard', () => {
  const mockFormatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  describe('rendering', () => {
    it('should render card with title', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 5,
            templateCount: 2,
            storageType: 'indexeddb',
            databaseSize: 1024000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Database Statistics')).toBeInTheDocument()
    })

    it('should render card description', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 5,
            templateCount: 2,
            storageType: 'indexeddb',
            databaseSize: 1024000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(
        screen.getByText('Information about your local database storage')
      ).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('should show loading message when loading is true', () => {
      render(
        <DatabaseStatsCard
          loading={true}
          stats={null}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should not show stats when loading', () => {
      render(
        <DatabaseStatsCard
          loading={true}
          stats={null}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.queryByText('Snippets')).not.toBeInTheDocument()
    })
  })

  describe('displaying stats', () => {
    it('should display snippet count', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 2048000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Snippets')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should display template count', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 5,
            storageType: 'indexeddb',
            databaseSize: 2048000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Templates')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should display storage type', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 2048000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Storage Type')).toBeInTheDocument()
      expect(screen.getByText('indexeddb')).toBeInTheDocument()
    })

    it('should display database size', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 1024000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Database Size')).toBeInTheDocument()
    })

    it('should capitalize storage type', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'localstorage',
            databaseSize: 512000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('localstorage')).toBeInTheDocument()
    })

    it('should use formatBytes for database size', () => {
      const customFormatBytes = jest.fn().mockReturnValue('1.23 MB')

      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 1024000
          }}
          formatBytes={customFormatBytes}
        />
      )

      expect(customFormatBytes).toHaveBeenCalledWith(1024000)
      expect(screen.getByText('1.23 MB')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should show error message when stats are null and not loading', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={null}
          formatBytes={mockFormatBytes}
        />
      )

      expect(
        screen.getByText('Failed to load statistics')
      ).toBeInTheDocument()
    })

    it('should display error with destructive color', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={null}
          formatBytes={mockFormatBytes}
        />
      )

      const errorText = screen.getByText('Failed to load statistics')
      expect(errorText).toHaveClass('text-destructive')
    })
  })

  describe('different stats values', () => {
    it('should handle zero counts', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 0,
            templateCount: 0,
            storageType: 'indexeddb',
            databaseSize: 0
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Snippets')).toBeInTheDocument()
      expect(screen.getByText('0 Bytes')).toBeInTheDocument()
    })

    it('should handle large counts', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 99999,
            templateCount: 50000,
            storageType: 'indexeddb',
            databaseSize: 1099511627776
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('99999')).toBeInTheDocument()
      expect(screen.getByText('50000')).toBeInTheDocument()
    })

    it('should handle different storage types', () => {
      const { rerender } = render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 5,
            templateCount: 1,
            storageType: 'indexeddb',
            databaseSize: 1024000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('indexeddb')).toBeInTheDocument()

      rerender(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 5,
            templateCount: 1,
            storageType: 'localstorage',
            databaseSize: 1024000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('localstorage')).toBeInTheDocument()
    })

    it('should handle none storage type', () => {
      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 0,
            templateCount: 0,
            storageType: 'none',
            databaseSize: 0
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('none')).toBeInTheDocument()
    })
  })

  describe('layout and structure', () => {
    it('should display stats in key-value format', () => {
      const { container } = render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 2048000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      const statRows = container.querySelectorAll('[class*="flex justify-between"]')
      expect(statRows.length).toBeGreaterThan(0)
    })

    it('should have borders between stats', () => {
      const { container } = render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 2048000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      const borders = container.querySelectorAll('[class*="border-b"]')
      expect(borders.length).toBeGreaterThan(0)
    })
  })

  describe('state transitions', () => {
    it('should transition from loading to loaded', () => {
      const { rerender } = render(
        <DatabaseStatsCard
          loading={true}
          stats={null}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 2048000
          }}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should transition from loading to error', () => {
      const { rerender } = render(
        <DatabaseStatsCard
          loading={true}
          stats={null}
          formatBytes={mockFormatBytes}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()

      rerender(
        <DatabaseStatsCard
          loading={false}
          stats={null}
          formatBytes={mockFormatBytes}
        />
      )

      expect(
        screen.getByText('Failed to load statistics')
      ).toBeInTheDocument()
    })
  })

  describe('formatBytes integration', () => {
    it('should format bytes correctly for KB', () => {
      const formatBytes = jest.fn((bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
      })

      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 1024 * 10
          }}
          formatBytes={formatBytes}
        />
      )

      expect(formatBytes).toHaveBeenCalledWith(1024 * 10)
    })

    it('should format bytes correctly for MB', () => {
      const formatBytes = jest.fn((bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
      })

      render(
        <DatabaseStatsCard
          loading={false}
          stats={{
            snippetCount: 10,
            templateCount: 3,
            storageType: 'indexeddb',
            databaseSize: 1024 * 1024 * 5
          }}
          formatBytes={formatBytes}
        />
      )

      expect(formatBytes).toHaveBeenCalledWith(1024 * 1024 * 5)
    })
  })
})
