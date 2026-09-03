import { MANAGED_PROPS } from './style-controls/groups'

/**
 * Common CSS properties worth suggesting in the Advanced section's "add a
 * property" box, so picking one is usually a click instead of recalling
 * its exact spelling from memory. Deliberately excludes anything the
 * visual controls already manage (see MANAGED_PROPS) -- that property
 * already has a point-and-click home above, and suggesting it again here
 * would just be a worse way to set the same thing.
 */
const CANDIDATE_CSS_PROPERTIES = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'width',
  'height',
  'max-width',
  'max-height',
  'min-width',
  'min-height',
  'box-sizing',
  'flex',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'align-self',
  'gap',
  'grid-template-columns',
  'grid-template-rows',
  'grid-column',
  'grid-row',
  'white-space',
  'text-overflow',
  'word-break',
  'vertical-align',
  'font-family',
  'transition',
  'transform',
  'filter',
  'backdrop-filter',
  'background-image',
  'background-size',
  'background-position',
  'background-repeat',
  'outline',
  'outline-offset',
  'pointer-events',
  'visibility',
  'object-fit',
]

export const CSS_PROPERTY_SUGGESTIONS = CANDIDATE_CSS_PROPERTIES.filter(
  prop => !MANAGED_PROPS.has(prop)
)
