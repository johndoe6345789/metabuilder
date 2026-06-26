# M3

A Material-UI inspired component library for QML and React, providing 100+ components for building modern user interfaces.

## Overview

M3 (Fakenham) is a comprehensive UI component library that implements Material Design principles in both QML and React/JavaScript. It provides a consistent, customizable, and accessible component system for rapid application development.

## Quick Start

### QML Usage

```qml
import M3 1.0

CButton {
    text: "Click Me"
    variant: "contained"
    color: "primary"
    onClicked: console.log("Button clicked!")
}
```

### Component Count

- **104+ QML Components** in `qml/components/`
- **24+ File Categories** organized by function
- **Consistent API** following Material-UI patterns

## Project Structure

### 📁 Root Directory

Application-specific files and global configuration:

```
m3/
├── index.qml                 # QML module index
├── qmldir                    # Module definition
├── LICENSE                   # MIT License
├── README.md                 # This file
├── .gitignore               # Git ignore rules
├── .gitattributes           # Git attributes
├── core/                     # Core application files
│   └── App.qml              # Main application entry point
├── theming/                  # Theme system singletons
│   ├── Theme.qml            # Global theme configuration
│   ├── StyleVariables.qml   # Design tokens and variables
│   ├── StyleMixins.qml      # Reusable style patterns
│   └── Responsive.qml       # Responsive breakpoints
└── widgets/                  # Application widgets
    ├── AjaxQueueWidget.qml  # Ajax request queue manager
    ├── DetailPane.qml       # Detail view panel
    ├── LanguageSelector.qml # Language switcher
    ├── NerdPanel.qml        # Developer tools panel
    ├── PatchDialog.qml      # Patch management dialog
    ├── SendPromptDialog.qml # Prompt input dialog
    ├── TaskListItem.qml     # Task list item component
    └── ThemeSelector.qml    # Theme switcher
```

### 📁 QML Components (`qml/components/`)

Material-UI style component library with **104+ components** organized by category:

#### Core Components

**atoms/** (Basic Building Blocks)
- CPanel, CText, CTitle, CCaption
- CCodeBlock, CMarkdown, CSyntaxHighlight
- CHero, CFeature, CHighlight

**core/** (Fundamental UI)
- CButton, CIconButton, CFab, CButtonGroup
- CCard, CCardContent, CCardHeader, CCardActions
- CIcon, CImage, CToolbar, CChip

#### Form & Input

**form/** (Form Controls)
- CTextField, CTextArea, CPasswordField
- CCheckbox, CRadio, CSwitch, CSlider
- CSelect, CAutocomplete
- CFormControl, CFormLabel, CFormHelperText

#### Layout & Structure

**layout/** (Layout Components)
- CGrid, CBox, CContainer, CStack
- FlexRow, FlexCol
- CSpacer, CDivider
- CHidden (responsive visibility)

#### Data Display

**data-display/**
- CTable, CTableRow, CTableCell, CTableHead
- CList, CListItem, CListItemText
- CAvatar, CAvatarGroup
- CBadge, CChip, CTooltip
- CTypography

#### Navigation

**navigation/**
- CTabs, CTab, CTabPanel
- CMenu, CMenuItem
- CBreadcrumbs
- CSidebar, CBottomNavigation
- CStepper, CStep, CStepLabel
- CLink, CPagination

#### Feedback & Interaction

**feedback/**
- CAlert, CAlertTitle
- CDialog, CDialogTitle, CDialogContent, CDialogActions
- CSnackbar
- CProgress (Linear & Circular)
- CBackdrop, CSkeleton
- CRating

#### Surfaces

**surfaces/**
- CAppBar, CToolbar
- CDrawer
- CPaper, CCard
- CAccordion, CAccordionSummary, CAccordionDetails

#### Lab (Experimental)

**lab/**
- CDataGrid
- CDatePicker, CTimePicker, CCalendar
- CTimeline, CTimelineItem
- CAutocomplete, CTreeView
- CSpeedDial, CToggleButtonGroup

#### Theming & Utilities

**theming/**
- CThemeProvider
- CStyled

**utils/**
- CModal, CPopover, CPopper
- CCssBaseline
- CPortal, CTransition
- CClickAwayListener
- CNoSsr

### 📁 React/Python Components (`m3/`)

JavaScript and Python component implementations organized by category:

```
m3/
├── atoms/              # Basic components
├── data-display/       # Data visualization
├── feedback/           # User feedback
├── inputs/             # Input controls
├── lab/                # Experimental
├── layout/             # Layout system
├── navigation/         # Navigation
├── surfaces/           # Container surfaces
├── theming/            # Theme system
├── utils/              # Utilities
└── x/                  # Advanced/Extended
```

### 📁 Additional Directories

**components/** - Application-specific QML components
**contexts/** - QML context providers (state management)
**styles/** - SCSS stylesheets
- `atoms/` - Atomic style definitions
- `global/` - Global styles
- `mixins/` - SCSS mixins

## Component API

All components follow Material-UI naming and API conventions:

### Common Props

```qml
// Variant system
variant: "text" | "outlined" | "contained"

// Color system
color: "primary" | "secondary" | "error" | "warning" | "info" | "success"

// Size system
size: "small" | "medium" | "large"

// State props
disabled: bool
loading: bool
```

### Theme Integration

Components automatically use theme variables:

```qml
CButton {
    // Uses theme.palette.primary.main
    color: "primary"

    // Uses theme.spacing() system
    padding: theme.spacing(2)

    // Uses theme.typography
    typography: "button"
}
```

## File Organization

- **128 QML files** total
- **Modular structure** - each component in its own file
- **Category-based** organization for easy discovery
- **Consistent naming** - C prefix for all components (e.g., CButton, CCard)

## Module Definition

The `qmldir` file defines the M3 QML module, making all components available via:

```qml
import M3 1.0
```

## Development

### Adding Components

1. Create component in appropriate `qml/components/` category
2. Follow C prefix naming convention
3. Update `qmldir` if creating a new singleton
4. Add to category documentation

### Style Guidelines

- Use theme variables for colors, spacing, typography
- Support all standard Material-UI props (variant, color, size)
- Implement accessibility features (ARIA, keyboard navigation)
- Follow responsive design patterns

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

Part of the MetaBuilder ecosystem - a comprehensive application building platform.
