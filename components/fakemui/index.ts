/**
 * FakeMUI Components - Material Design 3 React Component Library
 *
 * This barrel export provides all FakeMUI components from the centralized
 * components/fakemui/ location. Components are organized by category.
 *
 * Usage:
 *   import { Button, Card, Typography } from '@metabuilder/components/fakemui'
 */

// =============================================================================
// ICONS
// =============================================================================
export * from '../../icons/react/fakemui'

// =============================================================================
// INPUT COMPONENTS
// =============================================================================
export {
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
  useRadioGroup,
  Switch,
  Slider,
  FormControl,
  useFormControl,
  FormGroup,
  FormLabel,
  FormHelperText,
  InputLabel,
  FormControlLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Rating,
  ButtonBase,
  InputBase,
  FilledInput,
  OutlinedInput,
  FormField,
  DatePicker,
  TimePicker,
  ColorPicker,
  FileUpload,
} from './inputs'

export type { RadioProps, RadioColor, RadioSize } from './inputs'
export type { SelectChangeEvent } from './inputs/Select'

// =============================================================================
// SURFACE COMPONENTS
// =============================================================================
export {
  Paper,
  type PaperProps,
  Card,
  type CardProps,
  CardHeader,
  type CardHeaderProps,
  CardContent,
  type CardContentProps,
  CardActions,
  type CardActionsProps,
  CardActionArea,
  CardMedia,
  type CardMediaProps,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  AppBar,
  type AppBarProps,
  Toolbar,
  type ToolbarProps,
  Drawer,
  type DrawerProps,
} from './surfaces'

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================
export {
  Box,
  type BoxProps,
  Container,
  type ContainerProps,
  Grid,
  type GridProps,
  Stack,
  type StackProps,
  Flex,
  type FlexProps,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from './layout'

// =============================================================================
// DATA DISPLAY COMPONENTS
// =============================================================================
export {
  Typography,
  Avatar,
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
  AvatarGroup,
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
  Markdown,
  Separator,
} from './data-display'

// =============================================================================
// FEEDBACK COMPONENTS
// =============================================================================
export {
  Alert,
  AlertTitle,
  AlertDescription,
  Backdrop,
  CircularProgress,
  Dialog,
  LinearProgress,
  Progress,
  Skeleton,
  Snackbar,
  SnackbarContent,
  Spinner,
  MarkdownDisplay,
  ErrorDisplay,
  LoadingContent,
  NotificationContainer,
  toast,
  Toaster,
} from './feedback'
export type { ToasterProps } from './feedback'
export type {
  NotificationData,
  NotificationPosition,
  NotificationType,
  NotificationContainerProps,
} from './feedback'

// =============================================================================
// NAVIGATION COMPONENTS
// =============================================================================
export {
  Breadcrumbs,
  type BreadcrumbsProps,
  type BreadcrumbItem,
  Link,
  type LinkProps,
  Menu,
  MenuItem,
  MenuList,
  type MenuProps,
  type MenuItemProps,
  type MenuListProps,
  Pagination,
  PaginationItem,
  type PaginationProps,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  StepContent,
  StepConnector,
  StepIcon,
  Tabs,
  Tab,
  TabPanel,
  type TabsProps,
  type TabProps,
  type TabPanelProps,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  ProjectSidebar,
  type ProjectSidebarProps,
  type ProjectSidebarItem,
  type ProjectSidebarWorkspace,
} from './navigation'

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================
export {
  Modal,
  DialogOverlay,
  DialogPanel,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogClose,
  DialogIcon,
  Popover,
  Popper,
  Portal,
  ClickAwayListener,
  CssBaseline,
  ScopedCssBaseline,
  GlobalStyles,
  NoSsr,
  TextareaAutosize,
  Fade,
  Grow,
  Slide,
  Zoom,
  Collapse,
  useMediaQuery,
  useMediaQueryUp,
  useMediaQueryDown,
  useMediaQueryBetween,
  ToastProvider,
  useToast,
  Iframe,
  classNames,
} from './utils'

// =============================================================================
// ATOM COMPONENTS
// =============================================================================
export {
  Text,
  Title,
  Label,
  Panel,
  Section,
  StatBadge,
  States,
  EditorWrapper,
  AutoGrid,
} from './atoms'

// =============================================================================
// LAB (EXPERIMENTAL) COMPONENTS
// =============================================================================
export {
  LoadingButton,
  Masonry,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TreeItem,
} from './lab'

// =============================================================================
// X (ADVANCED/PREMIUM) COMPONENTS
// =============================================================================
export {
  DataGrid,
  DataGridPro,
  DataGridPremium,
  DatePicker as DatePickerAdvanced,
  TimePicker as TimePickerAdvanced,
  DateTimePicker,
  DesktopDatePicker,
  MobileDatePicker,
  StaticDatePicker,
  CalendarPicker,
  ClockPicker,
} from './x'

// =============================================================================
// THEMING
// =============================================================================
export type { Theme, ThemeOptions } from './theming'

// =============================================================================
// EMAIL COMPONENTS (22 components - Phase 2 Complete)
// =============================================================================
export * from './email'

// =============================================================================
// WORKFLOW COMPONENTS
// =============================================================================
export * from './workflows'

// =============================================================================
// DATABASE ADMIN COMPONENTS (10 components)
// =============================================================================
export {
  // Grids
  DataGrid as DatabaseDataGrid,
  type DataGridProps as DatabaseDataGridProps,
  type DataGridColumn,
  // Dialogs
  ConfirmDialog,
  type ConfirmDialogProps,
  FormDialog,
  type FormDialogProps,
  type FormDialogField,
  CreateTableDialog,
  type CreateTableDialogProps,
  type TableColumn,
  DropTableDialog,
  type DropTableDialogProps,
  ColumnDialog,
  type ColumnDialogProps,
  type ColumnDialogMode,
  type ColumnInfo,
  ConstraintDialog,
  type ConstraintDialogProps,
  type ConstraintDialogMode,
  type ConstraintType,
  type ConstraintInfo,
  // Tables
  TablesTab,
  type TablesTabProps,
  type TableInfo,
  // Queries
  SQLQueryTab,
  type SQLQueryTabProps,
  QueryBuilderTab,
  type QueryBuilderTabProps,
  type QueryBuilderParams,
  type QueryResult,
  type QueryOperator,
  type WhereCondition,
} from './database'

// =============================================================================
// CODE EDITOR COMPONENTS
// =============================================================================
export {
  MonacoEditor,
  type MonacoEditorProps,
  getMonacoLanguage,
  configureMonacoTypeScript,
  CodePreview,
  type CodePreviewProps,
  SplitView,
  type SplitViewProps,
  type ViewMode,
} from './code'

// =============================================================================
// TERMINAL COMPONENTS
// =============================================================================
export {
  Terminal,
  type TerminalProps,
  type TerminalLine,
  TerminalHeader,
  type TerminalHeaderProps,
  TerminalOutput,
  type TerminalOutputProps,
  TerminalInput,
  type TerminalInputProps,
} from './terminal'
