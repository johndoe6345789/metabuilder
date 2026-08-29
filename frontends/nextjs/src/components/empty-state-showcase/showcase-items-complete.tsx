'use client'

/** The completion and custom states. */

import {
  EmptyState,
  LoadingCompleteState,
} from '@metabuilder/components'
import type { ShowcaseItem, ShowcaseOptions } from './showcase-types'

export function completeShowcaseItems({
  size: selectedSize,
  animationsEnabled,
  onAction: handleAction,
}: ShowcaseOptions): ShowcaseItem[] {
  return [
    {
      id: 'loading-complete',
      name: 'Operation Complete',
      component: (
        <LoadingCompleteState
          size={selectedSize}
          animated={animationsEnabled}
        />
      ),
    },
    {
      id: 'custom-empty-state',
      name: 'Custom Empty State',
      component: (
        <EmptyState
          icon="🎨"
          title="Custom Configuration"
          description="This is a fully customized empty state with all optional props"
          hint="You can customize the icon, colors, spacing, and more"
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Primary Action',
            onClick: handleAction,
            variant: 'primary',
          }}
          secondaryAction={{
            label: 'Secondary',
            onClick: handleAction,
          }}
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '16px',
            border: '1px solid #dee2e6',
          }}
        />
      ),
    },
  ]
}
