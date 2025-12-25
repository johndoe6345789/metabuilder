// Molecules - Simple combinations of atoms
// These combine atoms to create more complex, reusable components

// New MUI-based molecules
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  type CardProps,
  type CardHeaderProps,
} from './Card'

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  type DialogProps,
} from './Dialog'

export {
  Alert,
  AlertTitle,
  AlertDescription,
  type AlertProps,
  type AlertVariant,
} from './Alert'

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsTriggerProps,
} from './Tabs'

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
} from './Accordion'

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  type SelectProps,
  type SelectItemProps,
} from './Select'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  type DropdownMenuProps,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
} from './DropdownMenu'

export {
  FormField,
  SearchInput,
  TextArea,
  type FormFieldProps,
  type SearchInputProps,
  type TextAreaProps,
} from './FormField'

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  type PopoverProps,
  type PopoverContentProps,
} from './Popover'

// Legacy shared components
export { AppHeader } from '../shared/AppHeader'
export { AppFooter } from '../shared/AppFooter'
export { GodCredentialsBanner } from '../level1/GodCredentialsBanner'
export { ProfileCard } from '../level2/ProfileCard'
export { SecurityWarningDialog } from '../SecurityWarningDialog'
export { PasswordChangeDialog } from '../PasswordChangeDialog'
