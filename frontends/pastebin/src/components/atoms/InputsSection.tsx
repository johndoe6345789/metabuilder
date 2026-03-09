import { Input, MaterialIcon } from '@metabuilder/components/fakemui'
import { Card } from '@metabuilder/components/fakemui'
import { Divider } from '@metabuilder/components/fakemui'
import { ComponentShowcase } from '@/components/demo/ComponentShowcase'
import { atomsCodeSnippets } from '@/lib/component-code-snippets'
import { Snippet } from '@/lib/types'

interface InputsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function InputsSection({ onSaveSnippet }: InputsSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="inputs-section" role="region" aria-label="Input form fields">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Inputs</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Form input fields for user data entry
        </p>
      </div>

      <ComponentShowcase
        code={atomsCodeSnippets.inputWithIcon}
        title="Input with Icon"
        description="Input field with icon decoration"
        category="atoms"
        onSaveSnippet={onSaveSnippet}
      >
        <Card className="p-6">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                States
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '448px' }}>
                <Input placeholder="Default input" />
                <Input placeholder="Disabled input" disabled />
                <div style={{ position: 'relative' }}>
                  <MaterialIcon name="search" size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mat-sys-on-surface-variant)' }} aria-hidden="true" />
                  <Input placeholder="Search..." className="pl-10" />
                </div>
              </div>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 500, color: 'var(--mat-sys-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Types
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '448px' }}>
                <Input type="text" placeholder="Text input" />
                <Input type="email" placeholder="email@example.com" />
                <Input type="password" placeholder="Password" />
                <Input type="number" placeholder="123" />
              </div>
            </div>
          </div>
        </Card>
      </ComponentShowcase>
    </section>
  )
}
