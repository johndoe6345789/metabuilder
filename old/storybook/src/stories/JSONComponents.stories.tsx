/**
 * JSON Components
 *
 * Demonstrates rendering components from JSON package definitions
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { discoverAllPackages, type ComponentDefinition, type DiscoveredPackage } from '../utils/packageDiscovery'
import { renderJsonComponent, createComponentStory } from '../utils/jsonComponentRenderer'

const meta: Meta = {
  title: 'Packages/JSON Components',
  parameters: {
    layout: 'padded',
  },
}

export default meta

/**
 * Component Viewer - interactive viewer for JSON components
 */
export const ComponentViewer: StoryObj = {
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([])
    const [selectedPackage, setSelectedPackage] = useState<string>('')
    const [selectedComponent, setSelectedComponent] = useState<ComponentDefinition | null>(null)
    const [componentProps, setComponentProps] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      discoverAllPackages()
        .then((pkgs) => {
          const withComponents = pkgs.filter((p) => p.hasComponents)
          setPackages(withComponents)
          if (withComponents.length > 0) {
            setSelectedPackage(withComponents[0].id)
            if (withComponents[0].components && withComponents[0].components.length > 0) {
              setSelectedComponent(withComponents[0].components[0])
              // Set default props
              const defaultProps: Record<string, any> = {}
              withComponents[0].components[0].props?.forEach((prop: any) => {
                if (prop.default !== undefined) {
                  defaultProps[prop.name] = prop.default
                }
              })
              setComponentProps(defaultProps)
            }
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error('Failed to discover packages:', error)
          setLoading(false)
        })
    }, [])

    const handlePackageChange = (packageId: string) => {
      setSelectedPackage(packageId)
      const pkg = packages.find((p) => p.id === packageId)
      if (pkg?.components && pkg.components.length > 0) {
        setSelectedComponent(pkg.components[0])
        // Reset props
        const defaultProps: Record<string, any> = {}
        pkg.components[0].props?.forEach((prop: any) => {
          if (prop.default !== undefined) {
            defaultProps[prop.name] = prop.default
          }
        })
        setComponentProps(defaultProps)
      } else {
        setSelectedComponent(null)
        setComponentProps({})
      }
    }

    const handleComponentChange = (componentId: string) => {
      const pkg = packages.find((p) => p.id === selectedPackage)
      const component = pkg?.components?.find((c) => c.id === componentId)
      if (component) {
        setSelectedComponent(component)
        // Reset props
        const defaultProps: Record<string, any> = {}
        component.props?.forEach((prop: any) => {
          if (prop.default !== undefined) {
            defaultProps[prop.name] = prop.default
          }
        })
        setComponentProps(defaultProps)
      }
    }

    const handlePropChange = (propName: string, value: any) => {
      setComponentProps((prev) => ({ ...prev, [propName]: value }))
    }

    if (loading) {
      return <div className="card">Loading components...</div>
    }

    if (packages.length === 0) {
      return <div className="card">No packages with components found</div>
    }

    const currentPackage = packages.find((p) => p.id === selectedPackage)

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            <h3>Package</h3>
            <select
              value={selectedPackage}
              onChange={(e) => handlePackageChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #e0e0e0',
              }}
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.metadata.name}
                </option>
              ))}
            </select>
          </div>

          {currentPackage && currentPackage.components && (
            <div className="card" style={{ padding: '1rem' }}>
              <h3>Component</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentPackage.components.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => handleComponentChange(component.id)}
                    style={{
                      padding: '0.5rem',
                      textAlign: 'left',
                      border: '1px solid #e0e0e0',
                      borderRadius: '0.25rem',
                      background:
                        selectedComponent?.id === component.id ? '#90caf9' : 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {component.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedComponent && selectedComponent.props && selectedComponent.props.length > 0 && (
            <div className="card" style={{ padding: '1rem' }}>
              <h3>Props</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedComponent.props.map((prop: any) => (
                  <div key={prop.name}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        marginBottom: '0.25rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {prop.name}
                      {prop.required && (
                        <span style={{ color: 'red', marginLeft: '0.25rem' }}>*</span>
                      )}
                    </label>
                    {prop.description && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: '#666',
                          margin: '0.25rem 0',
                        }}
                      >
                        {prop.description}
                      </p>
                    )}
                    {renderPropControl(prop, componentProps[prop.name], (value) =>
                      handlePropChange(prop.name, value)
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="card" style={{ padding: '1rem' }}>
          {selectedComponent ? (
            <>
              <h2>{selectedComponent.name}</h2>
              {selectedComponent.description && (
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  {selectedComponent.description}
                </p>
              )}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.25rem',
                  background: '#f5f5f5',
                }}
              >
                <h4>Preview:</h4>
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '0.25rem',
                  }}
                >
                  {renderJsonComponent(selectedComponent, componentProps)}
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <h4>Component Definition:</h4>
                <pre
                  style={{
                    padding: '1rem',
                    background: '#f5f5f5',
                    borderRadius: '0.25rem',
                    overflow: 'auto',
                    fontSize: '0.875rem',
                  }}
                >
                  {JSON.stringify(selectedComponent, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <p>Select a component to view</p>
          )}
        </div>
      </div>
    )
  },
}

function renderPropControl(
  prop: any,
  value: any,
  onChange: (value: any) => void
): React.ReactElement {
  const inputStyle = {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #e0e0e0',
  }

  switch (prop.type) {
    case 'boolean':
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 'auto' }}
        />
      )
    case 'number':
      return (
        <input
          type="number"
          value={value || 0}
          onChange={(e) => onChange(Number(e.target.value))}
          style={inputStyle}
        />
      )
    case 'array':
    case 'object':
      return (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value))
            } catch {
              onChange(e.target.value)
            }
          }}
          rows={5}
          style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
      )
    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )
  }
}

/**
 * Example: Nav Menu Sidebar Component
 */
export const NavMenuSidebar: StoryObj = {
  render: () => {
    const [component, setComponent] = useState<ComponentDefinition | null>(null)

    useEffect(() => {
      discoverAllPackages()
        .then((pkgs) => {
          const navMenuPkg = pkgs.find((p) => p.id === 'nav_menu')
          const sidebarComponent = navMenuPkg?.components?.find((c) => c.id === 'sidebar')
          if (sidebarComponent) {
            setComponent(sidebarComponent)
          }
        })
        .catch((error) => {
          console.error('Failed to load nav_menu package:', error)
        })
    }, [])

    if (!component) {
      return <div className="card">Loading sidebar component...</div>
    }

    return renderJsonComponent(component, {
      title: 'MetaBuilder',
      subtitle: 'Package System',
      items: [],
      user: {
        name: 'John Doe',
        role: 'Admin',
        avatar: '',
      },
      collapsed: false,
      width: 280,
    })
  },
}
