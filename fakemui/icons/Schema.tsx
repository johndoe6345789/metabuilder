import { Icon, IconProps } from './Icon'

export const Schema = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
    <path d="M6 6h1" />
    <path d="M12 6h1" />
  </Icon>
)
