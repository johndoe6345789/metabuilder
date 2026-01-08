/**
 * UI Level 4 Package Stories
 *
 * God-Tier Builder - Application design and development interface
 * Purple theme with schema editor, workflow designer, and code editor
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

// Tab Badge Component
const TabBadge: React.FC<{ count: number }> = ({ count }) => (
  <span
    className="badge tab-badge"
    style={{
      marginLeft: '0.5rem',
      padding: '0.125rem 0.5rem',
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-secondary-foreground)',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: 600
    }}
  >
    {count}
  </span>
)

// Config Summary Component
const ConfigSummary: React.FC<{
  schemas: number
  fields: number
  workflows: number
  nodes: number
  scripts: number
}> = ({ schemas, fields, workflows, nodes, scripts }) => (
  <div
    className="box config-summary"
    style={{
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'linear-gradient(90deg, rgba(74, 58, 199, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)',
      border: '2px dashed rgba(74, 58, 199, 0.3)',
      borderRadius: '0.5rem'
    }}
  >
    <h3 style={{ fontWeight: 600, marginTop: 0, marginBottom: '1rem' }}>Configuration Summary</h3>
    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-muted-foreground)' }}>Data Models:</span>
        <span style={{ fontWeight: 500 }}>{schemas}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-muted-foreground)' }}>Total Fields:</span>
        <span style={{ fontWeight: 500 }}>{fields}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-muted-foreground)' }}>Workflows:</span>
        <span style={{ fontWeight: 500 }}>{workflows}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-muted-foreground)' }}>Workflow Nodes:</span>
        <span style={{ fontWeight: 500 }}>{nodes}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--color-muted-foreground)' }}>Scripts:</span>
        <span style={{ fontWeight: 500 }}>{scripts}</span>
      </div>
    </div>
  </div>
)

// Preview Button Component
const PreviewButton: React.FC<{ level: number }> = ({ level }) => (
  <button
    className="button preview-button"
    style={{
      padding: '0.5rem 1rem',
      backgroundColor: 'transparent',
      border: '1px solid var(--color-border)',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 200ms ease-in-out',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
  >
    👁️ Preview L{level}
  </button>
)

// Schema Card Component
const SchemaCard: React.FC<{
  name: string
  label: string
  fieldCount: number
  isSelected?: boolean
  onSelect?: () => void
  onDelete?: () => void
}> = ({ name, label, fieldCount, isSelected, onSelect, onDelete }) => (
  <div
    onClick={onSelect}
    style={{
      padding: '0.75rem',
      border: '1px solid var(--color-border)',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
      color: isSelected ? 'var(--color-accent-foreground)' : 'var(--color-foreground)',
      transition: 'all 200ms ease-in-out',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}
  >
    <div>
      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label || name}</div>
      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{fieldCount} fields</div>
    </div>
    {onDelete && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        style={{
          padding: '0.25rem 0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        🗑️
      </button>
    )}
  </div>
)

// Builder Navigation
const BuilderNav: React.FC = () => (
  <nav
    className="nav builder-nav"
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--color-sidebar)',
      borderBottom: '1px solid var(--color-sidebar-border)',
      padding: '1rem 2rem'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            className="box builder-logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-sidebar-foreground)' }}>
            God-Tier Builder
          </span>
        </div>
        <a href="#" style={{ color: 'var(--color-sidebar-foreground)', textDecoration: 'none', fontSize: '0.875rem' }}>
          🏠 Home
        </a>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'none', gap: '0.5rem' }}>
          <PreviewButton level={1} />
          <PreviewButton level={2} />
          <PreviewButton level={3} />
        </div>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            color: 'var(--color-sidebar-foreground)',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ⬇️
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: '0.375rem',
            color: 'var(--color-sidebar-foreground)',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ⬆️
        </button>
        <span
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-secondary-foreground)',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          god_user
        </span>
      </div>
    </div>
  </nav>
)

// Schema Editor Component
const SchemaEditor: React.FC = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', height: '600px' }}>
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Models</h3>
        <button
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-foreground)',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            minHeight: '36px',
            transition: 'all 200ms ease-in-out',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          ➕
        </button>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-foreground)', marginBottom: '1rem' }}>
        Data model definitions
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SchemaCard name="User" label="User" fieldCount={5} isSelected />
        <SchemaCard name="Post" label="Post" fieldCount={8} />
        <SchemaCard name="Comment" label="Comment" fieldCount={4} />
      </div>
    </div>

    <div
      style={{
        padding: '1.5rem',
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem'
      }}
    >
      <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>Edit Model: User</h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            Model Name
          </label>
          <input
            type="text"
            value="User"
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--color-input)',
              borderRadius: '0.375rem',
              fontFamily: 'inherit'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            Label
          </label>
          <input
            type="text"
            value="User"
            readOnly
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid var(--color-input)',
              borderRadius: '0.375rem',
              fontFamily: 'inherit'
            }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Fields</label>
            <button
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-foreground)',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 200ms ease-in-out',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              Add Field
            </button>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-muted)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              color: 'var(--color-muted-foreground)'
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>• username (string, required)</div>
            <div style={{ marginBottom: '0.5rem' }}>• email (string, required)</div>
            <div style={{ marginBottom: '0.5rem' }}>• bio (text, optional)</div>
            <div style={{ marginBottom: '0.5rem' }}>• role (string, required)</div>
            <div>• createdAt (datetime, required)</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Builder Workspace
const BuilderWorkspace: React.FC = () => (
  <section
    className="section builder-workspace"
    style={{
      padding: '2rem',
      maxWidth: '1536px',
      backgroundColor: 'var(--color-canvas)'
    }}
  >
    <h2 className="text builder-title" style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.875rem' }}>
      Application Builder
    </h2>
    <p className="text builder-subtitle" style={{ color: 'var(--color-muted-foreground)', marginBottom: '2rem' }}>
      Design your application declaratively. Define schemas, create workflows, and write scripts.
    </p>

    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem', backgroundColor: 'var(--color-muted)', borderRadius: '0.5rem' }}>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-background)',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🗄️ Data Schemas
          <TabBadge count={3} />
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ⚡ Workflows
          <TabBadge count={5} />
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          💻 Scripts
          <TabBadge count={12} />
        </button>
      </div>
    </div>

    <SchemaEditor />

    <ConfigSummary schemas={3} fields={17} workflows={5} nodes={23} scripts={12} />
  </section>
)

// Meta configuration
const meta: Meta = {
  title: 'Packages/UI Level 4',
  parameters: {
    package: 'ui_level4',
    layout: 'fullscreen',
  },
}

export default meta

// Stories
type Story = StoryObj

export const Navigation: Story = {
  render: () => <BuilderNav />,
}

export const PreviewButtons: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'flex', gap: '0.5rem' }}>
      <PreviewButton level={1} />
      <PreviewButton level={2} />
      <PreviewButton level={3} />
    </div>
  ),
}

export const ConfigurationSummary: Story = {
  render: () => (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <ConfigSummary schemas={3} fields={17} workflows={5} nodes={23} scripts={12} />
    </div>
  ),
}

export const SchemaEditorPanel: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <SchemaEditor />
    </div>
  ),
}

export const FullBuilderWorkspace: Story = {
  render: () => (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas)' }}>
      <BuilderNav />
      <BuilderWorkspace />
    </div>
  ),
}

export const TabsDemo: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem', backgroundColor: 'var(--color-muted)', borderRadius: '0.5rem' }}>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-background)',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🗄️ Data Schemas
          <TabBadge count={3} />
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ⚡ Workflows
          <TabBadge count={5} />
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          💻 Scripts
          <TabBadge count={12} />
        </button>
      </div>
    </div>
  ),
}
