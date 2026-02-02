'use client'

import { BackendStatus, statusIndicatorStyles } from '@metabuilder/components'
import { getStorageConfig } from '@/lib/storage'
import { useEffect } from 'react'

// Inject status indicator styles (only once)
if (typeof document !== 'undefined') {
  const styleId = 'backend-status-styles'
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style')
    styleTag.id = styleId
    styleTag.textContent = statusIndicatorStyles
    document.head.appendChild(styleTag)
  }
}

/**
 * Backend connection indicator component.
 * Uses the shared BackendStatus component from @metabuilder/components.
 * Reads storage configuration and displays connection status.
 */
export function BackendIndicator() {
  const { backend } = getStorageConfig()
  const isEnvConfigured = Boolean(process.env.NEXT_PUBLIC_FLASK_BACKEND_URL)

  // Determine status based on backend type
  const status = backend === 'indexeddb' ? 'disconnected' : 'connected'

  return (
    <div data-testid="backend-indicator">
      <BackendStatus
        status={status}
        showDot={status === 'connected' && isEnvConfigured}
        disconnectedTooltip="Disconnected from backend - Using local storage"
        connectedTooltip={
          isEnvConfigured
            ? 'Connected to Flask Backend (Auto-configured)'
            : 'Connected to Flask Backend'
        }
      />
    </div>
  )
}
