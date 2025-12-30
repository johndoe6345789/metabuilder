/**
 * Maps Lua component type names to fakemui React components
 * Used by the declarative renderer to resolve component types from Lua packages
 */

import type { ComponentType, FC } from 'react'

// Import Icon component from atoms
import { Icon } from '@/components/atoms/display/Icon'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AppBar,
  Autocomplete,
  Avatar,
  Backdrop,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  ColorPicker,
  Container,
  // New components
  DatePicker,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  FileUpload,
  Flex,
  FormControl,
  FormField,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  NativeSelect,
  Pagination,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Skeleton,
  Slider,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Textarea,
  TextField,
  TimePicker,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from '@/fakemui'

// Type helper to cast components to generic LuaComponentProps
 
// Type helper to cast components to generic LuaComponentProps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>

/**
 * Type definition for component props from Lua
 */
export interface LuaComponentProps {
  [key: string]: unknown
  children?: React.ReactNode
}

/**
 * Component registry mapping Lua type names to React components
 * Components are cast to AnyComponent to allow flexible prop passing from Lua
 */
export const componentRegistry: Record<string, AnyComponent> = {
  // Layout
  Box,
  Stack,
  Grid,
  Container,
  Flex,

  // Surfaces
  Paper,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardTitle: CardHeader, // Alias
  CardFooter: CardActions, // Alias
  Drawer,
  Modal,
  Backdrop,
  Popover,

  // Inputs
  Button,
  IconButton,
  ButtonGroup,
  Input,
  TextField,
  TextArea: Textarea,
  Textarea,
  Select,
  NativeSelect,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  // New inputs
  DatePicker,
  TimePicker,
  ColorPicker,
  FileUpload,
  Fab,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Rating,
  FormField,

  // Form elements
  FormControl,
  FormGroup,
  FormLabel,
  FormHelperText,

  // Typography & Data Display
  Typography,
  Text: Typography,
  Avatar,
  Badge,
  Chip,
  Divider,

  // Lists
  List,
  ListItem,
  ListItemText,
  ListItemIcon,

  // Tables
  Table,
  TableHead,
  TableHeader: TableHead, // Alias
  TableBody,
  TableRow,
  TableCell,
  TableContainer,

  // Navigation
  Tabs,
  Tab,
  TabsList: Tabs, // Map to Tabs container
  TabsTrigger: Tab, // Map to Tab
  TabsContent: Box, // Content wrapper
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  Pagination,
  Stepper,
  Step,
  StepLabel,

  // Feedback
  Alert,
  Snackbar,
  Toast: Snackbar, // Alias
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Progress: LinearProgress, // Alias
  Spinner: CircularProgress, // Alias
  Skeleton,

  // Surfaces
  AppBar,
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,

  // Utils
  Tooltip,

  // Icons
  Icon,
}

/**
 * Get a React component by its Lua type name
 * @param typeName - The component type name from Lua
 * @returns The corresponding React component or undefined
 */
export function getComponentByType(typeName: string): ComponentType<LuaComponentProps> | undefined {
  return componentRegistry[typeName]
}

/**
 * Check if a component type is registered
 * @param typeName - The component type name to check
 * @returns True if the component is registered
 */
export function hasComponent(typeName: string): boolean {
  return typeName in componentRegistry
}

/**
 * Get all registered component type names
 * @returns Array of component type names
 */
export function getRegisteredComponentTypes(): string[] {
  return Object.keys(componentRegistry)
}

/**
 * Register a custom component for Lua rendering
 * @param typeName - The type name to use in Lua
 * @param component - The React component to render
 */
export function registerComponent(typeName: string, component: ComponentType<LuaComponentProps>): void {
  componentRegistry[typeName] = component
}
