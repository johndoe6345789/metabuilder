// Molecules - Simple combinations of atoms
// These combine atoms to create more complex, reusable components

// New MUI-based molecules
export {
  Accordion,
  AccordionContent,
  AccordionItem,
  type AccordionProps,
  AccordionTrigger,
} from './display/Accordion'
export {
  Alert,
  AlertDescription,
  type AlertProps,
  AlertTitle,
  type AlertVariant,
} from './display/Alert'
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardHeaderProps,
  type CardProps,
  CardTitle,
} from './display/Card'
export { EmailField, type EmailFieldProps } from './form/EmailField'
export {
  FormField,
  type FormFieldProps,
  SearchInput,
  type SearchInputProps,
  TextArea,
  type TextAreaProps,
} from './form/FormField'
export { NumberField, type NumberFieldProps } from './form/NumberField'
export { PasswordField, type PasswordFieldProps } from './form/PasswordField'
export { SearchBar, type SearchBarProps } from './form/SearchBar'
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  type SelectItemProps,
  SelectLabel,
  type SelectProps,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './form/Select'
export {
  Tabs,
  TabsContent,
  TabsList,
  type TabsProps,
  TabsTrigger,
  type TabsTriggerProps,
} from './form/Tabs'
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  type DialogProps,
  DialogTitle,
  DialogTrigger,
} from './overlay/Dialog'
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  type DropdownMenuContentProps,
  DropdownMenuGroup,
  DropdownMenuItem,
  type DropdownMenuItemProps,
  DropdownMenuLabel,
  DropdownMenuPortal,
  type DropdownMenuProps,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './overlay/DropdownMenu'
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  type PopoverContentProps,
  type PopoverProps,
  PopoverTrigger,
} from './overlay/Popover'

// Legacy shared components
export { GodCredentialsBanner } from '../level1/GodCredentialsBanner'
export { ProfileCard } from '../level2/ProfileCard'
export { PasswordChangeDialog } from '../PasswordChangeDialog'
export { AppFooter } from '../shared/AppFooter'
export { AppHeader } from '../shared/AppHeader'
