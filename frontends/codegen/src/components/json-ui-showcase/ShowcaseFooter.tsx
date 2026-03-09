import { Fragment } from 'react'
import { Separator } from '@metabuilder/fakemui/data-display'
import { ShowcaseFooterItem } from './types'

interface ShowcaseFooterProps {
  items: ShowcaseFooterItem[]
}

export function ShowcaseFooter({ items }: ShowcaseFooterProps) {
  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
        padding: '0.75rem 1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--muted-foreground)',
        }}
      >
        {items.map((item, index) => (
          <Fragment key={item.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: item.colorClass,
                }}
              />
              <span>{item.label}</span>
            </div>
            {index < items.length - 1 && (
              <Separator orientation="vertical" style={{ height: '1rem' }} />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
