/**
 * Fakemui Component Registry (Lazy Loaded)
 *
 * Lazy-loads fakemui components to avoid importing them in server contexts.
 * This registry maps component names to dynamic import functions.
 *
 * Components are exported from the main fakemui package, which re-exports
 * from react/components/* subdirectories.
 */

'use client'

import { lazy, ComponentType } from 'react'

/**
 * Lazy-load a component with error boundary
 */
const lazyComponent = (importFn: () => Promise<{ default: ComponentType<any> | any }>) => {
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
  Button: lazyComponent(() => import('fakemui').then(m => ({ default: m.Button }))),
  ButtonGroup: lazyComponent(() => import('fakemui').then(m => ({ default: m.ButtonGroup }))),
  IconButton: lazyComponent(() => import('fakemui').then(m => ({ default: m.IconButton }))),
  Fab: lazyComponent(() => import('fakemui').then(m => ({ default: m.Fab }))),
  Input: lazyComponent(() => import('fakemui').then(m => ({ default: m.Input }))),
  Textarea: lazyComponent(() => import('fakemui').then(m => ({ default: m.Textarea }))),
  Select: lazyComponent(() => import('fakemui').then(m => ({ default: m.Select }))),
  NativeSelect: lazyComponent(() => import('fakemui').then(m => ({ default: m.NativeSelect }))),
  Checkbox: lazyComponent(() => import('fakemui').then(m => ({ default: m.Checkbox }))),
  Radio: lazyComponent(() => import('fakemui').then(m => ({ default: m.Radio }))),
  RadioGroup: lazyComponent(() => import('fakemui').then(m => ({ default: m.RadioGroup }))),
  Switch: lazyComponent(() => import('fakemui').then(m => ({ default: m.Switch }))),
  Slider: lazyComponent(() => import('fakemui').then(m => ({ default: m.Slider }))),
  FormControl: lazyComponent(() => import('fakemui').then(m => ({ default: m.FormControl }))),
  FormGroup: lazyComponent(() => import('fakemui').then(m => ({ default: m.FormGroup }))),
  FormLabel: lazyComponent(() => import('fakemui').then(m => ({ default: m.FormLabel }))),
  FormHelperText: lazyComponent(() => import('fakemui').then(m => ({ default: m.FormHelperText }))),
  TextField: lazyComponent(() => import('fakemui').then(m => ({ default: m.TextField }))),
  ToggleButton: lazyComponent(() => import('fakemui').then(m => ({ default: m.ToggleButton }))),
  ToggleButtonGroup: lazyComponent(() => import('fakemui').then(m => ({ default: m.ToggleButtonGroup }))),
  Autocomplete: lazyComponent(() => import('fakemui').then(m => ({ default: m.Autocomplete }))),
  Rating: lazyComponent(() => import('fakemui').then(m => ({ default: m.Rating }))),
  DatePicker: lazyComponent(() => import('fakemui').then(m => ({ default: m.DatePicker }))),
  TimePicker: lazyComponent(() => import('fakemui').then(m => ({ default: m.TimePicker }))),
  ColorPicker: lazyComponent(() => import('fakemui').then(m => ({ default: m.ColorPicker }))),
  FileUpload: lazyComponent(() => import('fakemui').then(m => ({ default: m.FileUpload }))),
  FormField: lazyComponent(() => import('fakemui').then(m => ({ default: m.FormField }))),

  // Surfaces / Containers (10)
  Paper: lazyComponent(() => import('fakemui').then(m => ({ default: m.Paper }))),
  Card: lazyComponent(() => import('fakemui').then(m => ({ default: m.Card }))),
  CardHeader: lazyComponent(() => import('fakemui').then(m => ({ default: m.CardHeader }))),
  CardContent: lazyComponent(() => import('fakemui').then(m => ({ default: m.CardContent }))),
  CardActions: lazyComponent(() => import('fakemui').then(m => ({ default: m.CardActions }))),
  CardActionArea: lazyComponent(() => import('fakemui').then(m => ({ default: m.CardActionArea }))),
  CardMedia: lazyComponent(() => import('fakemui').then(m => ({ default: m.CardMedia }))),
  Accordion: lazyComponent(() => import('fakemui').then(m => ({ default: m.Accordion }))),
  AccordionSummary: lazyComponent(() => import('fakemui').then(m => ({ default: m.AccordionSummary }))),
  AccordionDetails: lazyComponent(() => import('fakemui').then(m => ({ default: m.AccordionDetails }))),
  AccordionActions: lazyComponent(() => import('fakemui').then(m => ({ default: m.AccordionActions }))),
  AppBar: lazyComponent(() => import('fakemui').then(m => ({ default: m.AppBar }))),
  Toolbar: lazyComponent(() => import('fakemui').then(m => ({ default: m.Toolbar }))),
  Drawer: lazyComponent(() => import('fakemui').then(m => ({ default: m.Drawer }))),

  // Layout (18)
  Box: lazyComponent(() => import('fakemui').then(m => ({ default: m.Box }))),
  Container: lazyComponent(() => import('fakemui').then(m => ({ default: m.Container }))),
  Grid: lazyComponent(() => import('fakemui').then(m => ({ default: m.Grid }))),
  Stack: lazyComponent(() => import('fakemui').then(m => ({ default: m.Stack }))),
  Flex: lazyComponent(() => import('fakemui').then(m => ({ default: m.Flex }))),
  ImageList: lazyComponent(() => import('fakemui').then(m => ({ default: m.ImageList }))),
  ImageListItem: lazyComponent(() => import('fakemui').then(m => ({ default: m.ImageListItem }))),
  ImageListItemBar: lazyComponent(() => import('fakemui').then(m => ({ default: m.ImageListItemBar }))),

  // Data Display (26)
  Typography: lazyComponent(() => import('fakemui').then(m => ({ default: m.Typography }))),
  Avatar: lazyComponent(() => import('fakemui').then(m => ({ default: m.Avatar }))),
  AvatarGroup: lazyComponent(() => import('fakemui').then(m => ({ default: m.AvatarGroup }))),
  Badge: lazyComponent(() => import('fakemui').then(m => ({ default: m.Badge }))),
  Chip: lazyComponent(() => import('fakemui').then(m => ({ default: m.Chip }))),
  Divider: lazyComponent(() => import('fakemui').then(m => ({ default: m.Divider }))),
  List: lazyComponent(() => import('fakemui').then(m => ({ default: m.List }))),
  ListItem: lazyComponent(() => import('fakemui').then(m => ({ default: m.ListItem }))),
  ListItemButton: lazyComponent(() => import('fakemui').then(m => ({ default: m.ListItemButton }))),
  ListItemText: lazyComponent(() => import('fakemui').then(m => ({ default: m.ListItemText }))),
  ListItemIcon: lazyComponent(() => import('fakemui').then(m => ({ default: m.ListItemIcon }))),
  ListItemAvatar: lazyComponent(() => import('fakemui').then(m => ({ default: m.ListItemAvatar }))),
  ListSubheader: lazyComponent(() => import('fakemui').then(m => ({ default: m.ListSubheader }))),
  Table: lazyComponent(() => import('fakemui').then(m => ({ default: m.Table }))),
  TableBody: lazyComponent(() => import('fakemui').then(m => ({ default: m.TableBody }))),
  TableCell: lazyComponent(() => import('fakemui').then(m => ({ default: m.TableCell }))),
  TableContainer: lazyComponent(() => import('fakemui').then(m => ({ default: m.TableContainer }))),
  TableHead: lazyComponent(() => import('fakemui').then(m => ({ default: m.TableHead }))),
  TableRow: lazyComponent(() => import('fakemui').then(m => ({ default: m.TableRow }))),
  TableFooter: lazyComponent(() => import('fakemui').then(m => ({ default: m.TableFooter }))),
  TablePagination: lazyComponent(() => import('fakemui').then(m => ({ default: m.TablePagination }))),
  TableSortLabel: lazyComponent(() => import('fakemui').then(m => ({ default: m.TableSortLabel }))),
  Tooltip: lazyComponent(() => import('fakemui').then(m => ({ default: m.Tooltip }))),

  // Feedback (6)
  Alert: lazyComponent(() => import('fakemui').then(m => ({ default: m.Alert }))),
  Backdrop: lazyComponent(() => import('fakemui').then(m => ({ default: m.Backdrop }))),
  Skeleton: lazyComponent(() => import('fakemui').then(m => ({ default: m.Skeleton }))),
  Snackbar: lazyComponent(() => import('fakemui').then(m => ({ default: m.Snackbar }))),
  CircularProgress: lazyComponent(() => import('fakemui').then(m => ({ default: m.CircularProgress }))),
  LinearProgress: lazyComponent(() => import('fakemui').then(m => ({ default: m.LinearProgress }))),

  // Navigation (22)
  Breadcrumbs: lazyComponent(() => import('fakemui').then(m => ({ default: m.Breadcrumbs }))),
  Link: lazyComponent(() => import('fakemui').then(m => ({ default: m.Link }))),
  Menu: lazyComponent(() => import('fakemui').then(m => ({ default: m.Menu }))),
  MenuItem: lazyComponent(() => import('fakemui').then(m => ({ default: m.MenuItem }))),
  MenuList: lazyComponent(() => import('fakemui').then(m => ({ default: m.MenuList }))),
  Pagination: lazyComponent(() => import('fakemui').then(m => ({ default: m.Pagination }))),
  PaginationItem: lazyComponent(() => import('fakemui').then(m => ({ default: m.PaginationItem }))),
  Stepper: lazyComponent(() => import('fakemui').then(m => ({ default: m.Stepper }))),
  Step: lazyComponent(() => import('fakemui').then(m => ({ default: m.Step }))),
  StepLabel: lazyComponent(() => import('fakemui').then(m => ({ default: m.StepLabel }))),
  StepButton: lazyComponent(() => import('fakemui').then(m => ({ default: m.StepButton }))),
  StepContent: lazyComponent(() => import('fakemui').then(m => ({ default: m.StepContent }))),
  StepConnector: lazyComponent(() => import('fakemui').then(m => ({ default: m.StepConnector }))),
  StepIcon: lazyComponent(() => import('fakemui').then(m => ({ default: m.StepIcon }))),
  Tabs: lazyComponent(() => import('fakemui').then(m => ({ default: m.Tabs }))),
  Tab: lazyComponent(() => import('fakemui').then(m => ({ default: m.Tab }))),
  BottomNavigation: lazyComponent(() => import('fakemui').then(m => ({ default: m.BottomNavigation }))),
  BottomNavigationAction: lazyComponent(() => import('fakemui').then(m => ({ default: m.BottomNavigationAction }))),
  SpeedDial: lazyComponent(() => import('fakemui').then(m => ({ default: m.SpeedDial }))),
  SpeedDialAction: lazyComponent(() => import('fakemui').then(m => ({ default: m.SpeedDialAction }))),
  SpeedDialIcon: lazyComponent(() => import('fakemui').then(m => ({ default: m.SpeedDialIcon }))),

  // Utils / Modals (10)
  Modal: lazyComponent(() => import('fakemui').then(m => ({ default: m.Modal }))),
  Popover: lazyComponent(() => import('fakemui').then(m => ({ default: m.Popover }))),
  Popper: lazyComponent(() => import('fakemui').then(m => ({ default: m.Popper }))),
  Portal: lazyComponent(() => import('fakemui').then(m => ({ default: m.Portal }))),
  ClickAwayListener: lazyComponent(() => import('fakemui').then(m => ({ default: m.ClickAwayListener }))),
  CssBaseline: lazyComponent(() => import('fakemui').then(m => ({ default: m.CssBaseline }))),
  GlobalStyles: lazyComponent(() => import('fakemui').then(m => ({ default: m.GlobalStyles }))),
  NoSsr: lazyComponent(() => import('fakemui').then(m => ({ default: m.NoSsr }))),
  TextareaAutosize: lazyComponent(() => import('fakemui').then(m => ({ default: m.TextareaAutosize }))),
  Fade: lazyComponent(() => import('fakemui').then(m => ({ default: m.Fade }))),
  Grow: lazyComponent(() => import('fakemui').then(m => ({ default: m.Grow }))),
  Slide: lazyComponent(() => import('fakemui').then(m => ({ default: m.Slide }))),
  Zoom: lazyComponent(() => import('fakemui').then(m => ({ default: m.Zoom }))),
  Collapse: lazyComponent(() => import('fakemui').then(m => ({ default: m.Collapse }))),

  // Atoms (9)
  Text: lazyComponent(() => import('fakemui').then(m => ({ default: m.Text }))),
  Title: lazyComponent(() => import('fakemui').then(m => ({ default: m.Title }))),
  Label: lazyComponent(() => import('fakemui').then(m => ({ default: m.Label }))),
  Panel: lazyComponent(() => import('fakemui').then(m => ({ default: m.Panel }))),
  Section: lazyComponent(() => import('fakemui').then(m => ({ default: m.Section }))),
  StatBadge: lazyComponent(() => import('fakemui').then(m => ({ default: m.StatBadge }))),
  States: lazyComponent(() => import('fakemui').then(m => ({ default: m.States }))),
  EditorWrapper: lazyComponent(() => import('fakemui').then(m => ({ default: m.EditorWrapper }))),
  AutoGrid: lazyComponent(() => import('fakemui').then(m => ({ default: m.AutoGrid }))),

  // Lab / Experimental (11)
  LoadingButton: lazyComponent(() => import('fakemui').then(m => ({ default: m.LoadingButton }))),
  Masonry: lazyComponent(() => import('fakemui').then(m => ({ default: m.Masonry }))),
  Timeline: lazyComponent(() => import('fakemui').then(m => ({ default: m.Timeline }))),
  TimelineItem: lazyComponent(() => import('fakemui').then(m => ({ default: m.TimelineItem }))),
  TimelineSeparator: lazyComponent(() => import('fakemui').then(m => ({ default: m.TimelineSeparator }))),
  TimelineDot: lazyComponent(() => import('fakemui').then(m => ({ default: m.TimelineDot }))),
  TimelineConnector: lazyComponent(() => import('fakemui').then(m => ({ default: m.TimelineConnector }))),
  TimelineContent: lazyComponent(() => import('fakemui').then(m => ({ default: m.TimelineContent }))),
  TimelineOppositeContent: lazyComponent(() => import('fakemui').then(m => ({ default: m.TimelineOppositeContent }))),
  TreeView: lazyComponent(() => import('fakemui').then(m => ({ default: m.TreeViewComponent }))),
  TreeItem: lazyComponent(() => import('fakemui').then(m => ({ default: m.TreeItem }))),

  // X / Advanced (1)
  DataGrid: lazyComponent(() => import('fakemui').then(m => ({ default: m.DataGrid }))),

  // Icons (30+)
  Icon: lazyComponent(() => import('fakemui').then(m => ({ default: m.Icon }))),
  Plus: lazyComponent(() => import('fakemui').then(m => ({ default: m.Plus }))),
  Trash: lazyComponent(() => import('fakemui').then(m => ({ default: m.Trash }))),
  Copy: lazyComponent(() => import('fakemui').then(m => ({ default: m.Copy }))),
  Check: lazyComponent(() => import('fakemui').then(m => ({ default: m.Check }))),
  X: lazyComponent(() => import('fakemui').then(m => ({ default: m.X }))),
  Filter: lazyComponent(() => import('fakemui').then(m => ({ default: m.Filter }))),
  FilterOff: lazyComponent(() => import('fakemui').then(m => ({ default: m.FilterOff }))),
  ArrowUp: lazyComponent(() => import('fakemui').then(m => ({ default: m.ArrowUp }))),
  ArrowDown: lazyComponent(() => import('fakemui').then(m => ({ default: m.ArrowDown }))),
  ArrowClockwise: lazyComponent(() => import('fakemui').then(m => ({ default: m.ArrowClockwise }))),
  ChevronUp: lazyComponent(() => import('fakemui').then(m => ({ default: m.ChevronUp }))),
  ChevronDown: lazyComponent(() => import('fakemui').then(m => ({ default: m.ChevronDown }))),
  ChevronLeft: lazyComponent(() => import('fakemui').then(m => ({ default: m.ChevronLeft }))),
  ChevronRight: lazyComponent(() => import('fakemui').then(m => ({ default: m.ChevronRight }))),
  FloppyDisk: lazyComponent(() => import('fakemui').then(m => ({ default: m.FloppyDisk }))),
  Search: lazyComponent(() => import('fakemui').then(m => ({ default: m.Search }))),
  Settings: lazyComponent(() => import('fakemui').then(m => ({ default: m.Settings }))),
  User: lazyComponent(() => import('fakemui').then(m => ({ default: m.User }))),
  UserCheck: lazyComponent(() => import('fakemui').then(m => ({ default: m.UserCheck }))),
  MenuIcon: lazyComponent(() => import('fakemui').then(m => ({ default: m.MenuIcon }))),
  Eye: lazyComponent(() => import('fakemui').then(m => ({ default: m.Eye }))),
  EyeSlash: lazyComponent(() => import('fakemui').then(m => ({ default: m.EyeSlash }))),
  Pencil: lazyComponent(() => import('fakemui').then(m => ({ default: m.Pencil }))),
  Calendar: lazyComponent(() => import('fakemui').then(m => ({ default: m.Calendar }))),
  Clock: lazyComponent(() => import('fakemui').then(m => ({ default: m.Clock }))),
  Mail: lazyComponent(() => import('fakemui').then(m => ({ default: m.Mail }))),
  Bell: lazyComponent(() => import('fakemui').then(m => ({ default: m.Bell }))),
  Star: lazyComponent(() => import('fakemui').then(m => ({ default: m.Star }))),
  Heart: lazyComponent(() => import('fakemui').then(m => ({ default: m.Heart }))),
  Share: lazyComponent(() => import('fakemui').then(m => ({ default: m.Share }))),
}

/**
 * Helper hook to get a component from the registry
 */
export function useFakeMuiComponent(name: keyof typeof FAKEMUI_REGISTRY) {
  return FAKEMUI_REGISTRY[name]
}
