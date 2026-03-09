'use client'

import React, { useEffect, useState } from 'react'
import { BASE_PATH } from './lib/app-config'
import { useAppDispatch } from '@metabuilder/redux-core'
import {
  // Layout
  Box,
  // Surfaces
  Card,
  // Feedback
  Spinner, Alert,
  // Data Display
  Typography,
} from '@metabuilder/fakemui'

/**
 * Email Client Main Page
 *
 * This is the bootloader page that loads the email_client package from packages/email_client/.
 * It handles:
 * - Loading package metadata and page configuration
 * - Initializing Redux state for email accounts, folders, and messages
 * - Rendering declarative UI from package page-config
 * - Wiring up email hooks and Redux state
 */

interface PageConfig {
  type: string
  props?: Record<string, unknown>
  children?: unknown
}

interface PackageMetadata {
  id: string
  name: string
  description: string
  version: string
  pageConfig?: PageConfig
}

async function loadEmailClientPackage(): Promise<PackageMetadata> {
  try {
    const response = await fetch(`${BASE_PATH}/api/v1/packages/email_client/metadata`)
    if (!response.ok) {
      throw new Error(`Failed to load email_client package: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading email_client package:', error)
    throw error
  }
}

async function loadPageConfig(packageId: string): Promise<PageConfig> {
  try {
    const response = await fetch(`${BASE_PATH}/api/v1/packages/${packageId}/page-config`)
    if (!response.ok) {
      throw new Error(`Failed to load page config: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading page config:', error)
    throw error
  }
}

/**
 * Generic component renderer
 * Renders declarative component definitions from JSON
 */
function RenderComponent({ component }: { component: PageConfig }): React.JSX.Element {
  const { type, props = {}, children } = component

  // Map component types to FakeMUI components
  const componentMap: Record<string, React.ElementType> = {
    // Layout
    'Box': Box,

    // Surfaces
    'Card': Card,
    'Paper': Card,

    // Data Display
    'Typography': Typography,

    // Feedback
    'Spinner': Spinner,
    'Loader': Spinner,
    'Alert': Alert,

    // Fallback
    'Fragment': React.Fragment
  }

  const Component = componentMap[type] || Box
  const componentProps = props as Record<string, unknown>

  return (
    <Component {...componentProps}>
      {children && Array.isArray(children) ? (
        children.map((child, idx) => (
          typeof child === 'string' ? (
            <span key={idx}>{child}</span>
          ) : (
            <RenderComponent key={idx} component={child as PageConfig} />
          )
        ))
      ) : children ? (
        <RenderComponent component={children as PageConfig} />
      ) : null}
    </Component>
  )
}

export default function EmailClientContent() {
  const dispatch = useAppDispatch()
  const [packageMetadata, setPackageMetadata] = useState<PackageMetadata | null>(null)
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load package metadata and page config on mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)

        // Load package metadata
        const metadata = await loadEmailClientPackage()
        setPackageMetadata(metadata)

        // Load page configuration
        const config = await loadPageConfig('email_client')
        setPageConfig(config)

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading email client')
        setError(error)
        console.error('Failed to load email client:', error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [dispatch])

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <Spinner />
        <span>Loading Email Client...</span>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">
          <strong>Failed to load Email Client</strong>
          <p>{error.message}</p>
        </Alert>
      </Box>
    )
  }

  // No package metadata
  if (!packageMetadata) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="warning">
          <strong>Email Client Package Not Found</strong>
          <p>The email_client package could not be loaded. Please ensure it is installed and configured.</p>
        </Alert>
      </Box>
    )
  }

  // Render default layout if no page config
  if (!pageConfig) {
    return (
      <Box sx={{ padding: 3 }}>
        <h1>{packageMetadata.name}</h1>
        <p>{packageMetadata.description}</p>
        <p>Version: {packageMetadata.version}</p>
        <Alert severity="info">
          Page configuration is loading or not available. Please check back soon.
        </Alert>
      </Box>
    )
  }

  // Render declarative component from page config
  return (
    <Box component="main" sx={{ minHeight: '100vh' }}>
      <RenderComponent component={pageConfig} />
    </Box>
  )
}
