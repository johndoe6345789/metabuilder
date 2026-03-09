import { Card, Button, Chip, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './LandingPageTemplate.module.scss'

export function LandingPageTemplate() {
  return (
    <Card style={{ overflow: 'hidden' }} data-testid="landing-page-template" role="main" aria-label="Landing page template">
      <div style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)', backgroundColor: 'var(--mat-sys-surface-container)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ height: '32px', width: '32px', borderRadius: '8px', backgroundColor: 'var(--mat-sys-secondary-container)' }} />
            <h3 style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 }}>ProductName</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="ghost" size="sm">
              Features
            </Button>
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
            <Button variant="ghost" size="sm">
              About
            </Button>
            <Button size="sm">Sign Up</Button>
          </div>
        </div>
      </div>

      <div style={{ padding: '48px', textAlign: 'center', background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--mat-sys-primary) 20%, transparent), color-mix(in srgb, var(--mat-sys-secondary-container) 20%, transparent))' }}>
        <Chip style={{ marginBottom: '16px' }}>New Release</Chip>
        <h1 style={{ fontSize: '3rem', lineHeight: 1, fontWeight: 700, marginBottom: '24px' }}>
          Build Amazing Products Faster
        </h1>
        <p style={{ fontSize: '1.25rem', lineHeight: '1.75rem', color: 'var(--mat-sys-on-surface-variant)', marginBottom: '32px', maxWidth: '672px', marginInline: 'auto' }}>
          The complete toolkit for modern product development. Ship faster with our
          component library and design system.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <Button size="lg">
            Get Started
            <MaterialIcon name="arrow_forward" style={{ marginLeft: '8px' }} />
          </Button>
          <Button size="lg" variant="outlined">
            View Demo
          </Button>
        </div>
      </div>

      <div style={{ padding: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '16px' }}>Features</h2>
          <p style={{ color: 'var(--mat-sys-on-surface-variant)', maxWidth: '672px', marginInline: 'auto' }}>
            Everything you need to build production-ready applications
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <Card style={{ padding: '24px' }}>
            <div style={{ height: '48px', width: '48px', borderRadius: '8px', backgroundColor: 'color-mix(in srgb, var(--mat-sys-secondary-container) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MaterialIcon name="bar_chart" size={24} style={{ color: 'var(--mat-sys-secondary-container)' }} />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem', marginBottom: '8px' }}>Analytics</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Track and analyze your product metrics in real-time
            </p>
          </Card>

          <Card style={{ padding: '24px' }}>
            <div style={{ height: '48px', width: '48px', borderRadius: '8px', backgroundColor: 'color-mix(in srgb, var(--mat-sys-secondary-container) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MaterialIcon name="group" size={24} style={{ color: 'var(--mat-sys-secondary-container)' }} />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem', marginBottom: '8px' }}>Collaboration</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Work together with your team seamlessly
            </p>
          </Card>

          <Card style={{ padding: '24px' }}>
            <div style={{ height: '48px', width: '48px', borderRadius: '8px', backgroundColor: 'color-mix(in srgb, var(--mat-sys-secondary-container) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MaterialIcon name="settings" size={24} style={{ color: 'var(--mat-sys-secondary-container)' }} />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem', marginBottom: '8px' }}>Customizable</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Adapt the platform to your specific needs
            </p>
          </Card>
        </div>
      </div>

      <div style={{ padding: '48px', textAlign: 'center', background: 'linear-gradient(to bottom right, var(--mat-sys-primary), var(--mat-sys-secondary-container))', color: 'var(--mat-sys-on-primary)' }}>
        <h2 style={{ fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>Ready to get started?</h2>
        <p style={{ fontSize: '1.25rem', lineHeight: '1.75rem', marginBottom: '32px', opacity: 0.9 }}>
          Join thousands of teams already building with our platform
        </p>
        <Button size="lg" variant="secondary">
          Start Free Trial
          <MaterialIcon name="arrow_forward" style={{ marginLeft: '8px' }} />
        </Button>
      </div>
    </Card>
  )
}
