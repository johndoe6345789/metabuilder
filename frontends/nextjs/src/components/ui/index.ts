// UI Components - Atomic Design Structure
// This file re-exports all UI components organized by atomic design pattern

// ============================================================================
// ATOMS - Basic building blocks (buttons, inputs, labels, etc.)
// ============================================================================
export {
  // Button
  Button,
  // Input
  Input,
  // Textarea
  Textarea,
  // Label
  Label,
  // Checkbox
  Checkbox,
  // Switch
  Switch,
  // Badge
  Badge,
  // Avatar
  Avatar,
  AvatarGroup,
  // Separator
  Separator,
  // Skeleton
  Skeleton,
  SkeletonText,
  SkeletonCircular,
  SkeletonRectangular,
  // Progress
  Progress,
  CircularProgress,
  // Slider
  Slider,
  // Toggle
  Toggle,
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
  CardActions,
  CardMedia,
  // Dialog
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  // Select
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectValue,
  // Tabs
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  // Tooltip
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  // Alert
  Alert,
  AlertTitle,
  AlertDescription,
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
  useDropdownMenu,
  // RadioGroup
  RadioGroup,
  RadioGroupItem,
  // Popover
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  usePopover,
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
