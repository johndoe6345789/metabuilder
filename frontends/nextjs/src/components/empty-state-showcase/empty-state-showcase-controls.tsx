'use client'

/** Size and animation switches for the showcase. */

import { SizeControl } from './showcase-size-control'
import { AnimationControl } from './showcase-animation-control'

export function ShowcaseControls({
  selectedSize,
  setSelectedSize,
  animationsEnabled,
  setAnimationsEnabled,
}: {
  selectedSize: 'compact' | 'normal' | 'large'
  setSelectedSize: (size: 'compact' | 'normal' | 'large') => void
  animationsEnabled: boolean
  setAnimationsEnabled: (on: boolean) => void
}) {
  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '16px',
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
        <SizeControl
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
        />
        <AnimationControl
          animationsEnabled={animationsEnabled}
          setAnimationsEnabled={setAnimationsEnabled}
        />
      </div>
    </div>
  )
}
