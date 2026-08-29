'use client'

/** The grid of variant cards. */

import type { ShowcaseItem } from './showcase-types'

export function ShowcaseGrid({
  items,
  selectedSize,
}: {
  items: ShowcaseItem[]
  selectedSize: 'compact' | 'normal' | 'large'
}) {
  return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {items.map(item => (
          <div
            key={item.id}
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              transition: 'box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)'
            }}
            onMouseLeave={e => {
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
                minHeight:
                  selectedSize === 'compact'
                    ? '200px'
                    : selectedSize === 'large'
                      ? '400px'
                      : '300px',
              }}
            >
              {item.component}
            </div>
          </div>
        ))}
      </div>
  )
}
