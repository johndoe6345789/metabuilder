/**
 * Storybook Addon: Styles Panel
 *
 * Displays compiled CSS and V2 schema structure for debugging
 */

import React, { useState, useEffect } from 'react'
import { loadPackageStyles } from './compiler'

interface StylesPanelProps {
  packageId?: string
}

export const StylesPanel: React.FC<StylesPanelProps> = ({ packageId = 'ui_home' }) => {
  const [css, setCSS] = useState<string>('')
  const [schema, setSchema] = useState<any>(null)
  const [view, setView] = useState<'css' | 'schema'>('css')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStyles = async () => {
      setLoading(true)
      try {
        // Load the raw schema
        const response = await fetch(`/packages/${packageId}/seed/styles.json`)
        const schemaData = await response.json()
        setSchema(schemaData)

        // Load compiled CSS
        const compiledCSS = await loadPackageStyles(packageId)
        setCSS(compiledCSS)
      } catch (error) {
        console.error('Failed to load styles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStyles()
  }, [packageId])

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading styles...</div>
  }

  const isV2 = schema && (schema.schema_version || schema.package)

  return (
    <div style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '12px' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          Styles: {packageId}
          <span style={{
            marginLeft: '0.5rem',
            fontSize: '10px',
            padding: '2px 6px',
            background: isV2 ? '#22c55e' : '#f59e0b',
            color: 'white',
            borderRadius: '3px'
          }}>
            {isV2 ? 'V2' : 'V1'}
          </span>
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setView('css')}
            style={{
              padding: '4px 12px',
              background: view === 'css' ? '#3b82f6' : '#e5e7eb',
              color: view === 'css' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Compiled CSS
          </button>
          <button
            onClick={() => setView('schema')}
            style={{
              padding: '4px 12px',
              background: view === 'schema' ? '#3b82f6' : '#e5e7eb',
              color: view === 'schema' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Schema
          </button>
        </div>
      </div>

      {view === 'css' ? (
        <div>
          <div style={{ marginBottom: '0.5rem', fontSize: '11px', color: '#666' }}>
            {css.split('\n').length} lines · {css.length} bytes
          </div>
          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '600px'
          }}>
            {css || '/* No CSS generated */'}
          </pre>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '0.5rem', fontSize: '11px', color: '#666' }}>
            {isV2 ? 'Abstract Styling System' : 'Legacy CSS Format'}
          </div>

          {isV2 && schema && (
            <div style={{ marginBottom: '1rem' }}>
              <SchemaSummary schema={schema} />
            </div>
          )}

          <pre style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '600px'
          }}>
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

const SchemaSummary: React.FC<{ schema: any }> = ({ schema }) => {
  const counts = {
    tokens: Object.keys(schema.tokens?.colors || {}).length,
    selectors: schema.selectors?.length || 0,
    effects: schema.effects?.length || 0,
    appearance: schema.appearance?.length || 0,
    layouts: schema.layouts?.length || 0,
    transitions: schema.transitions?.length || 0,
    rules: schema.rules?.length || 0,
    environments: schema.environments?.length || 0,
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '0.5rem'
    }}>
      {Object.entries(counts).map(([key, count]) => (
        <div
          key={key}
          style={{
            padding: '0.5rem',
            background: count > 0 ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${count > 0 ? '#86efac' : '#fecaca'}`,
            borderRadius: '4px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: count > 0 ? '#16a34a' : '#dc2626' }}>
            {count}
          </div>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>
            {key}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Example story using the Styles Panel
 */
export default {
  title: 'Developer/Styles Viewer',
  component: StylesPanel,
}

export const UIHome = () => <StylesPanel packageId="ui_home" />
export const UIHeader = () => <StylesPanel packageId="ui_header" />
export const UIFooter = () => <StylesPanel packageId="ui_footer" />
export const Shared = () => <StylesPanel packageId="shared" />
