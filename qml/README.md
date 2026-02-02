# QML Component Library

Material Design 3 components for Qt6 desktop applications. These components mirror the React/TypeScript FakeMUI library, providing consistent UI across web and desktop platforms.

## Structure

```
qml/
├── qmldir                    # Main module definition (119 components)
├── components/               # Core component library (104 components)
│   ├── atoms/               # Basic building blocks (14)
│   ├── core/                # Buttons, Cards, Icons (9)
│   ├── data-display/        # Tables, Lists, Badges (8)
│   ├── feedback/            # Alerts, Dialogs, Progress (9)
│   ├── form/                # Inputs, Checkboxes, Selects (17)
│   ├── lab/                 # Experimental components (9)
│   ├── layout/              # Grid, Flex, Stack (10)
│   ├── navigation/          # Tabs, Menus, Breadcrumbs (10)
│   ├── surfaces/            # AppBar, Drawer, Paper (5)
│   ├── theming/             # Theme providers (2)
│   └── utils/               # Utilities (11)
├── hybrid/                   # Complete application views (7)
│   ├── qmldir               # Hybrid module definition
│   ├── TaskList.qml
│   ├── TaskDetail.qml
│   ├── NewPrompt.qml
│   ├── UserInfo.qml
│   ├── SearchDialog.qml
│   ├── Documentation.qml
│   └── MarkdownRenderer.qml
└── widgets/                  # Specialized desktop widgets (8)
    ├── AjaxQueueWidget.qml
    ├── DetailPane.qml
    ├── LanguageSelector.qml
    ├── NerdPanel.qml
    ├── PatchDialog.qml
    ├── SendPromptDialog.qml
    ├── TaskListItem.qml
    └── ThemeSelector.qml
```

## Usage

### Import the Module

Add the qml folder to your QML import path, then import the module:

```qml
import QmlComponents 1.0

ApplicationWindow {
    CButton {
        text: "Click Me"
        variant: "contained"
        onClicked: console.log("Clicked!")
    }
}
```

### CMake Integration

```cmake
set(QML_IMPORT_PATH "${CMAKE_SOURCE_DIR}/qml" CACHE PATH "QML import path")
```

### qmake Integration

```qmake
QML_IMPORT_PATH += $$PWD/qml
```

## Component Categories

### Core Components
- `CButton` - Material buttons with variants (text, outlined, contained)
- `CCard` - Elevated card containers
- `CChip` - Compact elements for tags, filters
- `CIcon` - Material Design icons
- `CIconButton` - Icon-only buttons
- `CFab` - Floating action buttons
- `CToolbar` - Application toolbars
- `CListItem` - List item containers
- `CLoadingOverlay` - Loading state overlays

### Form Components
- `CTextField` - Text input with labels and validation
- `CCheckbox` / `CRadio` / `CSwitch` - Toggle controls
- `CSelect` - Dropdown selection
- `CSlider` - Range selection
- `CAutocomplete` - Search with suggestions
- `CRating` - Star ratings
- `CTextarea` - Multi-line text input

### Layout Components
- `CGrid` / `CGridItem` - CSS Grid-like layouts
- `CFlex` / `FlexRow` / `FlexCol` - Flexbox layouts
- `CStack` - Vertical/horizontal stacking
- `CContainer` - Responsive containers
- `CBox` - Generic container
- `Spacer` - Flexible spacing

### Data Display
- `CTable` - Data tables
- `CList` - Vertical lists
- `CAvatar` / `CBadge` - User avatars with badges
- `CDivider` - Content dividers
- `CTooltip` - Hover tooltips
- `CStatBadge` / `CStatusBadge` - Status indicators

### Feedback
- `CAlert` - Alert messages
- `CDialog` - Modal dialogs
- `CSnackbar` - Toast notifications
- `CProgress` / `CSpinner` - Loading indicators
- `CSkeleton` - Content placeholders
- `CEmptyState` / `CErrorState` - Empty/error states

### Navigation
- `CTabs` / `CTabBar` - Tab navigation
- `CMenu` - Dropdown menus
- `CBreadcrumbs` - Breadcrumb navigation
- `CPagination` - Page navigation
- `CStepper` - Step-by-step wizards
- `CSidebar` - Side navigation
- `CDrawer` - Slide-out panels
- `CBottomNavigation` - Mobile-style bottom nav

### Surfaces
- `CAppBar` - Application header bar
- `CDrawer` - Navigation drawer
- `CPaper` - Elevated surface
- `CAccordion` / `CAccordionItem` - Collapsible sections

### Lab (Experimental)
- `CDataGrid` - Advanced data grids
- `CDatePicker` / `CTimePicker` / `CDateTimePicker` - Date/time selection
- `CTimeline` / `CTimelineItem` - Event timelines
- `CMasonry` - Masonry layouts
- `CTreeView` - Tree navigation
- `CLoadingButton` - Buttons with loading state

### Atoms (Building Blocks)
- `CText` / `CTitle` / `CTypography` - Text rendering
- `CPanel` / `CSection` - Content sections
- `CMarkdown` / `CProse` - Markdown rendering
- `CCodeBlock` / `CCodeInline` - Code display
- `CHighlight` / `CBlockquote` - Text highlights

## Theming

Components use the Material Design 3 color system. The theming system is located at `fakemui/theming/` and includes:

- `Theme.qml` - Main theme singleton
- `StyleVariables.qml` - CSS-like variables
- `StyleMixins.qml` - Reusable style functions
- `Responsive.qml` - Responsive breakpoints

To customize themes, modify the theme files or create a custom `CThemeProvider`.

## Related

- **React Components**: `fakemui/react/components/` - TypeScript/React equivalents
- **SCSS Styles**: `fakemui/styles/` - Shared SCSS modules
- **Icons**: `fakemui/icons/` - 421 SVG Material icons
- **Qt6 Frontend**: `frontends/qt6/` - Qt6 desktop application using these components

## Component Count

| Category | Count |
|----------|-------|
| Atoms | 14 |
| Core | 9 |
| Data Display | 8 |
| Feedback | 9 |
| Form | 17 |
| Lab | 9 |
| Layout | 10 |
| Navigation | 10 |
| Surfaces | 5 |
| Theming | 2 |
| Utils | 11 |
| Hybrid | 7 |
| Widgets | 8 |
| **Total** | **119** |
