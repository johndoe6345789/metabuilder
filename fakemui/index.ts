// Fakemui - Material-UI inspired component library
// Main barrel export file for all components
// NOTE: Components requiring SCSS modules are commented out (Phase 5)

// Icons
export {
  Icon,
  // Actions
  Plus,
  Trash,
  Copy,
  Check,
  X,
  Filter,
  FilterOff,
  // Navigation
  ArrowUp,
  ArrowDown,
  ArrowClockwise,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  // Files & UI
  FloppyDisk,
  Search,
  Settings,
  User,
  UserCheck,
  Menu as MenuIcon,
  Eye,
  EyeSlash,
  Pencil,
  // Communication & Time
  Calendar,
  Clock,
  Mail,
  Bell,
  // Social
  Star,
  Heart,
  Share,
} from './icons'
export type { IconProps } from './icons'

// Inputs
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
} from './react/components/inputs'

// Surfaces
export {
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
} from './react/components/surfaces'

// Layout
export {
  Box,
  Container,
  Grid,
  Stack,
  Flex,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from './react/components/layout'

// Data Display
// NOTE: TreeView and Table excluded (require SCSS modules - Phase 5)
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
  // Table, (commented - requires SCSS)
  // TableBody, (commented - requires SCSS)
  // TableCell, (commented - requires SCSS)
  // TableContainer, (commented - requires SCSS)
  // TableHead, (commented - requires SCSS)
  // TableRow, (commented - requires SCSS)
  // TableFooter, (commented - requires SCSS)
  // TablePagination, (commented - requires SCSS)
  // TableSortLabel, (commented - requires SCSS)
  Tooltip,
  Markdown,
  Separator,
  // TreeView (commented - requires SCSS - Phase 5)
} from './react/components/data-display'

// Feedback
// NOTE: Progress excluded (requires SCSS modules - Phase 5)
export {
  Alert,
  Backdrop,
  CircularProgress,
  // LinearProgress, (commented - requires SCSS)
  Skeleton,
  Snackbar,
  Spinner,
} from './react/components/feedback'

// Navigation
export {
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
} from './react/components/navigation'

// Utils
export {
  Modal,
  Dialog,
  DialogOverlay,
  DialogPanel,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from './react/components/utils'

// Atoms
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
} from './react/components/atoms'

// Lab (Experimental)
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
  // TreeView as TreeViewComponent, (commented - requires SCSS - Phase 5)
  TreeItem,
} from './react/components/lab'

// X (Advanced - pro/premium features)
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
} from './react/components/x'

// Theming
export type { Theme, ThemeOptions } from './react/components/theming'

// Accessibility Utilities
export {
  generateTestId,
  testId,
  aria,
  keyboard,
  validate,
} from './src/utils/accessibility'
export type {
  AccessibilityFeature,
  AccessibilityComponent,
  AccessibilityAction,
} from './src/utils/accessibility'

// Email Components
export * from './react/components/email'
