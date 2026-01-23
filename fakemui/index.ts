// Fakemui - Material-UI inspired component library
// Main barrel export file for all components

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
} from './fakemui/inputs'

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
} from './fakemui/surfaces'

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
} from './fakemui/layout'

// Data Display
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
  // Note: TreeView also available from lab with component-based API
  TreeView as TreeViewFlat,
} from './fakemui/data-display'

// Note: Icon is exported from icons module (line 6), not data-display

// Feedback
export {
  Alert,
  Backdrop,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Snackbar,
  Spinner,
} from './fakemui/feedback'

// Note: Dialog components are available from utils module
// Import Dialog, DialogTitle, DialogContent, DialogActions from '@/fakemui/utils'

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
} from './fakemui/navigation'

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
} from './fakemui/utils'

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
} from './fakemui/atoms'

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
  TreeView as TreeViewComponent,
  TreeItem,
} from './fakemui/lab'

// Note: TreeView has two implementations:
// - TreeViewFlat (data-display): Simple array-based API for JSON trees
// - TreeViewComponent (lab): Composition-based API with TreeItem children

// X (Advanced - pro/premium features)
export {
  DataGrid,
  DataGridPro,
  DataGridPremium,
  // Advanced date/time pickers with calendar UI
  DatePicker as DatePickerAdvanced,
  TimePicker as TimePickerAdvanced,
  DateTimePicker,
  DesktopDatePicker,
  MobileDatePicker,
  StaticDatePicker,
  CalendarPicker,
  ClockPicker,
} from './fakemui/x'

// Note: DatePicker has two implementations:
// - DatePicker (inputs): Simple HTML input-based (string values)
// - DatePickerAdvanced (x): Advanced with calendar UI (Date objects)

// Theming
export type { Theme, ThemeOptions } from './fakemui/theming'
