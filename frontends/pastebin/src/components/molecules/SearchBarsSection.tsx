import { Card, Button, Input, Divider, MaterialIcon } from '@metabuilder/components/fakemui'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { moleculesCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface SearchBarsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function SearchBarsSection({ onSaveSnippet }: SearchBarsSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="search-bars-section" role="region" aria-label="Search bar components">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Search Bars</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Combined search input with actions
        </p>
      </div>

      <ComponentShowcase
        code={moleculesCodeSnippets.searchBarWithButton}
        title="Search Bar with Button"
        description="Search input combined with action button"
        category="molecules"
        onSaveSnippet={onSaveSnippet}
      >
        <Card className="p-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '448px' }}>
              <MaterialIcon name="search" size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mat-sys-on-surface-variant)' }} aria-hidden="true" />
              <Input placeholder="Search..." className="pl-10" />
            </div>

            <Divider />

            <div style={{ display: 'flex', gap: '8px', maxWidth: '448px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <MaterialIcon name="search" size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mat-sys-on-surface-variant)' }} aria-hidden="true" />
                <Input placeholder="Search..." className="pl-10" />
              </div>
              <Button>Search</Button>
            </div>

            <Divider />

            <div style={{ position: 'relative', maxWidth: '448px' }}>
              <MaterialIcon name="search" size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mat-sys-on-surface-variant)' }} aria-hidden="true" />
              <Input placeholder="Search products, articles, documentation..." className="pl-10 h-12" />
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
