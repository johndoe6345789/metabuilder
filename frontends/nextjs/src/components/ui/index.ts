// UI Components - Atomic Design Structure
// This file re-exports all UI components organized by atomic design pattern

// ============================================================================
// ATOMS - Basic building blocks (buttons, inputs, labels, etc.)
// ============================================================================
export {
  // Button
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  // Input
  Input,
  type InputProps,
  // Textarea
  Textarea,
  type TextareaProps,
  // Label
  Label,
  type LabelProps,
  // Checkbox
  Checkbox,
  type CheckboxProps,
  // Switch
  Switch,
  type SwitchProps,
  // Badge
  Badge,
  type BadgeProps,
  type BadgeVariant,
  // Avatar
  Avatar,
  AvatarImage,
  AvatarFallback,
  type AvatarProps,
  // Separator
  Separator,
  type SeparatorProps,
  // Skeleton
  Skeleton,
  type SkeletonProps,
  // Progress
  Progress,
  type ProgressProps,
  // Slider
  Slider,
  type SliderProps,
  // Toggle
  Toggle,
  type ToggleProps,
  type ToggleVariant,
  type ToggleSize,
} from './atoms'

// ============================================================================
// MOLECULES - Simple groups of atoms (cards, dialogs, selects, etc.)
// ============================================================================
export {
  // Card
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  // Dialog
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  // Select
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectValue,
  SelectScrollDownButton,
  SelectScrollUpButton,
  // Tabs
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  // Tooltip
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
  // Alert
  Alert,
  AlertTitle,
  AlertDescription,
  type AlertVariant,
  type AlertProps,
  // Accordion
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  // DropdownMenu
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
  DropdownMenuPortal,
  // RadioGroup
  RadioGroup,
  RadioGroupItem,
  // Popover
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  // ToggleGroup
  ToggleGroup,
  ToggleGroupItem,
  // Breadcrumb
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './molecules'

// ============================================================================
// ORGANISMS - Complex components (tables, forms, navigation, etc.)
// ============================================================================
export {
  // Table
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  // Form
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
  // Sheet (Drawer)
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
  // Sidebar
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarSection,
  SidebarSeparator,
  SidebarToggle,
  // Command Palette
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
  useCommandShortcut,
  // Pagination
  Pagination,
  SimplePagination,
  TablePagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
  // Navigation
  Navigation,
  NavigationMenu,
  NavigationList,
  NavigationItem,
  NavigationTrigger,
  NavigationContent,
  NavigationLink,
  NavigationBrand,
  NavigationSeparator,
  NavigationSpacer,
  NavigationMobileToggle,
  useNavigationDropdown,
  // Alert Dialog
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from './organisms'

// Re-export types
export type { SidebarItem, SidebarProps } from './organisms'
