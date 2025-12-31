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
  const [selectedPkg, setSelectedPkg] = useState<string>('ui_level3')

  // All discovered packages
  const packages = [
    { id: 'shared', name: 'Shared', description: 'Base design system tokens', themed: false },
    { id: 'ui_home', name: 'UI Home', description: 'Landing page components', themed: false },
    { id: 'ui_header', name: 'UI Header', description: 'Navigation header', themed: false },
    { id: 'ui_footer', name: 'UI Footer', description: 'Site footer', themed: false },
    { id: 'ui_level2', name: 'Level 2', description: 'User dashboard theme', themed: true },
    { id: 'ui_level3', name: 'Level 3', description: 'Admin panel theme', themed: true },
    { id: 'ui_level4', name: 'Level 4', description: 'God-tier builder theme', themed: true },
    { id: 'ui_level5', name: 'Level 5', description: 'Super god theme', themed: true },
    { id: 'ui_level6', name: 'Level 6', description: 'Supergod theme', themed: true },
    { id: 'admin_panel', name: 'Admin Panel', description: 'Admin components', themed: true },
    { id: 'code_editor', name: 'Code Editor', description: 'Code editing components', themed: false },
    { id: 'css_designer', name: 'CSS Designer', description: 'Visual CSS designer', themed: false },
  ]

  const currentPkg = packages.find(p => p.id === selectedPkg)

  return (
    <div className="section">
      <aside className="panel">
        <div>
          <h2>Packages</h2>
          <p>{packages.length} discovered</p>
        </div>

        <nav>
          {packages.map(pkg => (
            <button
              key={pkg.id}
              className={`button ${pkg.id}_button`}
              onClick={() => setSelectedPkg(pkg.id)}
            >
              {pkg.name}
            </button>
          ))}
        </nav>
      </aside>

      <main>
        {currentPkg && (
          <>
            <header>
              <h1>{currentPkg.name}</h1>
              <p>Package ID: <code>{currentPkg.id}</code></p>
            </header>

            <section>
              <h2>Themed Components</h2>

              <div className="card">
                <h3>Buttons</h3>
                <div>
                  <button className={`button ${currentPkg.id}_button`}>
                    {currentPkg.name} Button
                  </button>
                  <button className="button">
                    Standard FakeMUI Button
                  </button>
                </div>
                <p>
                  The left button uses <code>.{currentPkg.id}_button</code> which adds theme styling on top of FakeMUI <code>.button</code>
                </p>
              </div>

              <div>
                <div className={`card ${currentPkg.id}_card`}>
                  <div>
                    <h4>Themed Card</h4>
                    <p>Uses <code>.{currentPkg.id}_card</code></p>
                  </div>
                </div>

                <div className="card">
                  <div>
                    <h4>Standard Card</h4>
                    <p>Uses only <code>.card</code></p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Table</h3>
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
    <div>
      <header>
        <h1>Discovered Packages</h1>
        <p>{packages.length} packages with V2 schema styles loaded</p>
      </header>

      <div>
        {packages.map(pkg => (
          <div key={pkg.id} className="card">
            <div>
              <h3>
                {pkg.name}
                {(pkg.id.includes('level') || pkg.id === 'admin_panel') && (
                  <span>Themed</span>
                )}
              </h3>
              <p>{pkg.description}</p>
              <div><code>{pkg.id}</code></div>
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
