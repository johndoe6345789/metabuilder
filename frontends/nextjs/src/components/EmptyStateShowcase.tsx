'use client'

import React, { useState } from 'react'
import {
  EmptyState,
  NoDataFound,
  NoResultsFound,
  NoItemsYet,
  AccessDeniedState,
  ErrorState,
  NoConnectionState,
  LoadingCompleteState,
} from '@metabuilder/components'

/**
 * EmptyStateShowcase - Demonstrates all empty state variants
 *
 * This component shows all available empty state patterns and their
 * customization options. Useful for:
 * - Development/testing
 * - Design review
 * - Component documentation
 */

interface ShowcaseItem {
  id: string
  name: string
  component: React.ReactNode
}

export function EmptyStateShowcase() {
  const [selectedSize, setSelectedSize] = useState<'compact' | 'normal' | 'large'>('normal')
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // Example handlers
  const handleCreate = () => alert('Create button clicked')
  const handleRetry = () => alert('Retry button clicked')
  const handleAction = () => alert('Action button clicked')

  const items: ShowcaseItem[] = [
    {
      id: 'no-items-yet',
      name: 'No Items Yet',
      component: (
        <NoItemsYet
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Create Item',
            onClick: handleCreate,
          }}
        />
      ),
    },
    {
      id: 'no-data-found',
      name: 'No Data Found',
      component: (
        <NoDataFound
          size={selectedSize}
          animated={animationsEnabled}
        />
      ),
    },
    {
      id: 'no-results-found',
      name: 'No Results Found',
      component: (
        <NoResultsFound
          size={selectedSize}
          animated={animationsEnabled}
        />
      ),
    },
    {
      id: 'access-denied',
      name: 'Access Denied',
      component: (
        <AccessDeniedState
          size={selectedSize}
          animated={animationsEnabled}
        />
      ),
    },
    {
      id: 'error-state',
      name: 'Error State',
      component: (
        <ErrorState
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Retry',
            onClick: handleRetry,
          }}
        />
      ),
    },
    {
      id: 'no-connection',
      name: 'Connection Failed',
      component: (
        <NoConnectionState
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Try Again',
            onClick: handleRetry,
          }}
        />
      ),
    },
    {
      id: 'loading-complete',
      name: 'Operation Complete',
      component: (
        <LoadingCompleteState
          size={selectedSize}
          animated={animationsEnabled}
        />
      ),
    },
    {
      id: 'custom-empty-state',
      name: 'Custom Empty State',
      component: (
        <EmptyState
          icon="🎨"
          title="Custom Configuration"
          description="This is a fully customized empty state with all optional props"
          hint="You can customize the icon, colors, spacing, and more"
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Primary Action',
            onClick: handleAction,
            variant: 'primary',
          }}
          secondaryAction={{
            label: 'Secondary',
            onClick: handleAction,
          }}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        />
      ),
    },
  ]

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#1a1a1a',
          }}
        >
          Empty State Components Showcase
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '20px',
          }}
        >
          Browse all available empty state variants and customize their appearance below.
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '40px',
          border: '1px solid #dee2e6',
        }}
      >
        <h2
          style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '12px',
            color: '#1a1a1a',
          }}
        >
          Configuration
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Size Control */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#495057',
                textTransform: 'uppercase',
              }}
            >
              Size Variant
            </label>
            <select
              value={selectedSize}
              onChange={(e) =>
                setSelectedSize(e.target.value as 'compact' | 'normal' | 'large')
              }
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Animation Control */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#495057',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                style={{
                  marginRight: '8px',
                  cursor: 'pointer',
                }}
              />
              Enable Animations
            </label>
            <p
              style={{
                fontSize: '12px',
                color: '#868e96',
                margin: '4px 0 0 0',
              }}
            >
              Fade-in animations on mount
            </p>
          </div>
        </div>
      </div>

      {/* Showcase Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)'
            }}
          >
            {/* Title */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: '#f8f9fa',
              }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  margin: 0,
                  color: '#1a1a1a',
                }}
              >
                {item.name}
              </h3>
            </div>

            {/* Component */}
            <div
              style={{
                padding: '16px',
                minHeight: selectedSize === 'compact' ? '200px' : selectedSize === 'large' ? '400px' : '300px',
              }}
            >
              {item.component}
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div
        style={{
          backgroundColor: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '8px',
          padding: '16px',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1565c0',
            marginTop: 0,
            marginBottom: '8px',
          }}
        >
          💡 Implementation Tips
        </h3>
        <ul
          style={{
            fontSize: '13px',
            color: '#0d47a1',
            marginBottom: 0,
            paddingLeft: '20px',
          }}
        >
          <li style={{ marginBottom: '6px' }}>
            <strong>Compact size</strong> is best for modals and cards
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Normal size</strong> is the default for most pages
          </li>
          <li style={{ marginBottom: '6px' }}>
            <strong>Large size</strong> works well for full-page empty states
          </li>
          <li style={{ marginBottom: '6px' }}>
            All components support <strong>custom styling</strong> via className or style props
          </li>
          <li>
            Animations respect <strong>prefers-reduced-motion</strong> for accessibility
          </li>
        </ul>
      </div>
    </div>
  )
}

export default EmptyStateShowcase
