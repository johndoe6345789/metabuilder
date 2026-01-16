/**
 * Fakemui Component Registry
 *
 * Maps all fakemui components to the JSON component schema system.
 * This enables declarative JSON components to render actual fakemui UI components.
 *
 * Usage:
 * ```typescript
 * import { FAKEMUI_REGISTRY } from '@/lib/fakemui-registry'
 *
 * // In JSON component renderer:
 * const Component = FAKEMUI_REGISTRY['Button']
 * return <Component {...props}>{children}</Component>
 * ```
 */

import React from 'react'

// Inputs / Form Controls
import {
  Button,
  ButtonGroup,
  IconButton,
  Fab,
  Input,
  Textarea,
  Select,
  NativeSelect,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  FormControl,
  FormGroup,
  FormLabel,
  FormHelperText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Rating,
  DatePicker,
  TimePicker,
  ColorPicker,
  FileUpload,
  FormField,
} from '@/fakemui/inputs'

// Surfaces / Containers
import {
  Paper,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardActionArea,
  CardMedia,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  AppBar,
  Toolbar,
  Drawer,
} from '@/fakemui/surfaces'

// Layout
import {
  Box,
  Container,
  Grid,
  Stack,
  Flex,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@/fakemui/layout'

// Data Display
import {
  Typography,
  Avatar,
  AvatarGroup,
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListSubheader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  TableSortLabel,
  Tooltip,
} from '@/fakemui/data-display'

// Feedback
import {
  Alert,
  Backdrop,
  Skeleton,
  Snackbar,
} from '@/fakemui/feedback'

// Navigation
import {
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  MenuList,
  Pagination,
  PaginationItem,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  StepContent,
  StepConnector,
  StepIcon,
  Tabs,
  Tab,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@/fakemui/navigation'

// Utils
import {
  Modal,
  Popover,
  Popper,
  Portal,
  ClickAwayListener,
  CssBaseline,
  GlobalStyles,
  NoSsr,
} from '@/fakemui/utils'

// Atoms
import {
  Text,
  Title,
  Label,
  Panel,
  Section,
  StatBadge,
  States,
  EditorWrapper,
  AutoGrid,
} from '@/fakemui/atoms'

// Lab (Experimental)
import {
  LoadingButton,
  Masonry,
  Timeline,
  TreeView,
  TreeItem,
} from '@/fakemui/lab'

// X (Advanced)
import {
  DataGrid,
} from '@/fakemui/x'

// Icons
import {
  Icon,
  Plus,
  Trash,
  Copy,
  Check,
  X as XIcon,
  Filter,
  FilterOff,
  ArrowUp,
  ArrowDown,
  ArrowClockwise,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FloppyDisk,
  Search,
  Settings,
  User,
  UserCheck,
  Eye,
  EyeSlash,
  Pencil,
  Calendar,
  Clock,
  Mail,
  Bell,
  Star,
  Heart,
  Share,
} from '@/fakemui'

/**
 * Complete registry of all fakemui components
 * Maps component names to React component types
 */
export const FAKEMUI_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Form Controls / Inputs (28 components)
  Button,
  ButtonGroup,
  IconButton,
  Fab,
  Input,
  Textarea,
  Select,
  NativeSelect,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  FormControl,
  FormGroup,
  FormLabel,
  FormHelperText,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Rating,
  DatePicker,
  TimePicker,
  ColorPicker,
  FileUpload,
  FormField,
  LoadingButton,

  // Surfaces / Containers (15 components)
  Paper,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardActionArea,
  CardMedia,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  AppBar,
  Toolbar,
  Drawer,
  Panel,

  // Layout (11 components)
  Box,
  Container,
  Grid,
  Stack,
  Flex,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Masonry,
  Section,
  AutoGrid,

  // Data Display (26 components)
  Typography,
  Avatar,
  AvatarGroup,
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListSubheader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Text,
  Title,
  Label,
  StatBadge,

  // Feedback (6 components)
  Alert,
  Backdrop,
  Skeleton,
  Snackbar,
  States,
  EditorWrapper,

  // Navigation (22 components)
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  MenuList,
  Pagination,
  PaginationItem,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  StepContent,
  StepConnector,
  StepIcon,
  Tabs,
  Tab,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Timeline,

  // Modals / Utils (9 components)
  Modal,
  Popover,
  Popper,
  Portal,
  ClickAwayListener,
  CssBaseline,
  GlobalStyles,
  NoSsr,
  TreeView,

  // Advanced (1 component)
  DataGrid,

  // Icons (27 components)
  Icon,
  Plus,
  Trash,
  Copy,
  Check,
  XIcon,
  Filter,
  FilterOff,
  ArrowUp,
  ArrowDown,
  ArrowClockwise,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FloppyDisk,
  Search,
  Settings,
  User,
  UserCheck,
  Eye,
  EyeSlash,
  Pencil,
  Calendar,
  Clock,
  Mail,
  Bell,
  Star,
  Heart,
  Share,
}

/**
 * Category-based component groups for easier lookup
 */
export const FAKEMUI_CATEGORIES = {
  form: [
    'Button', 'ButtonGroup', 'IconButton', 'Fab', 'Input', 'Textarea',
    'Select', 'NativeSelect', 'Checkbox', 'Radio', 'RadioGroup', 'Switch',
    'Slider', 'FormControl', 'FormGroup', 'FormLabel', 'FormHelperText',
    'TextField', 'ToggleButton', 'ToggleButtonGroup', 'Autocomplete',
    'Rating', 'DatePicker', 'TimePicker', 'ColorPicker', 'FileUpload',
    'FormField', 'LoadingButton',
  ],

  display: [
    'Typography', 'Avatar', 'AvatarGroup', 'Badge', 'Chip', 'Divider',
    'List', 'ListItem', 'ListItemButton', 'ListItemText', 'ListItemIcon',
    'ListItemAvatar', 'ListSubheader', 'Tooltip', 'Text', 'Title',
    'Label', 'StatBadge', 'Icon',
  ],

  layout: [
    'Box', 'Container', 'Grid', 'Stack', 'Flex', 'ImageList',
    'ImageListItem', 'ImageListItemBar', 'Masonry', 'Section',
    'AutoGrid', 'Paper', 'Card', 'CardHeader', 'CardContent',
    'CardActions', 'CardActionArea', 'CardMedia', 'Panel',
  ],

  navigation: [
    'Breadcrumbs', 'Link', 'Menu', 'MenuItem', 'MenuList',
    'Pagination', 'PaginationItem', 'Stepper', 'Step', 'StepLabel',
    'StepButton', 'StepContent', 'StepConnector', 'StepIcon',
    'Tabs', 'Tab', 'BottomNavigation', 'BottomNavigationAction',
    'SpeedDial', 'SpeedDialAction', 'SpeedDialIcon', 'Timeline',
  ],

  modal: [
    'Modal', 'Popover', 'Popper', 'Portal', 'Drawer', 'Accordion',
    'AccordionSummary', 'AccordionDetails', 'AccordionActions',
    'AppBar', 'Toolbar',
  ],

  table: [
    'Table', 'TableBody', 'TableCell', 'TableContainer',
    'TableHead', 'TableRow', 'TableFooter', 'TablePagination',
    'TableSortLabel', 'DataGrid',
  ],

  custom: [
    'Alert', 'Backdrop', 'Skeleton', 'Snackbar', 'States',
    'EditorWrapper', 'ClickAwayListener', 'CssBaseline',
    'GlobalStyles', 'NoSsr', 'TreeView',
  ],

  icons: [
    'Icon', 'Plus', 'Trash', 'Copy', 'Check', 'XIcon', 'Filter',
    'FilterOff', 'ArrowUp', 'ArrowDown', 'ArrowClockwise',
    'ChevronUp', 'ChevronDown', 'ChevronLeft', 'ChevronRight',
    'FloppyDisk', 'Search', 'Settings', 'User', 'UserCheck',
    'Eye', 'EyeSlash', 'Pencil', 'Calendar', 'Clock', 'Mail',
    'Bell', 'Star', 'Heart', 'Share',
  ],
}

/**
 * Helper to get a component by name
 */
export function getFakemUIComponent(componentName: string): React.ComponentType<any> | null {
  return FAKEMUI_REGISTRY[componentName] ?? null
}

/**
 * Helper to get all components in a category
 */
export function getFakemUICategoryComponents(category: keyof typeof FAKEMUI_CATEGORIES): React.ComponentType<any>[] {
  const componentNames = FAKEMUI_CATEGORIES[category] ?? []
  return componentNames
    .map(name => FAKEMUI_REGISTRY[name])
    .filter((comp): comp is React.ComponentType<any> => comp !== undefined)
}

/**
 * Helper to list all available categories
 */
export function getFakemUICategories(): string[] {
  return Object.keys(FAKEMUI_CATEGORIES)
}

/**
 * Helper to verify if a component exists
 */
export function isFakemUIComponentAvailable(componentName: string): boolean {
  return componentName in FAKEMUI_REGISTRY
}

/**
 * Statistics about available components
 */
export const FAKEMUI_STATS = {
  totalComponents: Object.keys(FAKEMUI_REGISTRY).length,
  categories: Object.keys(FAKEMUI_CATEGORIES).length,
  byCategory: Object.entries(FAKEMUI_CATEGORIES).reduce(
    (acc, [cat, comps]) => ({ ...acc, [cat]: comps.length }),
    {} as Record<string, number>
  ),
}
