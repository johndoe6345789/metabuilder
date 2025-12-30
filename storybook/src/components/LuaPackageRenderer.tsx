/**
 * LuaPackageRenderer
 * Renders a Lua UI component tree to React components
 */

import React from 'react'
import type { LuaUIComponent } from '../types/lua-types'
import { getComponent, Box } from './registry'

interface LuaPackageRendererProps {
  /** The Lua component tree to render */
  component: LuaUIComponent
  /** Show debug borders around components */
  debug?: boolean
}

/**
 * Recursively render a Lua component tree
 */
export const LuaPackageRenderer: React.FC<LuaPackageRendererProps> = ({ 
  component, 
  debug = false 
}) => {
  const { type, props = {}, children } = component
  
  // Get the React component for this Lua type
  const Component = getComponent(type)
  
  if (!Component) {
    // Render unknown components as a debug box
    return (
      <div 
        style={{ 
          padding: '0.5rem', 
          border: '2px dashed #f59e0b', 
          borderRadius: '4px',
          background: '#fef3c7',
          margin: '0.25rem 0',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.25rem' }}>
          Unknown component: <strong>{type}</strong>
        </div>
        {children && children.length > 0 && (
          <div style={{ paddingLeft: '1rem' }}>
            {children.map((child, index) => (
              <LuaPackageRenderer key={index} component={child} debug={debug} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // Render children recursively
  const renderedChildren = children?.map((child, index) => (
    <LuaPackageRenderer key={index} component={child} debug={debug} />
  ))
  
  // Build props, extracting special ones and filtering out reserved React props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className, ref, key, ...restProps } = props as Record<string, unknown>
  
  const element = (
    <Component className={className as string} {...restProps}>
      {renderedChildren}
    </Component>
  )
  
  // Wrap in debug border if enabled
  if (debug) {
    return (
      <div style={{ outline: '1px solid rgba(59, 130, 246, 0.3)', position: 'relative' }}>
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            background: 'rgba(59, 130, 246, 0.8)',
            color: 'white',
            fontSize: '10px',
            padding: '1px 4px',
            zIndex: 10,
          }}
        >
          {type}
        </div>
        {element}
      </div>
    )
  }
  
  return element
}

/**
 * Wrapper component with error boundary behavior
 */
export const LuaPackageRendererSafe: React.FC<LuaPackageRendererProps & { 
  fallback?: React.ReactNode 
}> = ({ component, debug, fallback }) => {
  try {
    return <LuaPackageRenderer component={component} debug={debug} />
  } catch (error) {
    console.error('LuaPackageRenderer error:', error)
    return (
      <>
        {fallback || (
          <Box className="p-4 border-2 border-red-500 rounded bg-red-50">
            <div className="text-red-700 font-medium">Render Error</div>
            <div className="text-red-600 text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          </Box>
        )}
      </>
    )
  }
}

export default LuaPackageRenderer
