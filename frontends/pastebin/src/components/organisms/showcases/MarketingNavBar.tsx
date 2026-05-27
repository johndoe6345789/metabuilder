import { Card, Button } from '@metabuilder/components/fakemui'
import styles from './NavigationBarsShowcase.module.scss'

const subtextStyle = {
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--mat-sys-on-surface-variant)',
}
const logoStyle = {
  height: '32px', width: '32px', borderRadius: '8px',
  backgroundColor: 'var(--mat-sys-secondary-container)',
}

export function MarketingNavBar() {
  return (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{
        borderBottom: '1px solid var(--mat-sys-outline-variant)',
        backgroundColor: 'var(--mat-sys-surface-container)',
      }}>
        <div style={{
          padding: '16px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={logoStyle} />
              <h3 style={{
                fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700,
              }}>Product</h3>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="outlined" size="sm">Sign In</Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
        <nav className={styles.scrollableNav}>
          <Button
            variant="ghost"
            size="sm"
            style={{ color: 'var(--mat-sys-secondary-container)' }}
          >
            Features
          </Button>
          <Button variant="ghost" size="sm">Pricing</Button>
          <Button variant="ghost" size="sm">Documentation</Button>
          <Button variant="ghost" size="sm">Blog</Button>
        </nav>
      </div>
      <div style={{ padding: '24px' }}>
        <p style={subtextStyle}>Marketing site navigation with CTAs</p>
      </div>
    </Card>
  )
}
