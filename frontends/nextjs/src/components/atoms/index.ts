// Atoms - Basic building blocks
// These are the smallest, indivisible UI components that form the foundation

// Controls
export { Button, type ButtonProps, type ButtonSize,type ButtonVariant } from './controls/Button'
export { Checkbox, type CheckboxProps } from './controls/Checkbox'
export { Radio, type RadioProps } from './controls/Radio'
export { Switch, type SwitchProps } from './controls/Switch'

// Inputs
export { Input, type InputProps } from './inputs/Input'
export { Select, type SelectOption,type SelectProps } from './inputs/Select'
export { TextArea, type TextAreaProps } from './inputs/TextArea'

// Display
export {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  type AvatarProps,
  type AvatarSize,
} from './display/Avatar'
export { Badge, type BadgeProps, type BadgeVariant } from './display/Badge'
export { Icon, type IconName, type IconProps, type IconSize } from './display/Icon'
export { IconButton, type IconButtonProps, type IconButtonSize } from './display/IconButton'
export { Label, type LabelProps } from './display/Label'
export { Link, type LinkProps } from './display/Link'
export {
  Text,
  type TextAlign,
  type TextProps,
  type TextVariant,
  type TextWeight,
} from './display/Text'

// Feedback
export { CircularProgress, Progress, type ProgressProps } from './feedback/Progress'
export { Separator, type SeparatorProps } from './feedback/Separator'
export { Skeleton, type SkeletonProps } from './feedback/Skeleton'
export { Spinner, type SpinnerProps, type SpinnerSize } from './feedback/Spinner'
export {
  Tooltip,
  TooltipContent,
  type TooltipProps,
  TooltipProvider,
  TooltipTrigger,
} from './feedback/Tooltip'
