import { Icon, IconProps } from './Icon'

/**
 * StorageIcon for storage/database operations
 */
// Path is in 0-24 coordinate space — override viewBox and switch to fill mode
export const Storage = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" fill="currentColor" stroke="none" strokeWidth={0} {...props}>
    <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>
  </Icon>
)
