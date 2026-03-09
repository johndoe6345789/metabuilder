import { Card, MaterialIcon } from '@metabuilder/components/fakemui'
import { Button } from '@metabuilder/components/fakemui'
import { Avatar } from '@metabuilder/components/fakemui'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { organismsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'
import styles from './NavigationBarsShowcase.module.scss'

interface NavigationBarsShowcaseProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function NavigationBarsShowcase({ onSaveSnippet }: NavigationBarsShowcaseProps) {
  return (
    <section className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="navigation-bars-showcase" role="region" aria-label="Navigation bars showcase">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Navigation Bars</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Complete navigation components with branding and actions
        </p>
      </div>

      <ComponentShowcase
        code={organismsCodeSnippets.navigationBar}
        title="Navigation Bar"
        description="Primary navigation with user menu and notifications"
        category="organisms"
        onSaveSnippet={onSaveSnippet}
      >
        <Card style={{ overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)', backgroundColor: 'var(--mat-sys-surface-container)', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 }}>BrandName</h3>
                <nav className={styles.desktopNav}>
                  <Button variant="ghost" size="sm">
                    <MaterialIcon name="home" style={{ marginRight: '8px' }} aria-hidden="true" />
                    Home
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MaterialIcon name="bar_chart" style={{ marginRight: '8px' }} aria-hidden="true" />
                    Analytics
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MaterialIcon name="folder" style={{ marginRight: '8px' }} aria-hidden="true" />
                    Projects
                  </Button>
                </nav>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="ghost">
                  <MaterialIcon name="notifications" aria-hidden="true" />
                </Button>
                <Button variant="ghost">
                  <MaterialIcon name="settings" aria-hidden="true" />
                </Button>
                <Avatar className="rounded-full" style={{ width: '32px', height: '32px' }} src="https://i.pravatar.cc/150?img=3" alt="User">U</Avatar>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Primary navigation with user menu and notifications
            </p>
          </div>
        </Card>
      </ComponentShowcase>

      <Card style={{ overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)', backgroundColor: 'var(--mat-sys-surface-container)' }}>
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ height: '32px', width: '32px', borderRadius: '8px', backgroundColor: 'var(--mat-sys-secondary-container)' }} />
                <h3 style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 }}>Product</h3>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button variant="outlined" size="sm">
                Sign In
              </Button>
              <Button size="sm">Get Started</Button>
            </div>
          </div>
          <nav className={styles.scrollableNav}>
            <Button variant="ghost" size="sm" style={{ color: 'var(--mat-sys-secondary-container)' }}>
              Features
            </Button>
            <Button variant="ghost" size="sm">
              Pricing
            </Button>
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="ghost" size="sm">
              Blog
            </Button>
          </nav>
        </div>

        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
            Marketing site navigation with CTAs
          </p>
        </div>
      </Card>
    </section>
  )
}
