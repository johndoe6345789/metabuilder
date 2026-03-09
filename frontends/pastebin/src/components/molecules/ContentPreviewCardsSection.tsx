import { Card, MaterialIcon } from '@metabuilder/components/fakemui'
import { Chip } from '@metabuilder/components/fakemui'
import styles from './ContentPreviewCardsSection.module.scss'

export function ContentPreviewCardsSection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="content-preview-cards-section" role="region" aria-label="Content preview card examples">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Content Preview Cards</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Compact cards displaying content with metadata
        </p>
      </div>

      <div className={styles.previewGrid}>
        <Card className={`p-6 ${styles.previewCard}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  Building Scalable Design Systems
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                  Learn how to create and maintain design systems that grow with your team.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MaterialIcon name="calendar_today" size={16} />
                <span>Mar 15, 2024</span>
              </div>
              <span>•</span>
              <span>5 min read</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Chip variant="outlined">Design</Chip>
              <Chip variant="outlined">System</Chip>
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${styles.previewCard}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ fontWeight: 600, fontSize: '1.125rem', lineHeight: '1.75rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  Advanced TypeScript Patterns
                </h3>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                  Explore advanced type system features and practical patterns for production apps.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MaterialIcon name="calendar_today" size={16} />
                <span>Mar 12, 2024</span>
              </div>
              <span>•</span>
              <span>8 min read</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Chip variant="outlined">TypeScript</Chip>
              <Chip variant="outlined">Tutorial</Chip>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
