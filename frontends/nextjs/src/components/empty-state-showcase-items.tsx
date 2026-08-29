'use client'

/** Every empty-state variant the showcase renders. */

import type { ShowcaseItem, ShowcaseOptions } from './showcase-types'
import { basicShowcaseItems } from './showcase-items-basic'
import { failureShowcaseItems } from './showcase-items-failure'
import { completeShowcaseItems } from './showcase-items-complete'

export type { ShowcaseItem, ShowcaseOptions } from './showcase-types'

export function showcaseItems(options: ShowcaseOptions): ShowcaseItem[] {
  return [
    ...basicShowcaseItems(options),
    ...failureShowcaseItems(options),
    ...completeShowcaseItems(options),
  ]
}
