/**
 * Fakemui Component Registry (Lazy Loaded)
 *
 * Lazy-loads fakemui components to avoid importing them in server contexts.
 * This registry maps component names to dynamic import functions.
 */

'use client'

import { lazy, ComponentType } from 'react'

/**
 * Lazy-load a component with error boundary
 */
const lazyComponent = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  return lazy(importFn)
}

/**
 * FAKEMUI_REGISTRY
 * Maps component names to lazy-loaded React components
 *
 * Usage in client component:
 * ```tsx
 * import { FAKEMUI_REGISTRY } from '@/lib/fakemui-registry'
 * const Component = FAKEMUI_REGISTRY['Button']
 * return <Component {...props} />
 * ```
 */
export const FAKEMUI_REGISTRY: Record<string, ComponentType<any>> = {
  // Inputs / Form Controls (28)
  Button: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Button }))),
  ButtonGroup: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.ButtonGroup }))),
  IconButton: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.IconButton }))),
  Fab: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Fab }))),
  Input: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Input }))),
  Textarea: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Textarea }))),
  Select: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Select }))),
  NativeSelect: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.NativeSelect }))),
  Checkbox: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Checkbox }))),
  Radio: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Radio }))),
  RadioGroup: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.RadioGroup }))),
  Switch: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Switch }))),
  Slider: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Slider }))),
  FormControl: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.FormControl }))),
  FormGroup: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.FormGroup }))),
  FormLabel: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.FormLabel }))),
  FormHelperText: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.FormHelperText }))),
  TextField: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.TextField }))),
  ToggleButton: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.ToggleButton }))),
  ToggleButtonGroup: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.ToggleButtonGroup }))),
  Autocomplete: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Autocomplete }))),
  Rating: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.Rating }))),
  DatePicker: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.DatePicker }))),
  TimePicker: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.TimePicker }))),
  ColorPicker: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.ColorPicker }))),
  FileUpload: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.FileUpload }))),
  FormField: lazyComponent(() => import('@/fakemui/fakemui/inputs').then(m => ({ default: m.FormField }))),

  // Surfaces / Containers (10)
  Paper: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.Paper }))),
  Card: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.Card }))),
  CardHeader: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.CardHeader }))),
  CardContent: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.CardContent }))),
  CardActions: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.CardActions }))),
  CardActionArea: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.CardActionArea }))),
  CardMedia: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.CardMedia }))),
  Accordion: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.Accordion }))),
  AccordionSummary: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.AccordionSummary }))),
  AccordionDetails: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.AccordionDetails }))),
  AccordionActions: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.AccordionActions }))),
  AppBar: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.AppBar }))),
  Toolbar: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.Toolbar }))),
  Drawer: lazyComponent(() => import('@/fakemui/fakemui/surfaces').then(m => ({ default: m.Drawer }))),

  // Layout (18)
  Box: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.Box }))),
  Container: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.Container }))),
  Grid: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.Grid }))),
  Stack: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.Stack }))),
  Flex: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.Flex }))),
  ImageList: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.ImageList }))),
  ImageListItem: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.ImageListItem }))),
  ImageListItemBar: lazyComponent(() => import('@/fakemui/fakemui/layout').then(m => ({ default: m.ImageListItemBar }))),

  // Data Display (26)
  Typography: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.Typography }))),
  Avatar: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.Avatar }))),
  AvatarGroup: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.AvatarGroup }))),
  Badge: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.Badge }))),
  Chip: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.Chip }))),
  Divider: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.Divider }))),
  List: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.List }))),
  ListItem: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.ListItem }))),
  ListItemButton: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.ListItemButton }))),
  ListItemText: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.ListItemText }))),
  ListItemIcon: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.ListItemIcon }))),
  ListItemAvatar: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.ListItemAvatar }))),
  ListSubheader: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.ListSubheader }))),
  Table: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.Table }))),
  TableBody: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TableBody }))),
  TableCell: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TableCell }))),
  TableContainer: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TableContainer }))),
  TableHead: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TableHead }))),
  TableRow: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TableRow }))),
  TableFooter: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TableFooter }))),
  TablePagination: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TablePagination }))),
  TableSortLabel: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.TableSortLabel }))),
  Tooltip: lazyComponent(() => import('@/fakemui/fakemui/data-display').then(m => ({ default: m.Tooltip }))),

  // Feedback (6)
  Alert: lazyComponent(() => import('@/fakemui/fakemui/feedback').then(m => ({ default: m.Alert }))),
  Backdrop: lazyComponent(() => import('@/fakemui/fakemui/feedback').then(m => ({ default: m.Backdrop }))),
  Skeleton: lazyComponent(() => import('@/fakemui/fakemui/feedback').then(m => ({ default: m.Skeleton }))),
  Snackbar: lazyComponent(() => import('@/fakemui/fakemui/feedback').then(m => ({ default: m.Snackbar }))),
  CircularProgress: lazyComponent(() => import('@/fakemui/fakemui/feedback').then(m => ({ default: m.CircularProgress }))),
  LinearProgress: lazyComponent(() => import('@/fakemui/fakemui/feedback').then(m => ({ default: m.LinearProgress }))),

  // Navigation (22)
  Breadcrumbs: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Breadcrumbs }))),
  Link: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Link }))),
  Menu: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Menu }))),
  MenuItem: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.MenuItem }))),
  MenuList: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.MenuList }))),
  Pagination: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Pagination }))),
  PaginationItem: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.PaginationItem }))),
  Stepper: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Stepper }))),
  Step: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Step }))),
  StepLabel: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.StepLabel }))),
  StepButton: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.StepButton }))),
  StepContent: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.StepContent }))),
  StepConnector: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.StepConnector }))),
  StepIcon: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.StepIcon }))),
  Tabs: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Tabs }))),
  Tab: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.Tab }))),
  BottomNavigation: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.BottomNavigation }))),
  BottomNavigationAction: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.BottomNavigationAction }))),
  SpeedDial: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.SpeedDial }))),
  SpeedDialAction: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.SpeedDialAction }))),
  SpeedDialIcon: lazyComponent(() => import('@/fakemui/fakemui/navigation').then(m => ({ default: m.SpeedDialIcon }))),

  // Utils / Modals (10)
  Modal: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.Modal }))),
  Popover: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.Popover }))),
  Popper: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.Popper }))),
  Portal: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.Portal }))),
  ClickAwayListener: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.ClickAwayListener }))),
  CssBaseline: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.CssBaseline }))),
  GlobalStyles: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.GlobalStyles }))),
  NoSsr: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.NoSsr }))),
  TextareaAutosize: lazyComponent(() => import('@/fakemui/fakemui/utils').then(m => ({ default: m.TextareaAutosize }))),
}

/**
 * Check if a component is available in the registry
 */
export function isFakemUIComponentAvailable(name: string): boolean {
  return name in FAKEMUI_REGISTRY
}

/**
 * Get a component from the registry
 */
export function getFakemUIComponent(name: string): ComponentType<any> | undefined {
  return FAKEMUI_REGISTRY[name]
}
