/**
 * UI Level 3 Package Stories
 *
 * Admin panel - Django-style data management interface
 * Orange theme with data tables and statistics
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

// Stat Card Component
const StatCard: React.FC<{
  title: string
  value: string | number
  description: string
  icon: string
}> = ({ title, value, description, icon }) => (
  <div
    className="card stat-card"
    style={{
      padding: '1.5rem',
      backgroundColor: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '0.5rem'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-foreground)' }}>{title}</span>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{value}</div>
    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)', margin: 0 }}>{description}</p>
  </div>
)

// Table Row Component
const TableRow: React.FC<{
  cells: string[]
  onEdit?: () => void
  onDelete?: () => void
}> = ({ cells, onEdit, onDelete }) => (
  <tr
    className="table-row"
    style={{
      borderBottom: '1px solid var(--color-border)',
      transition: 'background-color 150ms ease-in-out'
    }}
  >
    {cells.map((cell, idx) => (
      <td key={idx} style={{ padding: '0.75rem' }}>
        {cell}
      </td>
    ))}
    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
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
    </td>
  </tr>
)

// Data Table Component
const DataTable: React.FC<{
  headers: string[]
  rows: string[][]
}> = ({ headers, rows }) => (
  <div
    style={{
      border: '1px solid var(--color-border)',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      backgroundColor: 'var(--color-card)'
    }}
  >
    <table className="table data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: 'var(--color-muted)', borderBottom: '1px solid var(--color-border)' }}>
          {headers.map((header, idx) => (
            <th key={idx} style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>
              {header}
            </th>
          ))}
          <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, fontSize: '0.875rem' }}>
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <TableRow
            key={idx}
            cells={row}
            onEdit={() => console.log('Edit', row)}
            onDelete={() => console.log('Delete', row)}
          />
        ))}
      </tbody>
    </table>
  </div>
)

// Model Browser Component
const ModelBrowser: React.FC = () => (
  <div
    className="card model-browser"
    style={{
      padding: '1.5rem',
      backgroundColor: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '0.5rem'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div>
        <h3 style={{ margin: 0, marginBottom: '0.25rem' }}>Models</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
          Browse and manage data models
        </p>
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search..."
          className="input search-input"
          style={{
            padding: '0.5rem 1rem 0.5rem 2.25rem',
            border: '1px solid var(--color-input)',
            borderRadius: '0.375rem',
            width: '16rem',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-foreground)',
            outline: 'none',
            transition: 'border-color 200ms ease-in-out'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--color-ring)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--color-input)'}
        />
        <span style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--color-muted-foreground)'
        }}>🔍</span>
      </div>
    </div>

    <DataTable
      headers={['Username', 'Email', 'Role', 'Created']}
      rows={[
        ['admin', 'admin@example.com', 'Admin', '2024-01-15'],
        ['moderator', 'mod@example.com', 'Moderator', '2024-02-20'],
        ['user123', 'user@example.com', 'User', '2024-03-10'],
      ]}
    />
  </div>
)

// Admin Panel Navigation
const AdminNav: React.FC = () => (
  <nav
    className="nav admin-nav"
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--color-sidebar)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 2rem'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            className="box admin-logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
            }}
          />
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-sidebar-foreground)' }}>
            Admin Panel
          </span>
        </div>
        <a href="#" style={{ color: 'var(--color-sidebar-foreground)', textDecoration: 'none', fontSize: '0.875rem' }}>
          🏠 Home
        </a>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
          admin
        </span>
        <button
          style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-sidebar-foreground)',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🚪
        </button>
      </div>
    </div>
  </nav>
)

// Admin Panel Dashboard
const AdminDashboard: React.FC = () => (
  <section className="section admin-panel" style={{ padding: '2rem', maxWidth: '1536px' }}>
    <h2 className="text admin-title" style={{ marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.875rem' }}>
      Data Management
    </h2>
    <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '2rem' }}>
      Manage all application data and users
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      <StatCard title="Total Users" value="156" description="Registered accounts" icon="👥" />
      <StatCard title="Total Comments" value="2,341" description="Posted by users" icon="💬" />
      <StatCard title="Admins" value="12" description="Admin & god users" icon="👥" />
    </div>

    <ModelBrowser />
  </section>
)

// Meta configuration
const meta: Meta = {
  title: 'Packages/UI Level 3',
  parameters: {
    package: 'ui_level3',
    layout: 'fullscreen',
  },
}

export default meta

// Stories
type Story = StoryObj

export const Navigation: Story = {
  render: () => <AdminNav />,
}

export const StatsCards: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
      <StatCard title="Total Users" value="156" description="Registered accounts" icon="👥" />
      <StatCard title="Total Comments" value="2,341" description="Posted by users" icon="💬" />
      <StatCard title="Admins" value="12" description="Admin & god users" icon="👥" />
    </div>
  ),
}

export const UsersTable: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <DataTable
        headers={['Username', 'Email', 'Role', 'Created']}
        rows={[
          ['admin', 'admin@example.com', 'Admin', '2024-01-15'],
          ['moderator', 'mod@example.com', 'Moderator', '2024-02-20'],
          ['user123', 'user@example.com', 'User', '2024-03-10'],
          ['developer', 'dev@example.com', 'Developer', '2024-03-15'],
        ]}
      />
    </div>
  ),
}

export const ModelBrowserPanel: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <ModelBrowser />
    </div>
  ),
}

export const FullAdminPanel: Story = {
  render: () => (
    <div>
      <AdminNav />
      <AdminDashboard />
    </div>
  ),
}
