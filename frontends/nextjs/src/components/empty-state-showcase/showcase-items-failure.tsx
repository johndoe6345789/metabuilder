'use client'

/** The four failure and completion states. */

import {
  ErrorState,
  NoConnectionState,
} from '@metabuilder/components'
import type { ShowcaseItem, ShowcaseOptions } from './showcase-types'

export function failureShowcaseItems({
  size: selectedSize,
  animationsEnabled,
  onRetry: handleRetry,
}: ShowcaseOptions): ShowcaseItem[] {
  return [

    {
      id: 'error-state',
      name: 'Error State',
      component: (
        <ErrorState
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Retry',
            onClick: handleRetry,
          }}
        />
      ),
    },
    {
      id: 'no-connection',
      name: 'Connection Failed',
      component: (
        <NoConnectionState
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Try Again',
            onClick: handleRetry,
          }}
        />
      ),
    },
  ]
}
