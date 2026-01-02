/**
 * Auto-Discovered Packages
 *
 * Automatically generates stories from discovered JSON packages
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { discoverAllPackages, type DiscoveredPackage } from '../utils/packageDiscovery'

const meta: Meta = {
  title: 'Packages/Auto-Discovered',
  parameters: {
    layout: 'padded',
  },
}

export default meta

/**
 * Package Browser - shows all discovered packages
 */
export const PackageBrowser: StoryObj = {
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      discoverAllPackages()
        .then((pkgs) => {
          setPackages(pkgs)
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to discover packages:', error)
          setLoading(false)
        })
    }, [])

    if (loading) {
      return <div className="card">Loading packages...</div>
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2>Discovered Packages ({packages.length})</h2>
        {packages.map((pkg) => (
          <div key={pkg.id} className="card" style={{ padding: '1rem' }}>
            <h3>{pkg.metadata.name}</h3>
            <p>{pkg.metadata.description}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>
                v{pkg.metadata.version}
              </span>
              {pkg.metadata.category && (
                <span
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.125rem 0.5rem',
                    background: '#e0e0e0',
                    borderRadius: '0.25rem',
                  }}
                >
                  {pkg.metadata.category}
                </span>
              )}
              {pkg.hasComponents && (
                <span
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.125rem 0.5rem',
                    background: '#90caf9',
                    borderRadius: '0.25rem',
                  }}
                >
                  {pkg.components?.length || 0} components
                </span>
              )}
              {pkg.hasPermissions && (
                <span
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.125rem 0.5rem',
                    background: '#ffcc80',
                    borderRadius: '0.25rem',
                  }}
                >
                  {pkg.permissions?.length || 0} permissions
                </span>
              )}
              {pkg.hasStyles && (
                <span
                  style={{
                    fontSize: '0.875rem',
                    padding: '0.125rem 0.5rem',
                    background: '#ce93d8',
                    borderRadius: '0.25rem',
                  }}
                >
                  styles
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  },
}

/**
 * Components Browser - shows all components from all packages
 */
export const ComponentsBrowser: StoryObj = {
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      discoverAllPackages()
        .then((pkgs) => {
          setPackages(pkgs.filter((p) => p.hasComponents))
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to discover packages:', error)
          setLoading(false)
        })
    }, [])

    if (loading) {
      return <div className="card">Loading components...</div>
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2>All Components</h2>
        {packages.map((pkg) => (
          <div key={pkg.id} className="card" style={{ padding: '1rem' }}>
            <h3>{pkg.metadata.name}</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.5rem',
                marginTop: '0.5rem',
              }}
            >
              {pkg.components?.map((component) => (
                <div
                  key={component.id}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '0.25rem',
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{component.name}</div>
                  {component.description && (
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        marginTop: '0.25rem',
                      }}
                    >
                      {component.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  },
}

/**
 * Permissions Browser - shows all permissions from all packages
 */
export const PermissionsBrowser: StoryObj = {
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      discoverAllPackages()
        .then((pkgs) => {
          setPackages(pkgs.filter((p) => p.hasPermissions))
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to discover packages:', error)
          setLoading(false)
        })
    }, [])

    if (loading) {
      return <div className="card">Loading permissions...</div>
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2>All Permissions</h2>
        {packages.map((pkg) => (
          <div key={pkg.id} className="card" style={{ padding: '1rem' }}>
            <h3>{pkg.metadata.name}</h3>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '0.5rem',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Action</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Resource</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Min Level</th>
                </tr>
              </thead>
              <tbody>
                {pkg.permissions?.map((permission) => (
                  <tr
                    key={permission.id}
                    style={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {permission.id}
                    </td>
                    <td style={{ padding: '0.5rem' }}>{permission.name}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span
                        style={{
                          padding: '0.125rem 0.5rem',
                          background: '#90caf9',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {permission.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {permission.resource}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      {permission.minLevel || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    )
  },
}
