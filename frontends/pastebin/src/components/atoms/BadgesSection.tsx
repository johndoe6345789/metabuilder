import { Chip, MaterialIcon } from '@metabuilder/components/fakemui'
import { Card } from '@metabuilder/components/fakemui'
import { Divider } from '@metabuilder/components/fakemui'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { atomsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface BadgesSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function BadgesSection({ onSaveSnippet }: BadgesSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="badges-section" role="region" aria-label="Badge status indicators">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Badges</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Small status indicators and labels
        </p>
      </div>

      <ComponentShowcase
        code={atomsCodeSnippets.badgeWithIcons}
        title="Badge with Icons"
        description="Badge components with icon combinations"
        category="atoms"
        onSaveSnippet={onSaveSnippet}
      >
        <Card className="p-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Variants
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <Chip>Default</Chip>
                <Chip color="secondary">Secondary</Chip>
                <Chip color="error">Destructive</Chip>
                <Chip variant="outlined">Outline</Chip>
              </div>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                With Icons
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <Chip>
                  <MaterialIcon name="check" style={{ marginRight: '4px' }} />
                  Completed
                </Chip>
                <Chip color="error">
                  <MaterialIcon name="close" style={{ marginRight: '4px' }} />
                  Failed
                </Chip>
                <Chip color="secondary">
                  <MaterialIcon name="star" style={{ marginRight: '4px' }} />
                  Featured
                </Chip>
              </div>
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
