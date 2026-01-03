/**
 * Design System Stories
 *
 * Showcases the complete design system from the shared package
 * All color tokens, typography, spacing, and utilities
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

// Color Swatch Component
const ColorSwatch: React.FC<{
  name: string
  value: string
  category: string
}> = ({ name, value, category }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div
      style={{
        width: '100%',
        height: '80px',
        backgroundColor: `var(--color-${name})`,
        borderRadius: '0.5rem',
        border: '1px solid var(--color-border)',
        marginBottom: '0.5rem'
      }}
    />
    <div style={{ fontSize: '0.875rem' }}>
      <div style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>--color-{name}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{category}</div>
    </div>
  </div>
)

// Typography Sample Component
const TypographySample: React.FC<{
  family: string
  label: string
  text: string
}> = ({ family, label, text }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-muted-foreground)' }}>
      {label}
    </div>
    <div style={{ fontFamily: family, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
      {text}
    </div>
    <div style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: 'var(--color-muted-foreground)' }}>
      {family}
    </div>
  </div>
)

// Radius Sample Component
const RadiusSample: React.FC<{
  name: string
  value: string
}> = ({ name, value }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div
      style={{
        width: '100px',
        height: '100px',
        backgroundColor: 'var(--color-primary)',
        borderRadius: `var(--radius-${name})`,
        marginBottom: '0.5rem'
      }}
    />
    <div style={{ fontSize: '0.875rem' }}>
      <div style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>--radius-{name}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </div>
    </div>
  </div>
)

// All Colors Grid
const AllColorsGrid: React.FC = () => {
  const colors = [
    { name: 'background', value: 'oklch(0.92 0.03 290)', category: 'Base' },
    { name: 'foreground', value: 'oklch(0.25 0.02 260)', category: 'Base' },
    { name: 'card', value: 'oklch(1 0 0)', category: 'Surfaces' },
    { name: 'card-foreground', value: 'oklch(0.25 0.02 260)', category: 'Surfaces' },
    { name: 'popover', value: 'oklch(1 0 0)', category: 'Surfaces' },
    { name: 'popover-foreground', value: 'oklch(0.25 0.02 260)', category: 'Surfaces' },
    { name: 'primary', value: 'oklch(0.55 0.18 290)', category: 'Brand' },
    { name: 'primary-foreground', value: 'oklch(0.98 0 0)', category: 'Brand' },
    { name: 'secondary', value: 'oklch(0.35 0.02 260)', category: 'Brand' },
    { name: 'secondary-foreground', value: 'oklch(0.90 0.01 260)', category: 'Brand' },
    { name: 'muted', value: 'oklch(0.95 0.02 290)', category: 'Neutral' },
    { name: 'muted-foreground', value: 'oklch(0.50 0.02 260)', category: 'Neutral' },
    { name: 'accent', value: 'oklch(0.70 0.17 195)', category: 'Brand' },
    { name: 'accent-foreground', value: 'oklch(0.2 0.02 260)', category: 'Brand' },
    { name: 'destructive', value: 'oklch(0.55 0.22 25)', category: 'Semantic' },
    { name: 'destructive-foreground', value: 'oklch(0.98 0 0)', category: 'Semantic' },
    { name: 'border', value: 'oklch(0.85 0.02 290)', category: 'Neutral' },
    { name: 'input', value: 'oklch(0.85 0.02 290)', category: 'Neutral' },
    { name: 'ring', value: 'oklch(0.70 0.17 195)', category: 'Semantic' },
    { name: 'sidebar', value: 'oklch(0.35 0.02 260)', category: 'Sidebar' },
    { name: 'sidebar-foreground', value: 'oklch(0.90 0.01 260)', category: 'Sidebar' },
    { name: 'sidebar-primary', value: 'oklch(0.55 0.18 290)', category: 'Sidebar' },
    { name: 'sidebar-accent', value: 'oklch(0.40 0.03 260)', category: 'Sidebar' },
    { name: 'sidebar-border', value: 'oklch(0.30 0.02 260)', category: 'Sidebar' },
    { name: 'canvas', value: 'oklch(0.96 0.01 290)', category: 'Surfaces' },
    { name: 'drop-zone-border', value: 'oklch(0.70 0.17 195)', category: 'Interactive' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
      {colors.map((color) => (
        <ColorSwatch key={color.name} {...color} />
      ))}
    </div>
  )
}

// Typography Showcase
const TypographyShowcase: React.FC = () => (
  <div>
    <TypographySample
      family="'IBM Plex Sans', system-ui, -apple-system, sans-serif"
      label="Body Font"
      text="The quick brown fox jumps over the lazy dog"
    />
    <TypographySample
      family="'Space Grotesk', system-ui, -apple-system, sans-serif"
      label="Heading Font"
      text="The quick brown fox jumps over the lazy dog"
    />
    <TypographySample
      family="'JetBrains Mono', 'Courier New', monospace"
      label="Monospace Font"
      text="const hello = 'world';"
    />
  </div>
)

// Border Radius Showcase
const BorderRadiusShowcase: React.FC = () => {
  const radii = [
    { name: 'sm', value: '0.25rem' },
    { name: 'md', value: '0.5rem' },
    { name: 'lg', value: '0.75rem' },
    { name: 'xl', value: '1rem' },
    { name: '2xl', value: '1.5rem' },
    { name: 'full', value: '9999px' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1.5rem' }}>
      {radii.map((radius) => (
        <RadiusSample key={radius.name} {...radius} />
      ))}
    </div>
  )
}

// Utility Classes Demo
const UtilityClassesDemo: React.FC = () => (
  <div style={{ display: 'grid', gap: '2rem' }}>
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Text Gradient</h3>
      <div
        className="text text-gradient"
        style={{
          fontSize: '3rem',
          fontWeight: 700,
          background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent'
        }}
      >
        Gradient Text Effect
      </div>
    </div>

    <div>
      <h3 style={{ marginBottom: '1rem' }}>Glass Effect</h3>
      <div
        className="box glass-effect"
        style={{
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <p style={{ margin: 0, fontWeight: 500 }}>This card has a glassmorphism effect</p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
          With backdrop blur and transparency
        </p>
      </div>
    </div>

    <div>
      <h3 style={{ marginBottom: '1rem' }}>Responsive Container</h3>
      <div
        className="box container-responsive"
        style={{
          width: '100%',
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: '2rem',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.5rem'
        }}
      >
        <p style={{ margin: 0 }}>
          This container is responsive and centered with max-width constraints.
        </p>
      </div>
    </div>
  </div>
)

// Level Theme Colors
const LevelThemeColors: React.FC = () => (
  <div style={{ display: 'grid', gap: '2rem' }}>
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Level 2 - Green Theme</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <div
            style={{
              width: '120px',
              height: '80px',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
            Level 2 Gradient
          </div>
        </div>
        <div>
          <div
            style={{
              width: '120px',
              height: '80px',
              backgroundColor: '#22c55e',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
            #22c55e
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 style={{ marginBottom: '1rem' }}>Level 3 - Orange Theme</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <div
            style={{
              width: '120px',
              height: '80px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
            Level 3 Gradient
          </div>
        </div>
        <div>
          <div
            style={{
              width: '120px',
              height: '80px',
              backgroundColor: '#f97316',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
            #f97316
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 style={{ marginBottom: '1rem' }}>Level 4 - Purple Theme</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <div
            style={{
              width: '120px',
              height: '80px',
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
            Level 4 Gradient
          </div>
        </div>
        <div>
          <div
            style={{
              width: '120px',
              height: '80px',
              backgroundColor: '#a855f7',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}
          />
          <div style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
            #a855f7
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Meta configuration
const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    package: 'shared',
    layout: 'padded',
  },
}

export default meta

// Stories
type Story = StoryObj

export const ColorPalette: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Color System</h2>
      <AllColorsGrid />
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '2rem' }}>Typography</h2>
      <TypographyShowcase />
    </div>
  ),
}

export const BorderRadius: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Border Radius Scale</h2>
      <BorderRadiusShowcase />
    </div>
  ),
}

export const UtilityClasses: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Utility Classes</h2>
      <UtilityClassesDemo />
    </div>
  ),
}

export const LevelThemes: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Level-Specific Themes</h2>
      <LevelThemeColors />
    </div>
  ),
}

export const CompleteShowcase: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>MetaBuilder Design System</h1>
      <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '3rem', fontSize: '1.125rem' }}>
        Complete design tokens from the shared package
      </p>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Color Palette (OKLCH)</h2>
        <AllColorsGrid />
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Typography System</h2>
        <TypographyShowcase />
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Border Radius</h2>
        <BorderRadiusShowcase />
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>Level Themes</h2>
        <LevelThemeColors />
      </section>

      <section>
        <h2 style={{ marginBottom: '2rem' }}>Utility Effects</h2>
        <UtilityClassesDemo />
      </section>
    </div>
  ),
}
