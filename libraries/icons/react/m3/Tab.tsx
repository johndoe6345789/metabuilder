import { Icon, IconProps } from './Icon'

export const Tab = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 3v6" />
  </Icon>
)
