import {
  Card,
  MaterialIcon,
  Button,
  Avatar,
} from '@metabuilder/components/m3'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { organismsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'
import { MarketingNavBar } from './MarketingNavBar'
import styles from './NavigationBarsShowcase.module.scss'

interface NavigationBarsShowcaseProps {
  onSaveSnippet: (
    snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
  ) => void
}

const surfaceContainer = {
  borderBottom: '1px solid var(--mat-sys-outline-variant)',
  backgroundColor: 'var(--mat-sys-surface-container)',
  padding: '16px',
}
const subtextStyle = {
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--mat-sys-on-surface-variant)',
}
const avatarStyle = { width: '32px', height: '32px' }

export function NavigationBarsShowcase({
  onSaveSnippet,
}: NavigationBarsShowcaseProps) {
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="navigation-bars-showcase"
      role="region"
      aria-label="Navigation bars showcase"
    >
      <div>
        <h2
          style={{
            fontSize: '1.875rem',
            lineHeight: '2.25rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          Navigation Bars
        </h2>
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
          <div style={surfaceContainer}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.25rem',
                    lineHeight: '1.75rem',
                    fontWeight: 700,
                  }}
                >
                  BrandName
                </h3>
                <nav className={styles.desktopNav}>
                  {[
                    { icon: 'home', label: 'Home' },
                    { icon: 'bar_chart', label: 'Analytics' },
                    { icon: 'folder', label: 'Projects' },
                  ].map(({ icon, label }) => (
                    <Button key={label} variant="ghost" size="sm">
                      <MaterialIcon
                        name={icon}
                        style={{ marginRight: '8px' }}
                        aria-hidden="true"
                      />
                      {label}
                    </Button>
                  ))}
                </nav>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Button variant="ghost">
                  <MaterialIcon name="notifications" aria-hidden="true" />
                </Button>
                <Button variant="ghost">
                  <MaterialIcon name="settings" aria-hidden="true" />
                </Button>
                <Avatar
                  className="rounded-full"
                  style={avatarStyle}
                  src="https://i.pravatar.cc/150?img=3"
                  alt="User"
                >
                  U
                </Avatar>
              </div>
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <p style={subtextStyle}>
              Primary navigation with user menu and notifications
            </p>
          </div>
        </Card>
      </ComponentShowcase>

      <MarketingNavBar />
    </section>
  )
}
