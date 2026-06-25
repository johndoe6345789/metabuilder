/**
 * UI Home Package Stories
 *
 * Demonstrates components styled with V2 schema
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

// Hero Title Component
const HeroTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h1 className="text hero-title">{children}</h1>
)

// Hero Subtitle Component
const HeroSubtitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text hero-subtitle">{children}</p>
)

// Feature Card Component
const FeatureCard: React.FC<{
  level: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  description: string
}> = ({ level, title, description }) => (
  <div className={`card feature-card feature-card--level${level}`}>
    <div className="box feature-icon">{level}</div>
    <h3 className="text">{title}</h3>
    <p className="text">{description}</p>
  </div>
)

// Hero Section Component
const HeroSection: React.FC = () => (
  <div className="hero-section">
    <HeroTitle>Welcome to MetaBuilder</HeroTitle>
    <HeroSubtitle>
      Build dynamic applications with abstract styling systems, automation scripting, and component composition
    </HeroSubtitle>
  </div>
)

// Features Grid Component
const FeaturesGrid: React.FC = () => (
  <div className="features-section">
    <h2 className="text">Features by Level</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
      <FeatureCard
        level={1}
        title="Home & Basics"
        description="Landing page, navigation, and core UI components"
      />
      <FeatureCard
        level={2}
        title="User Content"
        description="Forums, social features, and user-generated content"
      />
      <FeatureCard
        level={3}
        title="Media & Rich Content"
        description="Media center, streaming, and rich content management"
      />
      <FeatureCard
        level={4}
        title="Administration"
        description="Admin tools, user management, and system configuration"
      />
      <FeatureCard
        level={5}
        title="Development Tools"
        description="Code editor, schema designer, and developer utilities"
      />
      <FeatureCard
        level={6}
        title="Advanced Systems"
        description="Workflow editor, AI integration, and advanced automation"
      />
    </div>
  </div>
)

// Meta configuration
const meta: Meta = {
  title: 'Packages/UI Home',
  parameters: {
    package: 'ui_home',
    layout: 'fullscreen',
  },
}

export default meta

// Stories
type Story = StoryObj

export const HeroTitleExample: Story = {
  render: () => <HeroTitle>Gradient Text Heading</HeroTitle>,
}

export const HeroSubtitleExample: Story = {
  render: () => <HeroSubtitle>This is a subtitle with muted foreground color</HeroSubtitle>,
}

export const SingleFeatureCard: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '300px' }}>
      <FeatureCard
        level={1}
        title="Home & Basics"
        description="Landing page, navigation, and core UI components"
      />
    </div>
  ),
}

export const AllFeatureCards: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
      <FeatureCard level={1} title="Level 1" description="Blue gradient" />
      <FeatureCard level={2} title="Level 2" description="Green gradient" />
      <FeatureCard level={3} title="Level 3" description="Orange gradient" />
      <FeatureCard level={4} title="Level 4" description="Red gradient" />
      <FeatureCard level={5} title="Level 5" description="Purple gradient" />
      <FeatureCard level={6} title="Level 6" description="Gold gradient" />
    </div>
  ),
}

export const HeroSectionExample: Story = {
  render: () => (
    <div style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(74, 58, 199, 0.05) 0%, transparent 50%, rgba(56, 189, 248, 0.05) 100%)' }}>
      <HeroSection />
    </div>
  ),
}

export const FeaturesGridExample: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <FeaturesGrid />
    </div>
  ),
}

export const FullLandingPage: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, rgba(74, 58, 199, 0.05) 0%, transparent 50%, rgba(56, 189, 248, 0.05) 100%)' }}>
      <HeroSection />
      <FeaturesGrid />
    </div>
  ),
}

// Interactive hover test
export const HoverTest: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Hover over the card to see the lift effect (transform: translateY(-2px))
      </p>
      <div style={{ maxWidth: '300px' }}>
        <FeatureCard
          level={3}
          title="Hover Me!"
          description="The border color and transform change on hover thanks to V2 transitions"
        />
      </div>
    </div>
  ),
}
