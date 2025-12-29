'use client'

// Component Registry - Maps Lua component types to React components
import { Box, Button, Stack, TextField,Typography } from '@mui/material'
import React from 'react'

import type { LuaUIComponent } from './types/lua-ui-package'

const ComponentRegistry: Record<string, React.ComponentType<any>> = {
  Box,
  Stack,
  Typography,
  Button,
  Input: TextField,
  TextArea: TextField,
  Form: 'form' as any, // Use native HTML form
}

/**
 * Generate React component tree from Lua UI definition
 * This is the bridge between Lua-defined UI and React rendering
 */
export function generateComponentTree(
  luaComponent: LuaUIComponent,
  key?: string | number
): React.ReactElement {
  const Component = ComponentRegistry[luaComponent.type]

  if (!Component) {
    console.warn(`Unknown component type: ${luaComponent.type}`)
    return <div key={key}>Unknown component: {luaComponent.type}</div>
  }

  // Convert Lua props to React props
  const reactProps = convertLuaPropsToReact(luaComponent.props, luaComponent.type)

  // Handle children
  const children = luaComponent.children?.map((child, index) => generateComponentTree(child, index))

  return React.createElement(Component, { ...reactProps, key }, children)
}

/**
 * Convert Lua component props to React component props
 * Handles special cases like MUI component props
 */
function convertLuaPropsToReact(
  luaProps: Record<string, unknown>,
  componentType: string
): Record<string, unknown> {
  const reactProps: Record<string, unknown> = { ...luaProps }

  // Special handling for different component types
  switch (componentType) {
    case 'Input':
    case 'TextArea':
      // Convert generic props to MUI TextField props
      if (luaProps.type === 'email') {
        reactProps.type = 'email'
      }
      if (luaProps.rows) {
        reactProps.multiline = true
        reactProps.rows = luaProps.rows
      }
      break

    case 'Button':
      // Handle button text
      if (luaProps.text) {
        // Text will be rendered as children
        delete reactProps.text
      }
      break

    case 'Typography':
      // Handle typography text
      if (luaProps.text) {
        delete reactProps.text
      }
      break
  }

  return reactProps
}

/**
 * Render text content for components
 */
function renderComponentContent(
  componentType: string,
  props: Record<string, unknown>
): React.ReactNode {
  switch (componentType) {
    case 'Button':
    case 'Typography':
      return props.text as string
    default:
      return null
  }
}
