import { Button, IconButton, MaterialIcon } from '@metabuilder/components/fakemui'
import { Card } from '@metabuilder/components/fakemui'
import { Divider } from '@metabuilder/components/fakemui'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { atomsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface ButtonsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ButtonsSection({ onSaveSnippet }: ButtonsSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="buttons-section" role="region" aria-label="Button components">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Buttons</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Interactive controls with multiple variants and states
        </p>
      </div>

      <ComponentShowcase
        code={atomsCodeSnippets.buttonWithIcons}
        title="Button with Icons"
        description="Buttons with icon and text combinations"
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
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Destructive</Button>
                <Button variant="outlined">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="text">Link</Button>
              </div>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sizes
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <IconButton aria-label="Heart">
                  <MaterialIcon name="favorite" aria-hidden="true" />
                </IconButton>
              </div>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                With Icons
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <Button>
                  <MaterialIcon name="star" aria-hidden="true" />
                  Favorite
                </Button>
                <Button variant="outlined">
                  <MaterialIcon name="add" aria-hidden="true" />
                  Add Item
                </Button>
                <Button variant="secondary">
                  <MaterialIcon name="bolt" aria-hidden="true" />
                  Quick Action
                </Button>
              </div>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                States
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <Button disabled>Disabled</Button>
                <Button variant="outlined" disabled>
                  Disabled Outline
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
