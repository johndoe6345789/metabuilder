// Atoms - Basic building blocks
// These are the smallest, indivisible UI components that form the foundation

// New MUI-based atoms
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button'
export { Input, type InputProps } from './Input'
export { Label, type LabelProps } from './Label'
export { Badge, type BadgeProps, type BadgeVariant } from './Badge'
export { Checkbox, type CheckboxProps } from './Checkbox'
export { Switch, type SwitchProps } from './Switch'
export { Avatar, AvatarGroup, AvatarFallback, AvatarImage, type AvatarProps, type AvatarSize } from './Avatar'
export { Skeleton, type SkeletonProps } from './Skeleton'
export { Separator, type SeparatorProps } from './Separator'
export { Progress, CircularProgress, type ProgressProps } from './Progress'
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, type TooltipProps } from './Tooltip'
export { Spinner, type SpinnerProps, type SpinnerSize } from './Spinner'
export { IconButton, type IconButtonProps, type IconButtonSize } from './IconButton'

// Legacy exports (for backward compatibility during migration)
export * from '../ui/slider'
export * from '../ui/radio-group'
