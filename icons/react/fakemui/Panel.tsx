import { Icon, IconProps } from './Icon'

export const Panel = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 15h18" />
  </Icon>
)
