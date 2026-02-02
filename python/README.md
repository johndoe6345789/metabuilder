# MetaBuilder Python Packages

Python packages for MetaBuilder, including FakeMUI - a PyQt6-based Material UI component library.

## Packages

### fakemui

Material UI-style widgets for PyQt6. A complete replacement for complex Qt styling with simple, composable components.

**Features:**
- 120+ Material Design 3 components
- Full theming support (light/dark modes)
- Consistent API mirroring MUI React components
- Cross-platform desktop support via PyQt6

**Component Categories:**
- **Inputs** (16): Button, IconButton, Fab, Input, TextArea, Select, CheckBox, RadioButton, Switch, Slider, FormGroup, FormLabel, FormHelperText, TextField, ToggleButton, ToggleButtonGroup
- **Data Display** (19): Avatar, AvatarGroup, Badge, Chip, Divider, Icon, ListWidget, ListItem, ListItemButton, ListItemIcon, ListItemText, ListItemAvatar, ListSubheader, TableWidget, TableHeader, TableBody, TableRow, TableCell, Tooltip, Typography
- **Feedback** (8): Alert, Backdrop, Spinner, CircularProgress, LinearProgress, Progress, Skeleton, Snackbar
- **Surfaces** (14): Paper, Card, CardHeader, CardContent, CardActions, CardActionArea, CardMedia, Accordion, AccordionSummary, AccordionDetails, AccordionActions, AppBar, Toolbar, Drawer
- **Navigation** (13): Breadcrumbs, Link, Menu, MenuItem, MenuList, TabWidget, Tab, Pagination, Stepper, Step, StepLabel, BottomNavigation, BottomNavigationAction
- **Layout** (9): Box, Container, Grid, Stack, Flex, ImageList, ImageListItem, ImageListItemBar, Spacer
- **Utils** (13): Modal, Dialog, DialogOverlay, DialogHeader, DialogTitle, DialogContent, DialogActions, Popover, Collapse, Fade, ClickAwayListener, apply_theme, get_theme, ThemeProvider
- **Atoms** (14): Title, Subtitle, Label, Text, StatBadge, Section, SectionHeader, SectionTitle, SectionContent, EmptyState, LoadingState, ErrorState, Panel, AutoGrid
- **Theming** (12): Theme, Palette, Typography, Shape, Shadows, Transitions, ZIndex, Breakpoints, default_theme, create_theme, ThemeProvider, use_theme, styled, process_sx_prop
- **Lab** (11): LoadingButton, Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent, TreeView, TreeItem, Masonry
- **MUI X** (12): DataGrid, DataGridPro, DataGridPremium, DataGridColumn, DatePicker, TimePicker, DateTimePicker, DesktopDatePicker, MobileDatePicker, StaticDatePicker, CalendarPicker, ClockPicker

## Installation

```bash
# From project root
pip install -e ./python

# Or install dependencies directly
pip install PyQt6>=6.4.0
```

## Usage

```python
from fakemui import (
    Button, TextField, Card, CardContent,
    Box, Stack, Typography, ThemeProvider,
    create_theme
)

# Create a theme
theme = create_theme(palette={'mode': 'dark'})

# Build UI
app = QApplication(sys.argv)
with ThemeProvider(theme):
    window = Box()
    window.add_widget(
        Card(
            CardContent(
                Stack(spacing=2, children=[
                    Typography("Hello FakeMUI!", variant="h4"),
                    TextField(label="Name", variant="outlined"),
                    Button("Submit", variant="contained", color="primary")
                ])
            )
        )
    )
    window.show()
    app.exec()
```

## Development

```bash
# Install dev dependencies
pip install -e ./python[dev]

# Run tests
pytest

# Type checking
mypy fakemui
```

## License

MIT
