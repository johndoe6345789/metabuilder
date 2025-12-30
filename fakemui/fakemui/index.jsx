// Atomic React Components
// Complete replacement for MUI - just CSS class wrappers
// Re-exports from organized folders

// 1. INPUTS - User interaction and form controls
export {
  Button,
  IconButton,
  Fab,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
  Slider,
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
} from './inputs'

// 2. DATA DISPLAY - Visual presentation of information
export {
  Avatar,
  AvatarGroup,
  Badge,
  Chip,
  Divider,
  Icon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListSubheader,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Typography,
} from './data-display'

// 3. FEEDBACK - Communicating status and results
export {
  Alert,
  AlertTitle,
  Backdrop,
  Spinner,
  CircularProgress,
  LinearProgress,
  Progress,
  Skeleton,
  Snackbar,
} from './feedback'

// 4. SURFACES - Structural and layout surfaces
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
} from './surfaces'

// 5. NAVIGATION - User flow and movement
export {
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  MenuList,
  Tabs,
  Tab,
  Pagination,
  PaginationItem,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  StepContent,
  StepConnector,
  StepIcon,
  BottomNavigation,
  BottomNavigationAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from './navigation'

// 6. LAYOUT - Page and component structure
export {
  Box,
  Container,
  Grid,
  Stack,
  Flex,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from './layout'

// 7. UTILS - Low-level helpers and primitives
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
  Collapse,
  Fade,
  Grow,
  Slide,
  Zoom,
  ClickAwayListener,
  Portal,
  CssBaseline,
  ScopedCssBaseline,
  NoSsr,
  TextareaAutosize,
  useMediaQuery,
  useMediaQueryUp,
  useMediaQueryDown,
  useMediaQueryBetween,
  GlobalStyles,
  classNames,
} from './utils'

// 8. ADDITIONAL ATOMS
export {
  Title,
  Subtitle,
  Label,
  Text,
  StatBadge,
  Section,
  SectionHeader,
  SectionTitle,
  SectionContent,
  EmptyState,
  LoadingState,
  ErrorState,
  EditorWrapper,
  Panel,
  AutoGrid,
} from './atoms'

// 9. LAB - Experimental components
export {
  LoadingButton,
  Masonry,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TreeView,
  TreeItem,
} from './lab'

// 10. MUI X - Advanced data components
export {
  DataGrid,
  DataGridPro,
  DataGridPremium,
  DatePicker,
  TimePicker,
  DateTimePicker,
  DesktopDatePicker,
  MobileDatePicker,
  StaticDatePicker,
  CalendarPicker,
  ClockPicker,
} from './x'

// 11. THEMING - Theme and styling APIs
export {
  ThemeProvider,
  createTheme,
  useTheme,
  defaultTheme,
  styled,
  processSxProp,
} from './theming'
