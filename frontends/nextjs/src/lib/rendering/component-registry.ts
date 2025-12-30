/**
 * Maps Lua component type names to fakemui React components
 * Used by the declarative renderer to resolve component types from Lua packages
 */

import {
  Box,
  Stack,
  Grid,
  Container,
  Flex,
  Paper,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Input,
  TextField,
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
  ButtonGroup,
  Typography,
  Avatar,
  Badge,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  Tooltip,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  Pagination,
  // New components
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
  Drawer,
  Modal,
  Backdrop,
  Popover,
} from '@/fakemui'

import type { ComponentType } from 'react'

/**
 * Type definition for component props from Lua
 */
export interface LuaComponentProps {
  [key: string]: unknown
  children?: React.ReactNode
}

/**
 * Component registry mapping Lua type names to React components
 */
export const componentRegistry: Record<string, ComponentType<LuaComponentProps>> = {
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
