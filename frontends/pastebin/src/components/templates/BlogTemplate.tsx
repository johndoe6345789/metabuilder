import { Card, Button, Chip, Avatar, Divider, MaterialIcon } from '@metabuilder/components/fakemui'

export function BlogTemplate() {
  return (
    <Card style={{ overflow: 'hidden' }} data-testid="blog-template" role="main" aria-label="Blog template">
      <div style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)', backgroundColor: 'var(--mat-sys-surface-container)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 }}>Blog</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="ghost" size="sm">
              Articles
            </Button>
            <Button variant="ghost" size="sm">
              Tutorials
            </Button>
            <Button variant="ghost" size="sm">
              About
            </Button>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '896px', marginInline: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Chip>Design</Chip>
              <Chip color="secondary">Tutorial</Chip>
            </div>
            <h1 style={{ fontSize: '3rem', lineHeight: 1, fontWeight: 700 }}>
              Building a Comprehensive Component Library
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar style={{ width: '48px', height: '48px' }} src="https://i.pravatar.cc/150?img=5" alt="Alex Writer">AW</Avatar>
              <div>
                <p style={{ fontWeight: 500 }}>Alex Writer</p>
                <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)' }}>
                  March 15, 2024 · 10 min read
                </p>
              </div>
            </div>
          </div>

          <Divider style={{ marginBlock: '32px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ aspectRatio: '16 / 9', borderRadius: '12px', background: 'linear-gradient(to bottom right, var(--mat-sys-primary), var(--mat-sys-secondary-container))' }} />

            <p style={{ fontSize: '1.125rem', lineHeight: 1.625, color: 'var(--mat-sys-on-surface-variant)' }}>
              Design systems have become an essential part of modern product development.
              They provide consistency, improve efficiency, and create a shared language
              between designers and developers.
            </p>

            <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginTop: '48px', marginBottom: '16px' }}>
              Understanding Atomic Design
            </h2>
            <p style={{ color: 'var(--mat-sys-on-surface-variant)', lineHeight: 1.625 }}>
              The atomic design methodology consists of five distinct stages: atoms,
              molecules, organisms, templates, and pages. Each stage builds upon the
              previous, creating a comprehensive system that scales with your needs.
            </p>

            <Card style={{ padding: '24px', marginBlock: '32px', backgroundColor: 'color-mix(in srgb, var(--mat-sys-surface-variant) 50%, transparent)' }}>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--mat-sys-on-surface-variant)', fontStyle: 'italic' }}>
                "A design system is never complete. It's a living, breathing ecosystem
                that evolves with your product and team."
              </p>
            </Card>

            <h2 style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700, marginTop: '48px', marginBottom: '16px' }}>Getting Started</h2>
            <p style={{ color: 'var(--mat-sys-on-surface-variant)', lineHeight: 1.625 }}>
              Begin by identifying the core components your product needs. Start small
              with basic atoms like buttons and inputs, then gradually build up to more
              complex organisms and templates.
            </p>
          </div>

          <Divider style={{ marginBlock: '48px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button variant="outlined">
              Previous Article
            </Button>
            <Button>
              Next Article
              <MaterialIcon name="arrow_forward" style={{ marginLeft: '8px' }} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
