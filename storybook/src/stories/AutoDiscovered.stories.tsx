/**
 * Auto-Discovered Packages Explorer
 *
 * Demonstrates the package discovery system with proper FakeMUI + package-prefixed styling
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

const meta: Meta = {
  title: 'Auto-Discovered Packages',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

/**
 * Simple Package Explorer using FakeMUI classes + package prefixes
 */
function PackageExplorer() {
  const [selectedLevel, setSelectedLevel] = useState<number>(3)

  // Mock package data
  const packages = [
    { id: 'ui_level2', name: 'Level 2 - User Dashboard', level: 2, color: 'green' },
    { id: 'ui_level3', name: 'Level 3 - Admin Panel', level: 3, color: 'orange' },
    { id: 'ui_level4', name: 'Level 4 - God Panel', level: 4, color: 'purple' },
    { id: 'ui_level5', name: 'Level 5 - Super God', level: 5, color: 'blue' },
  ]

  const currentPkg = packages.find(p => p.level === selectedLevel)

  return (
    <div className="section" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar - uses FakeMUI .panel class */}
      <aside className="panel" style={{ width: '280px', borderRight: '1px solid var(--color-border)' }}>
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Packages</h2>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
            {packages.length} discovered
          </p>
        </div>

        <nav style={{ padding: '0.5rem' }}>
          {packages.map(pkg => (
            <button
              key={pkg.id}
              className={`button ${pkg.id}_button`}
              onClick={() => setSelectedLevel(pkg.level)}
              style={{
                width: '100%',
                marginBottom: '0.5rem',
                textAlign: 'left',
                opacity: selectedLevel === pkg.level ? 1 : 0.7,
              }}
            >
              {pkg.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem' }}>
        {currentPkg && (
          <>
            <header style={{ marginBottom: '2rem' }}>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>{currentPkg.name}</h1>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted-foreground)' }}>
                Package ID: <code>{currentPkg.id}</code>
              </p>
            </header>

            <section>
              <h2 style={{ marginBottom: '1rem' }}>Themed Components</h2>

              {/* Buttons */}
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Buttons</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className={`button ${currentPkg.id}_button`}>
                    {currentPkg.name} Button
                  </button>
                  <button className="button">
                    Standard FakeMUI Button
                  </button>
                </div>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                  The left button uses <code>.{currentPkg.id}_button</code> which adds theme styling on top of FakeMUI <code>.button</code>
                </p>
              </div>

              {/* Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className={`card ${currentPkg.id}_card`}>
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem' }}>Themed Card</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                      Uses <code>.{currentPkg.id}_card</code>
                    </p>
                  </div>
                </div>

                <div className="card">
                  <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem' }}>Standard Card</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                      Uses only <code>.card</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem' }}>Table</h3>
                <table className={`table ${currentPkg.id}_table`}>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Class Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Button</td>
                      <td><code>.{currentPkg.id}_button</code></td>
                      <td>✓ Loaded</td>
                    </tr>
                    <tr>
                      <td>Card</td>
                      <td><code>.{currentPkg.id}_card</code></td>
                      <td>✓ Loaded</td>
                    </tr>
                    <tr>
                      <td>Table</td>
                      <td><code>.{currentPkg.id}_table</code></td>
                      <td>✓ Loaded</td>
                    </tr>
                    <tr>
                      <td>Input</td>
                      <td><code>.{currentPkg.id}_input</code></td>
                      <td>✓ Loaded</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

/**
 * Package List - Simple grid of all packages
 */
function PackageList() {
  const packages = [
    { id: 'shared', name: 'Shared', description: 'Base design system tokens' },
    { id: 'ui_home', name: 'UI Home', description: 'Landing page components' },
    { id: 'ui_header', name: 'UI Header', description: 'Navigation header' },
    { id: 'ui_footer', name: 'UI Footer', description: 'Site footer' },
    { id: 'ui_level2', name: 'Level 2', description: 'User dashboard theme' },
    { id: 'ui_level3', name: 'Level 3', description: 'Admin panel theme' },
    { id: 'ui_level4', name: 'Level 4', description: 'God-tier builder theme' },
    { id: 'ui_level5', name: 'Level 5', description: 'Super god theme' },
    { id: 'ui_level6', name: 'Level 6', description: 'Supergod theme' },
    { id: 'admin_panel', name: 'Admin Panel', description: 'Admin components' },
    { id: 'code_editor', name: 'Code Editor', description: 'Code editing components' },
    { id: 'css_designer', name: 'CSS Designer', description: 'Visual CSS designer' },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem' }}>Discovered Packages</h1>
        <p style={{ margin: 0, color: 'var(--color-muted-foreground)' }}>
          {packages.length} packages with V2 schema styles loaded
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {packages.map(pkg => (
          <div key={pkg.id} className="card">
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {pkg.name}
                {(pkg.id.includes('level') || pkg.id === 'admin_panel') && (
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    background: 'var(--color-primary)',
                    color: 'var(--color-primary-foreground)',
                    borderRadius: '0.25rem'
                  }}>
                    Themed
                  </span>
                )}
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--color-muted-foreground)' }}>
                {pkg.description}
              </p>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-muted-foreground)' }}>
                {pkg.id}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Interactive Package Explorer
 */
export const Explorer: Story = {
  render: () => <PackageExplorer />,
  parameters: {
    docs: {
      description: {
        story: 'Browse packages and see themed components using FakeMUI base classes + package-specific prefixes.'
      }
    }
  }
}

/**
 * Package List - Shows all discovered packages
 */
export const PackageListStory: Story = {
  render: () => <PackageList />,
  parameters: {
    docs: {
      description: {
        story: 'Grid view of all discovered packages in the system.'
      }
    }
  }
}
