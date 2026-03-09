import { Card, Button, Chip, Avatar } from '@metabuilder/components/fakemui'
import styles from './UserCardsSection.module.scss'

export function UserCardsSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="user-cards-section" role="region" aria-label="User profile card examples">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>User Cards</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Profile information with avatar and actions
        </p>
      </div>

      <div className={styles.userCardsGrid}>
        <Card className="p-6">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Avatar style={{ width: '48px', height: '48px' }} src="https://i.pravatar.cc/150?img=1" alt="Alex Morgan">AM</Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem' }}>Alex Morgan</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>@alexmorgan</p>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', marginTop: '8px' }}>
                Product designer passionate about creating delightful user experiences.
              </p>
            </div>
            <Button size="sm" variant="outlined">
              Follow
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Avatar style={{ width: '64px', height: '64px' }} src="https://i.pravatar.cc/150?img=2" alt="Jordan Davis">JD</Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem' }}>Jordan Davis</h3>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', marginBottom: '8px' }}>Senior Developer</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Chip color="secondary">React</Chip>
                <Chip color="secondary">TypeScript</Chip>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
