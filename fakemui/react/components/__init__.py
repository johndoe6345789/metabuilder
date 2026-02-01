"""
FakeMUI - Material UI-style widgets for PyQt6.
Complete replacement for complex Qt styling with simple, composable components.
"""

# 1. INPUTS - User interaction and form controls
from .inputs import (
    Button,
    IconButton,
    Fab,
    Input,
    TextArea,
    Select,
    CheckBox,
    RadioButton,
    Switch,
    Slider,
    FormGroup,
    FormLabel,
    FormHelperText,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
)

# 2. DATA DISPLAY - Visual presentation of information
from .data_display import (
    Avatar,
    AvatarGroup,
    Badge,
    Chip,
    Divider,
    Icon,
    ListWidget,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListItemAvatar,
    ListSubheader,
    TableWidget,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    Typography,
)

# 3. FEEDBACK - Communicating status and results
from .feedback import (
    Alert,
    Backdrop,
    Spinner,
    CircularProgress,
    LinearProgress,
    Progress,
    Skeleton,
    Snackbar,
)

# 4. SURFACES - Structural and layout surfaces
from .surfaces import (
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
)

# 5. NAVIGATION - User flow and movement
from .navigation import (
    Breadcrumbs,
    Link,
    Menu,
    MenuItem,
    MenuList,
    TabWidget,
    Tab,
    Pagination,
    Stepper,
    Step,
    StepLabel,
    BottomNavigation,
    BottomNavigationAction,
)

# 6. LAYOUT - Page and component structure
from .layout import (
    Box,
    Container,
    Grid,
    Stack,
    Flex,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Spacer,
)

# 7. UTILS - Low-level helpers and primitives
from .utils import (
    Modal,
    Dialog,
    DialogOverlay,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogActions,
    Popover,
    Collapse,
    Fade,
    ClickAwayListener,
    apply_theme,
    get_theme,
    ThemeProvider,
)

# 8. ADDITIONAL ATOMS
from .atoms import (
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
    Panel,
    AutoGrid,
)

# 9. THEMING - Theme management and styled components
from .theming import (
    Theme,
    Palette,
    Typography as ThemeTypography,
    Shape,
    Shadows,
    Transitions,
    ZIndex,
    Breakpoints,
    default_theme,
    create_theme,
    ThemeProvider as MUIThemeProvider,
    use_theme,
    styled,
    process_sx_prop,
    SX_SHORTHANDS,
)

# 10. LAB - Experimental components
from .lab import (
    LoadingButton,
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent,
    TreeView,
    TreeItem,
    Masonry,
)

# 11. MUI X - Advanced components
from .x import (
    DataGrid,
    DataGridPro,
    DataGridPremium,
    DataGridColumn,
    DatePicker,
    TimePicker,
    DateTimePicker,
    DesktopDatePicker,
    MobileDatePicker,
    StaticDatePicker,
    CalendarPicker,
    ClockPicker,
)

__all__ = [
    # Inputs
    'Button', 'IconButton', 'Fab', 'Input', 'TextArea', 'Select',
    'CheckBox', 'RadioButton', 'Switch', 'Slider', 'FormGroup',
    'FormLabel', 'FormHelperText', 'TextField', 'ToggleButton', 'ToggleButtonGroup',
    # Data Display
    'Avatar', 'AvatarGroup', 'Badge', 'Chip', 'Divider', 'Icon',
    'ListWidget', 'ListItem', 'ListItemButton', 'ListItemIcon', 'ListItemText',
    'ListItemAvatar', 'ListSubheader', 'TableWidget', 'TableHeader', 'TableBody',
    'TableRow', 'TableCell', 'Tooltip', 'Typography',
    # Feedback
    'Alert', 'Backdrop', 'Spinner', 'CircularProgress', 'LinearProgress',
    'Progress', 'Skeleton', 'Snackbar',
    # Surfaces
    'Paper', 'Card', 'CardHeader', 'CardContent', 'CardActions',
    'CardActionArea', 'CardMedia', 'Accordion', 'AccordionSummary',
    'AccordionDetails', 'AccordionActions', 'AppBar', 'Toolbar', 'Drawer',
    # Navigation
    'Breadcrumbs', 'Link', 'Menu', 'MenuItem', 'MenuList', 'TabWidget', 'Tab',
    'Pagination', 'Stepper', 'Step', 'StepLabel', 'BottomNavigation',
    'BottomNavigationAction',
    # Layout
    'Box', 'Container', 'Grid', 'Stack', 'Flex', 'ImageList',
    'ImageListItem', 'ImageListItemBar', 'Spacer',
    # Utils
    'Modal', 'Dialog', 'DialogOverlay', 'DialogHeader', 'DialogTitle',
    'DialogContent', 'DialogActions', 'Popover', 'Collapse', 'Fade',
    'ClickAwayListener', 'apply_theme', 'get_theme', 'ThemeProvider',
    # Atoms
    'Title', 'Subtitle', 'Label', 'Text', 'StatBadge', 'Section',
    'SectionHeader', 'SectionTitle', 'SectionContent', 'EmptyState',
    'LoadingState', 'ErrorState', 'Panel', 'AutoGrid',
    # Theming
    'Theme', 'Palette', 'ThemeTypography', 'Shape', 'Shadows', 'Transitions',
    'ZIndex', 'Breakpoints', 'default_theme', 'create_theme', 'MUIThemeProvider',
    'use_theme', 'styled', 'process_sx_prop', 'SX_SHORTHANDS',
    # Lab
    'LoadingButton', 'Timeline', 'TimelineItem', 'TimelineSeparator',
    'TimelineConnector', 'TimelineContent', 'TimelineDot', 'TimelineOppositeContent',
    'TreeView', 'TreeItem', 'Masonry',
    # MUI X
    'DataGrid', 'DataGridPro', 'DataGridPremium', 'DataGridColumn',
    'DatePicker', 'TimePicker', 'DateTimePicker', 'DesktopDatePicker',
    'MobileDatePicker', 'StaticDatePicker', 'CalendarPicker', 'ClockPicker',
]
