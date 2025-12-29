// Atoms - Basic building blocks
// These are the smallest, indivisible UI components that form the foundation

// Controls
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './controls/Button'
export { Checkbox, type CheckboxProps } from './controls/Checkbox'
export { Switch, type SwitchProps } from './controls/Switch'
export { Radio, type RadioProps } from './controls/Radio'

// Inputs
export { Input, type InputProps } from './inputs/Input'
export { TextArea, type TextAreaProps } from './inputs/TextArea'
export { Select, type SelectProps, type SelectOption } from './inputs/Select'

// Display
export { Label, type LabelProps } from './display/Label'
export { Badge, type BadgeProps, type BadgeVariant } from './display/Badge'
export {
  Avatar,
  AvatarGroup,
  AvatarFallback,
  AvatarImage,
  type AvatarProps,
  type AvatarSize,
} from './display/Avatar'
export { IconButton, type IconButtonProps, type IconButtonSize } from './display/IconButton'
export { Icon, type IconProps, type IconName, type IconSize } from './display/Icon'
export { Link, type LinkProps } from './display/Link'
export {
  Text,
  type TextProps,
  type TextVariant,
  type TextWeight,
  type TextAlign,
} from './display/Text'

// Feedback
export { Skeleton, type SkeletonProps } from './feedback/Skeleton'
export { Separator, type SeparatorProps } from './feedback/Separator'
export { Progress, CircularProgress, type ProgressProps } from './feedback/Progress'
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  type TooltipProps,
} from './feedback/Tooltip'
export { Spinner, type SpinnerProps, type SpinnerSize } from './feedback/Spinner'
