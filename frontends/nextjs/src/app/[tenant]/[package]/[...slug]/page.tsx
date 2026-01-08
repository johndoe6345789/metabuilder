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
import { loadEntitySchema } from '@/lib/entities/load-entity-schema'
import { fetchEntityList, fetchEntity } from '@/lib/entities/api-client'

interface EntityPageProps {
  params: Promise<{
    tenant: string
    package: string
    slug: string[]
  }>
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { tenant, package: pkg, slug } = await params

  if (tenant.length === 0 || pkg.length === 0 || slug.length === 0) {
    notFound()
  }

  const entity = slug[0] as string  // Safe: checked slug.length > 0
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
      <header className="entity-header">
        <nav className="breadcrumb">
          <a href={`/${tenant}/${pkg}`}>{pkg}</a>
          {' / '}
          <span>{entity}</span>
          {id !== undefined && id !== 'new' && (
            <>
              {' / '}
              <span>{id}</span>
            </>
          )}
        </nav>
        
        <h1>{schema?.displayName ?? entity}</h1>
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {(schema?.description !== null && schema?.description !== undefined) && <p>{schema.description}</p>}
      </header>

      <main className="entity-content">
        {viewType === 'list' && (
          <EntityListView 
            tenant={tenant} 
            pkg={pkg} 
            entity={entity}
            schema={schema}
          />
        )}
        
        {viewType === 'detail' && id !== undefined && (
          <EntityDetailView 
            tenant={tenant} 
            pkg={pkg} 
            entity={entity} 
            id={id}
            schema={schema}
          />
        )}
        
        {viewType === 'create' && (
          <EntityCreateView 
            tenant={tenant} 
            pkg={pkg} 
            entity={entity}
            schema={schema}
          />
        )}
        
        {viewType === 'edit' && id !== undefined && (
          <EntityEditView 
            tenant={tenant} 
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

import type { EntitySchema } from '@/lib/entities/load-entity-schema'

async function EntityListView({ tenant, pkg, entity, schema }: { 
  tenant: string
  pkg: string
  entity: string
  schema: EntitySchema | null
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}`
  
  // Fetch entity list
  const response = await fetchEntityList(tenant, pkg, entity)
  
  return (
    <div className="entity-list">
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{entity} List</h2>
        <a 
          href={`/${tenant}/${pkg}/${entity}/new`} 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          + New {entity}
        </a>
      </div>
      
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>{apiUrl}</code>
      </p>
      
      {response.error !== undefined ? (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
          Error loading data: {response.error}
        </div>
      ) : (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                {schema?.fields.map(field => (
                  <th key={field.name} style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                    {field.name}
                  </th>
                ))}
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(response.data !== undefined && response.data.length > 0) ? (
                (response.data as Record<string, unknown>[]).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    {schema?.fields.map(field => (
                      <td key={field.name} style={{ padding: '0.75rem' }}>
                        {(() => {
                          const value = item[field.name]
                          if (value === null || value === undefined) return '-'
                          if (typeof value === 'object') return JSON.stringify(value)
                          // eslint-disable-next-line @typescript-eslint/no-base-to-string
                          return String(value)
                        })()}
                      </td>
                    ))}
                    <td style={{ padding: '0.75rem' }}>
                      <a 
                        href={`/${tenant}/${pkg}/${entity}/${String(item[schema?.primaryKey ?? 'id'])}`}
                        style={{ color: '#1976d2', textDecoration: 'none' }}
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={(schema?.fields.length ?? 0) + 1} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No {entity} found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

async function EntityDetailView({ tenant, pkg, entity, id, schema }: { 
  tenant: string
  pkg: string
  entity: string
  id: string
  schema: EntitySchema | null
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}/${id}`
  
  // Fetch entity data
  const response = await fetchEntity(tenant, pkg, entity, id)
  
  return (
    <div className="entity-detail">
      <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{entity} #{id}</h2>
        <div className="actions">
          <a 
            href={`/${tenant}/${pkg}/${entity}/${id}/edit`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Edit
          </a>
        </div>
      </div>
      
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>{apiUrl}</code>
      </p>
      
      {response.error !== undefined ? (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
          Error loading data: {response.error}
        </div>
      ) : (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
          {schema?.fields.map(field => (
            <div key={field.name} style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#424242' }}>
                {field.name}:
              </strong>
              <div style={{ color: '#616161' }}>
                {(() => {
                  const value = (response.data as Record<string, unknown>)[field.name]
                  if (value === null || value === undefined) return '-'
                  if (typeof value === 'object') return JSON.stringify(value)
                  // eslint-disable-next-line @typescript-eslint/no-base-to-string
                  return String(value)
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EntityCreateView({ tenant, pkg, entity, schema }: { 
  tenant: string
  pkg: string
  entity: string
  schema: EntitySchema | null
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}`
  
  return (
    <div className="entity-create">
      <h2 style={{ marginBottom: '1rem' }}>Create {entity}</h2>
      
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>POST {apiUrl}</code>
      </p>
      
      {/* TODO: Implement form with RenderComponent or form library */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Form fields based on schema:
        </p>
        {schema?.fields.map(field => (
          <div key={field.name} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
              {field.name}
              {(field.required === true) && <span style={{ color: '#d32f2f' }}>*</span>}
            </label>
            <input
              type="text"
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              placeholder={(field.description !== null && field.description !== undefined && field.description.length > 0) ? field.description : `Enter ${field.name}`}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
              }}
            />
          </div>
        ))}
        <button
          type="button"
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Create {entity}
        </button>
      </div>
    </div>
  )
}

async function EntityEditView({ tenant, pkg, entity, id, schema }: { 
  tenant: string
  pkg: string
  entity: string
  id: string
  schema: EntitySchema | null
}) {
  const apiUrl = `/api/v1/${tenant}/${pkg}/${entity}/${id}`
  
  // Fetch entity data
  const response = await fetchEntity(tenant, pkg, entity, id)
  
  return (
    <div className="entity-edit">
      <h2 style={{ marginBottom: '1rem' }}>Edit {entity} #{id}</h2>
      
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        API: <code>PUT {apiUrl}</code>
      </p>
      
      {response.error !== undefined ? (
        <div style={{ padding: '1rem', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
          Error loading data: {response.error}
        </div>
      ) : (
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Form fields based on schema with current values:
          </p>
          {schema?.fields.map(field => {
            const value = (response.data as Record<string, unknown>)[field.name]
            return (
              <div key={field.name} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  {field.name}
                  {(field.required === true) && <span style={{ color: '#d32f2f' }}>*</span>}
                </label>
                <input
                  type="text"
                  defaultValue={(() => {
                    if (value === null || value === undefined) return ''
                    if (typeof value === 'object') return JSON.stringify(value)
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    return String(value)
                  })()}
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  placeholder={(field.description !== null && field.description !== undefined && field.description.length > 0) ? field.description : `Enter ${field.name}`}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )
          })}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
            <a
              href={`/${tenant}/${pkg}/${entity}/${id}`}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#f5f5f5',
                color: '#424242',
                textDecoration: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                display: 'inline-block',
              }}
            >
              Cancel
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
export async function generateMetadata({ params }: EntityPageProps) {
  const { tenant, package: pkg, slug } = await params
  const entity = slug[0] ?? 'unknown'
  const id = slug[1]
  
  let title = `${entity} - ${pkg}`
  if (id === 'new') {
    title = `New ${entity} - ${pkg}`
  } else if (id !== undefined) {
    title = `${entity} #${id} - ${pkg}`
  }
  
  return {
    title: `${title} | ${tenant} | MetaBuilder`,
  }
}
