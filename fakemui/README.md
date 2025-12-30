# fakemui
Fakenham - A Material-UI inspired component library for QML and React

## Project Structure

### Root Directory
Application-specific files and configuration:
- `App.qml` - Main application entry point
- `index.qml` - QML module index
- `Theme.qml`, `StyleVariables.qml`, `StyleMixins.qml`, `Responsive.qml` - Style system singletons
- Application widgets: `AjaxQueueWidget.qml`, `DetailPane.qml`, `LanguageSelector.qml`, etc.

### QML Components (`qml-components/`)
Organized Material-UI style component library with 104+ components:

- **atoms/** - Basic building blocks (CPanel, CText, CTitle, CCodeBlock, etc.)
- **core/** - Core UI components (CButton, CCard, CIcon, CToolbar, etc.)
- **form/** - Form controls (CTextField, CCheckbox, CSelect, CRadio, etc.)
- **layout/** - Layout components (CGrid, CBox, CContainer, FlexRow, etc.)
- **data-display/** - Data display (CTable, CAvatar, CBadge, CTooltip, etc.)
- **feedback/** - User feedback (CAlert, CDialog, CProgress, CSnackbar, etc.)
- **navigation/** - Navigation (CTabs, CMenu, CBreadcrumbs, CSidebar, etc.)
- **surfaces/** - Surface components (CAppBar, CDrawer, CPaper, CAccordion, etc.)
- **lab/** - Experimental components (CDataGrid, CDatePicker, CTimeline, etc.)
- **theming/** - Theme utilities (CThemeProvider, CStyled)
- **utils/** - Utility components (CModal, CPopper, CCssBaseline, etc.)

### React/Python Components (`fakemui/`)
JavaScript and Python component implementations organized by category:
- `atoms/`, `data-display/`, `feedback/`, `inputs/`, `lab/`, `layout/`, `navigation/`, `surfaces/`, `theming/`, `utils/`

### Additional Directories
- `components/` - Additional QML application components
- `contexts/` - QML context providers
- `styles/` - SCSS stylesheets

## Module Definition
The `qmldir` file defines the Fakemui QML module, making all components available for import.

