import { Card, Button } from '@metabuilder/components/m3'
import {
  LandingHeroSection,
  LandingFeaturesSection,
  LandingCtaSection,
} from './LandingPageSections'

const navbarStyle = {
  borderBottom: '1px solid var(--mat-sys-outline-variant)',
  backgroundColor: 'var(--mat-sys-surface-container)',
  padding: '16px',
}
const logoStyle = {
  height: '32px',
  width: '32px',
  borderRadius: '8px',
  backgroundColor: 'var(--mat-sys-secondary-container)',
}

export function LandingPageTemplate() {
  return (
    <Card
      style={{ overflow: 'hidden' }}
      data-testid="landing-page-template"
      role="main"
      aria-label="Landing page template"
    >
      <div style={navbarStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={logoStyle} />
            <h3
              style={{
                fontSize: '1.25rem',
                lineHeight: '1.75rem',
                fontWeight: 700,
              }}
            >
              ProductName
            </h3>
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

      <LandingHeroSection />
      <LandingFeaturesSection />
      <LandingCtaSection />
    </Card>
  )
}
