import React from 'react'
import { render, screen } from '@/test-utils'
import { StorageInfoCard } from './StorageInfoCard'

describe('StorageInfoCard', () => {
  describe('rendering', () => {
    it('should render card with title', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(screen.getByText('Storage Information')).toBeInTheDocument()
    })

    it('should render card description', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(screen.getByText('How your data is stored')).toBeInTheDocument()
    })

    it('should render alert component', () => {
      const { container } = render(<StorageInfoCard storageType="indexeddb" />)

      const alert = container.querySelector('[data-slot="alert"]')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('IndexedDB storage type', () => {
    it('should display IndexedDB message', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(screen.getByText('IndexedDB')).toBeInTheDocument()
    })

    it('should mention better performance and larger storage', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(
        screen.getByText(
          /better performance and larger storage capacity compared to localStorage/i
        )
      ).toBeInTheDocument()
    })

    it('should mention local persistence', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(
        screen.getByText(/Your data persists locally in your browser/i)
      ).toBeInTheDocument()
    })

    it('should not show localStorage message for IndexedDB', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(
        screen.queryByText(/localStorage is being used/i)
      ).not.toBeInTheDocument()
    })

    it('should not show no storage message for IndexedDB', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(
        screen.queryByText(/No persistent storage detected/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('localStorage storage type', () => {
    it('should display localStorage message', () => {
      render(<StorageInfoCard storageType="localstorage" />)

      expect(screen.getByText('localStorage')).toBeInTheDocument()
    })

    it('should mention IndexedDB not available', () => {
      render(<StorageInfoCard storageType="localstorage" />)

      expect(
        screen.getByText(/IndexedDB is not available in your browser/i)
      ).toBeInTheDocument()
    })

    it('should mention smaller storage limit', () => {
      render(<StorageInfoCard storageType="localstorage" />)

      expect(
        screen.getByText(/smaller storage limit \(typically 5-10MB\)/i)
      ).toBeInTheDocument()
    })

    it('should not show IndexedDB message for localStorage', () => {
      render(<StorageInfoCard storageType="localstorage" />)

      expect(
        screen.queryByText(/better performance and larger storage/i)
      ).not.toBeInTheDocument()
    })

    it('should not show no storage message for localStorage', () => {
      render(<StorageInfoCard storageType="localstorage" />)

      expect(
        screen.queryByText(/No persistent storage detected/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('none storage type', () => {
    it('should display no storage message', () => {
      render(<StorageInfoCard storageType="none" />)

      expect(
        screen.getByText(/No persistent storage detected/i)
      ).toBeInTheDocument()
    })

    it('should mention data loss on browser close', () => {
      render(<StorageInfoCard storageType="none" />)

      expect(
        screen.getByText(/Your data will be lost when you close the browser/i)
      ).toBeInTheDocument()
    })

    it('should not show IndexedDB message for none', () => {
      render(<StorageInfoCard storageType="none" />)

      expect(
        screen.queryByText(/better performance and larger storage/i)
      ).not.toBeInTheDocument()
    })

    it('should not show localStorage message for none', () => {
      render(<StorageInfoCard storageType="none" />)

      expect(
        screen.queryByText(/localStorage is being used/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('undefined storage type', () => {
    it('should display no storage message when storageType is undefined', () => {
      render(<StorageInfoCard />)

      expect(
        screen.getByText(/No persistent storage detected/i)
      ).toBeInTheDocument()
    })

    it('should mention data loss when storageType is undefined', () => {
      render(<StorageInfoCard />)

      expect(
        screen.getByText(/Your data will be lost when you close the browser/i)
      ).toBeInTheDocument()
    })
  })

  describe('state transitions', () => {
    it('should transition from no storage to IndexedDB', () => {
      const { rerender } = render(<StorageInfoCard storageType="none" />)

      expect(
        screen.getByText(/No persistent storage detected/i)
      ).toBeInTheDocument()

      rerender(<StorageInfoCard storageType="indexeddb" />)

      expect(screen.getByText('IndexedDB')).toBeInTheDocument()
      expect(
        screen.queryByText(/No persistent storage detected/i)
      ).not.toBeInTheDocument()
    })

    it('should transition from IndexedDB to localStorage', () => {
      const { rerender } = render(<StorageInfoCard storageType="indexeddb" />)

      expect(screen.getByText('IndexedDB')).toBeInTheDocument()

      rerender(<StorageInfoCard storageType="localstorage" />)

      expect(screen.getByText('localStorage')).toBeInTheDocument()
      expect(screen.queryByText('IndexedDB')).not.toBeInTheDocument()
    })

    it('should transition from localStorage to no storage', () => {
      const { rerender } = render(<StorageInfoCard storageType="localstorage" />)

      expect(screen.getByText('localStorage')).toBeInTheDocument()

      rerender(<StorageInfoCard storageType="none" />)

      expect(
        screen.getByText(/No persistent storage detected/i)
      ).toBeInTheDocument()
      expect(screen.queryByText('localStorage')).not.toBeInTheDocument()
    })
  })

  describe('formatting and styling', () => {
    it('should have strong tag for storage type name', () => {
      const { container } = render(<StorageInfoCard storageType="indexeddb" />)

      const strongTag = container.querySelector('strong')
      expect(strongTag).toBeInTheDocument()
      expect(strongTag?.textContent).toBe('IndexedDB')
    })

    it('should wrap message in AlertDescription', () => {
      const { container } = render(<StorageInfoCard storageType="indexeddb" />)

      const alertDescription = container.querySelector('[data-slot="alert-description"]')
      expect(alertDescription).toBeInTheDocument()
    })
  })

  describe('all storage types coverage', () => {
    it('should handle all valid storage types', () => {
      const storageTypes: Array<'indexeddb' | 'localstorage' | 'none'> = [
        'indexeddb',
        'localstorage',
        'none'
      ]

      storageTypes.forEach((type) => {
        const { unmount } = render(<StorageInfoCard storageType={type} />)
        expect(screen.getByText(/Storage Information/)).toBeInTheDocument()
        unmount()
      })
    })

    it('should always render card structure', () => {
      const storageTypes: Array<
        'indexeddb' | 'localstorage' | 'none' | undefined
      > = ['indexeddb', 'localstorage', 'none', undefined]

      storageTypes.forEach((type) => {
        const { unmount } = render(<StorageInfoCard storageType={type} />)
        expect(
          screen.getByText('Storage Information')
        ).toBeInTheDocument()
        expect(
          screen.getByText('How your data is stored')
        ).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle rapid storage type changes', () => {
      const { rerender } = render(<StorageInfoCard storageType="indexeddb" />)

      rerender(<StorageInfoCard storageType="localstorage" />)
      rerender(<StorageInfoCard storageType="none" />)
      rerender(<StorageInfoCard storageType="indexeddb" />)

      expect(screen.getByText('IndexedDB')).toBeInTheDocument()
    })

    it('should maintain card structure through all transitions', () => {
      const { rerender } = render(
        <StorageInfoCard storageType="indexeddb" />
      )

      expect(screen.getByText('Storage Information')).toBeInTheDocument()

      rerender(<StorageInfoCard storageType="localstorage" />)
      expect(screen.getByText('Storage Information')).toBeInTheDocument()

      rerender(<StorageInfoCard storageType="none" />)
      expect(screen.getByText('Storage Information')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be readable by screen readers', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(
        screen.getByText(/Storage Information/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/How your data is stored/i)
      ).toBeInTheDocument()
    })

    it('should have proper semantic structure', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(
        screen.getByText('Storage Information')
      ).toBeInTheDocument()
      expect(
        screen.getByText('How your data is stored')
      ).toBeInTheDocument()
    })
  })

  describe('content completeness', () => {
    it('should always display card title and description', () => {
      render(<StorageInfoCard storageType="indexeddb" />)

      expect(screen.getByText('Storage Information')).toBeInTheDocument()
      expect(
        screen.getByText('How your data is stored')
      ).toBeInTheDocument()
    })

    it('should always display alert message', () => {
      render(<StorageInfoCard storageType="localstorage" />)

      const descriptions = screen.getAllByText(/being used/)
      expect(descriptions.length).toBeGreaterThan(0)
    })
  })
})
