/**
 * Entity Page
 *
 * Handles /{tenantSlug}/{package}/{entity}/[...args]
 *
 * Examples:
 *   /acme/forum_forge/posts           -> List posts
 *   /acme/forum_forge/posts/123       -> View post 123
 *   /acme/forum_forge/posts/new       -> Create new post
 *   /acme/forum_forge/posts/123/edit  -> Edit post 123
 */

export { generateMetadata } from './metadata'
import { EntityPageHeader } from './EntityPageHeader'
import { tenantPageFallback } from './tenant-page-fallback'
import type { EntityPageProps } from './entity-page-props'
import { EntityListView } from './views/EntityListView'
import { EntityDetailView } from './views/EntityDetailView'
import { EntityCreateView } from './views/EntityCreateView'
import { EntityEditView } from './views/EntityEditView'
import { notFound } from 'next/navigation'
import { loadEntitySchema } from '@/lib/entities/load-entity-schema'



export default async function EntityPage({ params }: EntityPageProps) {
  const { tenantSlug, package: pkg, slug } = await params

  if (tenantSlug.length === 0 || pkg.length === 0 || slug.length === 0) {
    notFound()
  }

  const dbPage = await tenantPageFallback(tenantSlug, pkg, slug)
  if (dbPage !== null) return dbPage

  const [entity] = slug
  if (entity === undefined) notFound()
  const id = slug[1]
  const action = slug[2]

  // Load entity schema
  const schema = await loadEntitySchema(pkg, entity)

  // Determine what view to render
  let viewType: 'list' | 'detail' | 'create' | 'edit' = 'list'

  if (id === 'new') {
    viewType = 'create'
  } else if (id !== undefined && action === 'edit') {
    viewType = 'edit'
  } else if (id !== undefined) {
    viewType = 'detail'
  }

  return (
    <div className="entity-page">
      <EntityPageHeader
        tenantSlug={tenantSlug}
        pkg={pkg}
        entity={entity}
        id={id}
        schema={schema}
      />

      <main className="entity-content">
        {viewType === 'list' && (
          <EntityListView
            tenant={tenantSlug}
            pkg={pkg}
            entity={entity}
            schema={schema}
          />
        )}

        {viewType === 'detail' && id !== undefined && (
          <EntityDetailView
            tenant={tenantSlug}
            pkg={pkg}
            entity={entity}
            id={id}
            schema={schema}
          />
        )}

        {viewType === 'create' && (
          <EntityCreateView
            tenant={tenantSlug}
            pkg={pkg}
            entity={entity}
            schema={schema}
          />
        )}

        {viewType === 'edit' && id !== undefined && (
          <EntityEditView
            tenant={tenantSlug}
            pkg={pkg}
            entity={entity}
            id={id}
            schema={schema}
          />
        )}
      </main>
    </div>
  )
}

// Entity view components using schema-driven rendering





