/**
 * Auto-Generated Package Stories
 * 
 * This file auto-discovers packages from packages/index.json
 * and generates Storybook stories for each package's render functions.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'

import { LuaPackageRenderer } from '../components/LuaPackageRenderer'
import { 
  discoverPackages, 
  getContextVariants, 
  getDefaultContext,
  type DiscoveredPackage 
} from '../discovery/package-discovery'
import { loadAndExecuteLuaFile, type LuaExecutionResult } from '../lua/executor'
import { executeMockRender, getMockPackage, initializeMocks } from '../mocks/packages'
import { loadPackageComponents } from '../mocks/auto-loader'
import type { LuaRenderContext } from '../types/lua-types'

const meta: Meta = {
  title: 'Auto-Discovered Packages',
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj

/**
 * PackageStoryRenderer - Renders a package's Lua script
 */
interface PackageStoryRendererProps {
  packageId: string
  scriptName: string
  context?: LuaRenderContext
  useMock?: boolean
  debug?: boolean
}

function PackageStoryRenderer({ 
  packageId, 
  scriptName, 
  context,
  useMock = true,
  debug = false 
}: PackageStoryRendererProps) {
  const [result, setResult] = useState<LuaExecutionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentContext, setCurrentContext] = useState<LuaRenderContext | null>(context || null)
  
  useEffect(() => {
    async function load() {
      // Load default context if not provided
      if (!currentContext) {
        const defaultCtx = await getDefaultContext()
        setCurrentContext(defaultCtx)
        return // Will re-run when context is set
      }
      
      setLoading(true)
      
      // Try mock first if available
      if (useMock) {
        const mockPkg = getMockPackage(packageId)
        if (mockPkg) {
          const mockResult = executeMockRender(packageId, scriptName, currentContext)
          setResult(mockResult)
          setLoading(false)
          return
        }
      }
      
      // Fall back to actual Lua execution
      const luaResult = await loadAndExecuteLuaFile(packageId, scriptName, currentContext)
      setResult(luaResult)
      setLoading(false)
    }
    
    load()
  }, [packageId, scriptName, currentContext, useMock])
  
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading {packageId}/{scriptName}...</div>
      </div>
    )
  }
  
  if (!result || !result.success || !result.result) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          padding: '1rem', 
          background: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          <strong>Error loading {packageId}/{scriptName}</strong>
          <p>{result?.error || 'Unknown error'}</p>
          {result?.logs && result.logs.length > 0 && (
            <pre style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
              {result.logs.join('\n')}
            </pre>
          )}
        </div>
      </div>
    )
  }
  
  return <LuaPackageRenderer component={result.result} debug={debug} />
}

/**
 * PackageExplorer - Interactive browser for all discovered packages
 */
function PackageExplorer() {
  const [packages, setPackages] = useState<DiscoveredPackage[]>([])
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [selectedScript, setSelectedScript] = useState<string | null>(null)
  const [contextVariants, setContextVariants] = useState<Array<{ name: string; context: LuaRenderContext }>>([])
  const [selectedVariant, setSelectedVariant] = useState<string>('Admin')
  const [debug, setDebug] = useState(false)
  const [loading, setLoading] = useState(true)
  const [componentIds, setComponentIds] = useState<string[]>([])
  
  useEffect(() => {
    async function load() {
      // Initialize mocks (loads from real packages + JSON overrides)
      await initializeMocks()
      
      const [pkgs, variants] = await Promise.all([
        discoverPackages(),
        getContextVariants()
      ])
      setPackages(pkgs)
      setContextVariants(variants)
      setLoading(false)
      
      // Auto-select first featured package
      const featured = pkgs.find(p => p.featured)
      if (featured) {
        setSelectedPkg(featured.metadata.packageId)
        const renderScript = featured.scripts.find(s => s.hasRenderFunction)
        if (renderScript) {
          setSelectedScript(renderScript.file)
        }
      }
    }
    load()
  }, [])
  
  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading packages...</div>
  }
  
  const currentPackage = packages.find(p => p.metadata.packageId === selectedPkg)
  const currentVariant = contextVariants.find(v => v.name === selectedVariant)
  
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '280px', 
        borderRight: '1px solid #e5e7eb', 
        overflow: 'auto',
        background: '#f9fafb'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Packages</h3>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {packages.length} discovered
          </div>
        </div>
        
        {packages.map(pkg => (
          <div
            key={pkg.metadata.packageId}
            style={{
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              background: selectedPkg === pkg.metadata.packageId ? '#e0e7ff' : 'transparent',
              borderBottom: '1px solid #e5e7eb',
            }}
            onClick={async () => {
              setSelectedPkg(pkg.metadata.packageId)
              // Load component IDs from components.json
              const components = await loadPackageComponents(pkg.metadata.packageId)
              setComponentIds(components.map(c => c.id))
              // Select first render or all_components
              const renderScript = pkg.scripts.find(s => s.hasRenderFunction)
              if (renderScript) {
                setSelectedScript(renderScript.file)
              } else if (components.length > 0) {
                setSelectedScript('all_components')
              } else {
                setSelectedScript(null)
              }
            }}
          >
            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {pkg.featured && <span title="Featured">⭐</span>}
              {pkg.metadata.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {pkg.metadata.category} · Level {pkg.metadata.minLevel}
            </div>
            {pkg.scripts.length > 0 && (
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                {pkg.scripts.length} scripts
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <div style={{ 
          padding: '0.75rem 1rem', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          background: '#fff'
        }}>
          {currentPackage && (
            <>
              <select 
                value={selectedScript || ''} 
                onChange={e => setSelectedScript(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="">Select render...</option>
                {/* Component IDs from components.json */}
                {componentIds.length > 0 && (
                  <optgroup label="📦 Components (from package)">
                    <option value="all_components">🔲 All Components</option>
                    {componentIds.map(id => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </optgroup>
                )}
                {/* Scripts from manifest */}
                {currentPackage.scripts.length > 0 && (
                  <optgroup label="📜 Scripts">
                    {currentPackage.scripts.map(s => (
                      <option key={s.file} value={s.file}>
                        {s.name} {s.hasRenderFunction && '✨'}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              <select 
                value={selectedVariant} 
                onChange={e => setSelectedVariant(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                {contextVariants.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox" 
                  checked={debug} 
                  onChange={e => setDebug(e.target.checked)} 
                />
                Debug
              </label>
            </>
          )}
        </div>
        
        {/* Preview */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentPackage && selectedScript && currentVariant ? (
            <PackageStoryRenderer
              packageId={currentPackage.metadata.packageId}
              scriptName={selectedScript}
              context={currentVariant.context}
              debug={debug}
            />
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#6b7280' 
            }}>
              {currentPackage 
                ? 'Select a script to preview' 
                : 'Select a package from the sidebar'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Interactive Package Explorer
 */
export const Explorer: Story = {
  render: () => <PackageExplorer />,
}

/**
 * Package List - Shows all discovered packages
 */
export const PackageList: Story = {
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
      discoverPackages().then(pkgs => {
        setPackages(pkgs)
        setLoading(false)
      })
    }, [])
    
    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
    
    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Discovered Packages ({packages.length})</h2>
        <div style={{ 
          display: 'grid', 
          gap: '1rem', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
        }}>
          {packages.map(pkg => (
            <div 
              key={pkg.metadata.packageId}
              style={{ 
                padding: '1rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                background: pkg.featured ? '#fffbeb' : '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {pkg.featured && <span>⭐</span>}
                <h3 style={{ margin: 0 }}>{pkg.metadata.name}</h3>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
                {pkg.metadata.description}
              </p>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                <div>ID: {pkg.metadata.packageId}</div>
                <div>Category: {pkg.metadata.category}</div>
                <div>Level: {pkg.metadata.minLevel}</div>
                {pkg.scripts.length > 0 && (
                  <div>Scripts: {pkg.scripts.map(s => s.name).join(', ')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
}
