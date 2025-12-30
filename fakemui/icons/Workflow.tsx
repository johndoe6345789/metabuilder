import { Icon, IconProps } from './Icon'

export const Workflow = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="6" height="4" rx="1" />
    <rect x="15" y="4" width="6" height="4" rx="1" />
    <rect x="9" y="16" width="6" height="4" rx="1" />
    <path d="M6 8v4a2 2 0 002 2h8a2 2 0 002-2V8" />
    <path d="M12 14v2" />
  </Icon>
)
