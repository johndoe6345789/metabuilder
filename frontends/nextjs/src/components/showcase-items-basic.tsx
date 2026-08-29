'use client'

/** The four everyday empty states. */

import {
  AccessDeniedState,
  NoDataFound,
  NoItemsYet,
  NoResultsFound,
} from '@metabuilder/components'
import type { ShowcaseItem, ShowcaseOptions } from './showcase-types'

export function basicShowcaseItems({
  size: selectedSize,
  animationsEnabled,
  onCreate: handleCreate,
}: ShowcaseOptions): ShowcaseItem[] {
  return [

    {
      id: 'no-items-yet',
      name: 'No Items Yet',
      component: (
        <NoItemsYet
          size={selectedSize}
          animated={animationsEnabled}
          action={{
            label: 'Create Item',
            onClick: handleCreate,
          }}
        />
      ),
    },
    {
      id: 'no-data-found',
      name: 'No Data Found',
      component: (
        <NoDataFound size={selectedSize} animated={animationsEnabled} />
      ),
    },
    {
      id: 'no-results-found',
      name: 'No Results Found',
      component: (
        <NoResultsFound size={selectedSize} animated={animationsEnabled} />
      ),
    },
    {
      id: 'access-denied',
      name: 'Access Denied',
      component: (
        <AccessDeniedState size={selectedSize} animated={animationsEnabled} />
      ),
    },
  ]
}
