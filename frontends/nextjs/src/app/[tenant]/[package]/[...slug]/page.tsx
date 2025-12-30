/**
 * Entity Page
 * 
 * Handles /{tenant}/{package}/{entity}/[...args]
 * 
 * Examples:
 *   /acme/forum_forge/posts           -> List posts
 *   /acme/forum_forge/posts/123       -> View post 123
 *   /acme/forum_forge/posts/new       -> Create new post
 *   /acme/forum_forge/posts/123/edit  -> Edit post 123
 */

import { notFound } from 'next/navigation'

interface EntityPageProps {
  params: Promise<{
    tenant: string
    package: string
    slug: string[]
  }>
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { tenant, package: pkg, slug } = await params

  if (!slug || slug.length === 0) {
    notFound()
  }

  const entity = slug[0]
  const id = slug[1]
  const action = slug[2]

  // Determine what view to render
  let viewType: 'list' | 'detail' | 'create' | 'edit' = 'list'
  
  if (id === 'new') {
    viewType = 'create'
  } else if (id && action === 'edit') {
    viewType = 'edit'
  } else if (id) {
    viewType = 'detail'
  }

  return (
    <div className="entity-page">
      <header className="entity-header">
        <nav className="breadcrumb">
          <a href={`/${tenant}/${pkg}`}>{pkg}</a>
          {' / '}
          <span>{entity}</span>
          {id && id !== 'new' && (
            <>
              {' / '}
              <span>{id}</span>
            </>
          )}
        </nav>
        
        <h1>{entity}</h1>
      </header>

      <main className="entity-content">
        {viewType === 'list' && (
          <EntityListView 
            tenant={tenant} 
            pkg={pkg} 
            entity={entity} 
          />
        )}
        
        {viewType === 'detail' && (
          <EntityDetailView 
            tenant={tenant} 
            pkg={pkg} 
            entity={entity} 
            id={id!}
          />
        )}
        
        {viewType === 'create' && (
          <EntityCreateView 
            tenant={tenant} 
            pkg={pkg} 
            entity={entity} 
          />
        )}
        
        {viewType === 'edit' && (
          <EntityEditView 
            tenant={tenant} 
            pkg={pkg} 
            entity={entity} 
            id={id!}
          />
        )}
      </main>
    </div>
  )
}

// Placeholder components - these would be replaced with actual implementations
// that use RenderComponent with package-defined schemas

function EntityListView({ tenant, pkg, entity }: { 
  tenant: string
  pkg: string
  entity: string 
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}`
  
  return (
    <div className="entity-list">
      <div className="list-header">
        <h2>{entity} List</h2>
        <a href={`/${tenant}/${pkg}/${entity}/new`} className="btn-create">
          + New {entity}
        </a>
      </div>
      
      <p>API: <code>{apiUrl}</code></p>
      
      {/* TODO: Fetch and render list using RenderComponent */}
      <div className="placeholder">
        Entity list will be rendered here using package schema
      </div>
    </div>
  )
}

function EntityDetailView({ tenant, pkg, entity, id }: { 
  tenant: string
  pkg: string
  entity: string
  id: string
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}/${id}`
  
  return (
    <div className="entity-detail">
      <div className="detail-header">
        <h2>{entity} #{id}</h2>
        <div className="actions">
          <a href={`/${tenant}/${pkg}/${entity}/${id}/edit`} className="btn-edit">
            Edit
          </a>
        </div>
      </div>
      
      <p>API: <code>{apiUrl}</code></p>
      
      {/* TODO: Fetch and render detail using RenderComponent */}
      <div className="placeholder">
        Entity detail will be rendered here using package schema
      </div>
    </div>
  )
}

function EntityCreateView({ tenant, pkg, entity }: { 
  tenant: string
  pkg: string
  entity: string
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}`
  
  return (
    <div className="entity-create">
      <h2>Create {entity}</h2>
      
      <p>API: <code>POST {apiUrl}</code></p>
      
      {/* TODO: Render create form using RenderComponent */}
      <div className="placeholder">
        Entity create form will be rendered here using package schema
      </div>
    </div>
  )
}

function EntityEditView({ tenant, pkg, entity, id }: { 
  tenant: string
  pkg: string
  entity: string
  id: string
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}/${id}`
  
  return (
    <div className="entity-edit">
      <h2>Edit {entity} #{id}</h2>
      
      <p>API: <code>PUT {apiUrl}</code></p>
      
      {/* TODO: Fetch and render edit form using RenderComponent */}
      <div className="placeholder">
        Entity edit form will be rendered here using package schema
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: EntityPageProps) {
  const { tenant, package: pkg, slug } = await params
  const entity = slug?.[0] || 'unknown'
  const id = slug?.[1]
  
  let title = `${entity} - ${pkg}`
  if (id === 'new') {
    title = `New ${entity} - ${pkg}`
  } else if (id) {
    title = `${entity} #${id} - ${pkg}`
  }
  
  return {
    title: `${title} | ${tenant} | MetaBuilder`,
  }
}
