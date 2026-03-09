import { Card } from '@metabuilder/components/fakemui'
import { Divider } from '@metabuilder/components/fakemui'

export function TypographySection() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} data-testid="typography-section" role="region" aria-label="Typography styles">
      <div>
        <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginBottom: '8px' }}>Typography</h2>
        <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
          Text styles and hierarchical type scale
        </p>
      </div>

      <Card className="p-6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h1 style={{ fontSize: '3rem', lineHeight: '1', fontWeight: 700, marginBottom: '8px' }}>Heading 1</h1>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Bricolage Grotesque Bold / 48px
            </p>
          </div>
          <Divider />
          <div>
            <h2 style={{ fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: 600, marginBottom: '8px' }}>Heading 2</h2>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Bricolage Grotesque Semibold / 36px
            </p>
          </div>
          <Divider />
          <div>
            <h3 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 600, marginBottom: '8px' }}>Heading 3</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Bricolage Grotesque Semibold / 30px
            </p>
          </div>
          <Divider />
          <div>
            <h4 style={{ fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 500, marginBottom: '8px' }}>Heading 4</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
              Bricolage Grotesque Medium / 24px
            </p>
          </div>
          <Divider />
          <div>
            <p style={{ fontSize: '1rem', lineHeight: '1.5rem', marginBottom: '8px' }}>
              Body text - The quick brown fox jumps over the lazy dog. This is
              regular body text used for paragraphs and general content.
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>Inter Regular / 16px</p>
          </div>
          <Divider />
          <div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', marginBottom: '8px' }}>
              Small text - Additional information, captions, and secondary content.
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>Inter Regular / 14px</p>
          </div>
          <Divider />
          <div>
            <code style={{ fontSize: '0.875rem', lineHeight: '1.25rem', backgroundColor: 'var(--mat-sys-surface-variant)', paddingInline: '8px', paddingBlock: '4px', borderRadius: '8px' }}>
              const example = &quot;code text&quot;;
            </code>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', marginTop: '8px' }}>
              JetBrains Mono Regular / 14px
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
