'use client'

import { useState } from 'react'
import { showcaseItems } from './empty-state-showcase-items'
import { ShowcaseControls } from './empty-state-showcase-controls'
import { ShowcaseGrid } from './showcase-grid'
import { ShowcaseInfoBox } from './showcase-info-box'

/**
 * EmptyStateShowcase - Demonstrates all empty state variants
 *
 * This component shows all available empty state patterns and their
 * customization options. Useful for:
 * - Development/testing
 * - Design review
 * - Component documentation
 */

export function EmptyStateShowcase() {
  const [selectedSize, setSelectedSize] = useState<
    'compact' | 'normal' | 'large'
  >('normal')
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // Example handlers
  const handleCreate = () => {
    alert('Create button clicked')
  }
  const handleRetry = () => {
    alert('Retry button clicked')
  }
  const handleAction = () => {
    alert('Action button clicked')
  }

  const items = showcaseItems({
    size: selectedSize,
    animationsEnabled,
    onCreate: handleCreate,
    onAction: handleAction,
    onRetry: handleRetry,
  })

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
          Browse all available empty state variants and customize their
          appearance below.
        </p>
      </div>

      <ShowcaseControls
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        animationsEnabled={animationsEnabled}
        setAnimationsEnabled={setAnimationsEnabled}
      />
      <ShowcaseGrid items={items} selectedSize={selectedSize} />
      <ShowcaseInfoBox />
    </div>
  )
}

export default EmptyStateShowcase
