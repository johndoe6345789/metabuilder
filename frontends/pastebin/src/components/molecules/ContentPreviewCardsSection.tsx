import { Card, MaterialIcon, Chip } from '@metabuilder/components/m3'
import styles from './ContentPreviewCardsSection.module.scss'

const metaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  color: 'var(--mat-sys-on-surface-variant)',
}

const titleStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '1.125rem',
  lineHeight: '1.75rem',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}

const CARDS = [
  {
    title: 'Building Scalable Design Systems',
    desc:
      'Learn how to create and maintain design systems ' +
      'that grow with your team.',
    date: 'Mar 15, 2024',
    readTime: '5 min read',
    tags: ['Design', 'System'],
  },
  {
    title: 'Advanced TypeScript Patterns',
    desc:
      'Explore advanced type system features and practical ' +
      'patterns for production apps.',
    date: 'Mar 12, 2024',
    readTime: '8 min read',
    tags: ['TypeScript', 'Tutorial'],
  },
] as const

export function ContentPreviewCardsSection() {
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="content-preview-cards-section"
      role="region"
      aria-label="Content preview card examples"
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
          Content Preview Cards
        </h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Compact cards displaying content with metadata
        </p>
      </div>

      <div className={styles.previewGrid}>
        {CARDS.map(({ title, desc, date, readTime, tags }) => (
          <Card key={title} className={`p-6 ${styles.previewCard}`}>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <h3 style={titleStyle}>{title}</h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: '1.25rem',
                      color: 'var(--mat-sys-on-surface-variant)',
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
              <div style={metaStyle}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <MaterialIcon name="calendar_today" size={16} />
                  <span>{date}</span>
                </div>
                <span>•</span>
                <span>{readTime}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {tags.map(tag => (
                  <Chip key={tag} variant="outlined">
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
