import { Icon, IconProps } from './Icon'

export const Toolbar = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <circle cx="7" cy="6" r="1" />
    <circle cx="12" cy="6" r="1" />
    <circle cx="17" cy="6" r="1" />
  </Icon>
)
