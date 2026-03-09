import { Badge } from '@metabuilder/fakemui/data-display'
import { ShowcaseHeaderCopy } from './types'

interface ShowcaseHeaderProps {
  copy: ShowcaseHeaderCopy
}

export function ShowcaseHeader({ copy }: ShowcaseHeaderProps) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        padding: '1rem 1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{copy.title}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.25rem', marginBottom: 0 }}>
            {copy.description}
          </p>
        </div>
        <Badge style={{ fontFamily: 'monospace' }}>
          {copy.badge}
        </Badge>
      </div>
    </div>
  )
}
