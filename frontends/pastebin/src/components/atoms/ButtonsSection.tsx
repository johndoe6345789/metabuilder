import { Card } from '@metabuilder/components/fakemui'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { atomsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'
import { ButtonGroups } from './ButtonGroups'

interface ButtonsSectionProps {
  onSaveSnippet: (
    snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
}

export function ButtonsSection({ onSaveSnippet }: ButtonsSectionProps) {
  return (
    <section
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      data-testid="buttons-section"
      role="region"
      aria-label="Button components"
    >
      <div>
        <h2 style={{
          fontSize: '1.875rem', lineHeight: '2.25rem',
          fontWeight: 700, marginBottom: '8px',
        }}>Buttons</h2>
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
          <ButtonGroups />
        </Card>
      </ComponentShowcase>
    </section>
  )
}
