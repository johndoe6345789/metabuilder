import { ReactNode } from 'react'
import { PageCard } from './CardComponents'
import { GridSection } from './StatGrid'
import { LegacyPageSchema, PageSectionConfig } from './types'

interface PageSectionRendererProps {
  index: number
  section: PageSectionConfig
  pageSchema: LegacyPageSchema
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}

export function PageSectionRenderer({
  index,
  section,
  pageSchema,
  data,
  functions,
}: PageSectionRendererProps): ReactNode {
  switch (section.type) {
    case 'header':
      return (
        <HeaderSection
          key={index}
          title={section.title}
          description={section.description}
        />
      )

    case 'cards':
      return (
        <CardSection
          key={index}
          cards={
            pageSchema[section.items as string] || []
          }
          spacing={section.spacing}
          data={data}
          functions={functions}
        />
      )

    case 'grid':
      return (
        <GridSection
          key={index}
          items={
            pageSchema[section.items as string] || []
          }
          columns={section.columns}
          gap={section.gap}
          data={data}
        />
      )

    default:
      return null
  }
}

// ── Header ────────────────────────────────────────────────

function HeaderSection({
  title,
  description,
}: {
  title?: string
  description?: string
}) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <h1 style={{
        marginBottom: '0.25rem',
        fontSize: '1.875rem',
        fontWeight: 700,
      }}>
        {title}
      </h1>
      {description && (
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--muted-foreground)',
        }}>
          {description}
        </p>
      )}
    </div>
  )
}

// ── Card Section ──────────────────────────────────────────

function CardSection({
  cards,
  data,
  functions,
}: {
  cards: any[]
  spacing?: string
  data: Record<string, any>
  functions: Record<string, (...args: any[]) => any>
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns:
        'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '1.25rem',
    }}>
      {cards.map((card) => (
        <PageCard
          key={card.id}
          card={card}
          data={data}
          functions={functions}
        />
      ))}
    </div>
  )
}
