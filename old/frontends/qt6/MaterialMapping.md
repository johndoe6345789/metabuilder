# Material UI → QML Mapping

This reference ties every Material UI component that the Next.js frontend currently consumes to the closest QML equivalent from `frontends/qt6/qmllib/Material` or the built-in Qt Quick Controls primitives. Where we haven’t implemented a dedicated wrapper yet, the “QML counterpart” points at the Qt Quick Control that can be used to achieve the same structure and feel.

| Material UI component | QML counterpart | Notes |
| --- | --- | --- |
| Accordion / AccordionSummary / AccordionDetails | `Material.MaterialAccordion` | Expandable panel with header/summary and content slot that toggles expansion. |
| Alert / AlertTitle | `Material.MaterialAlert` | Custom `Rectangle` + `Text` + optional icon slot. |
| AppBar / Toolbar | `Material.MaterialAppBar` / `Material.MaterialToolbar` | Fixed `Rectangle` with `RowLayout`; exposes elevation, drop shadow, and toolbar slot for navigation actions. |
| Avatar / AvatarGroup | `Material.MaterialAvatar` | Circular `Image`/`Rectangle` that surfaces initials when no source is provided; group helpers can stack avatars. |
| Badge / Chip | `Material.MaterialBadge` / `Material.MaterialChip` | Already wired; badges accept accent/dense/outlined variants (and optional `iconSource`). |
| Box / Container | `Material.MaterialBox` / `Material.MaterialPaper` | `Material.MaterialBox` offers a simple column container, while `Material.MaterialPaper` wraps `MaterialSurface` for paper-like elevation/outline. |
| Breadcrumbs | `Material.MaterialBreadcrumbs` | Horizontal `RowLayout` of text/buttons separated by dividers. |
| Button / ButtonProps | `Material.MaterialButton` | Supports contained, outlined, and icon-enabled styles with ripple and disabled handling. |
| Card / CardContent / CardHeader / CardActions / CardMedia | `Material.MaterialCard` + `Box`/`ColumnLayout` | Cards already exist with padding/border/elevation tokens. |
| Checkbox | `Material.MaterialCheckbox` | CheckBox that applies Material colors and renders a custom indicator. |
| ChipProps | `Material.MaterialChip` | Accepts `text` + optional prefix/utility slots. |
| CircularProgress | `Material.MaterialCircularProgress` | `BusyIndicator`-based circle, colored via palette. |
| Collapse | `Material.MaterialCollapse` | Generic collapse container animated via height transitions. |
| Container | `Material.MaterialContainer` | Width-constraining `Rectangle` with column layout and consistent spacing. |
| CssBaseline | `Material.MaterialCssBaseline` | Background/typography reset that sets root window colors. |
| Dialog / DialogActions / DialogContent / DialogTitle | `Material.MaterialDialog` | Wraps `QtQuick.Controls.Dialog` + slot for actions, sections, icons. |
| Divider | `Material.MaterialDivider` | Simple horizontal line with palette color. |
| DividerProps | `Material.MaterialDividerProps` | Provides thickness/color helpers for divider props. |
| Drawer | `Material.MaterialDrawer` | `Drawer` from Qt Quick Controls with custom surface look. |
| FormControl / FormControlLabel / FormHelperText / FormLabel | `Material.MaterialFormField` | Label + helper text wrappers around `Material.MaterialTextField`. |
| Grid | `Material.MaterialGrid` | GridLayout wrapper exposing columns and spacing defaults. |
| IconButton | `Material.MaterialIconButton` | Icon+button with circular touch target and ripple. |
| InputAdornment | `Material.MaterialInputAdornment` | `RowLayout` that positions adornments next to text fields. |
| InputBase / TextField / TextFieldProps | `Material.MaterialTextField` | Material text field with outlined background, focused border, and caret colors. |
| InputLabel | `Material.MaterialInputLabel` | Styled `Text` placed above inputs. |
| LinearProgress | `Material.MaterialLinearProgress` | `Rectangle` with animated gradient track. |
| Link | `Material.MaterialLink` | `Text` with underline + hover opacity + `MouseArea`; clicking opens `href` via `Qt.openUrlExternally`. |
| List / ListItem / ListItemButton / ListItemIcon / ListItemText | `Material.MaterialList` set of `Repeater` + `Material.MaterialListItem` | Compose vertical menus with icons and text. |
| Menu / MenuItem | `Material.MaterialMenu` / `Material.MaterialMenuItem` | Wraps Qt Quick `Menu` so you can customize menu labels/icons. |
| MenuProps | `Material.MaterialMenuProps` | Props wrapper that forwards to Qt Quick `Menu` and exposes action tracking. |
| Pagination / PaginationItem | `Material.MaterialPagination` | Row of buttons that mirror Next.js `Pagination` styles. |
| Paper | `Material.MaterialPaper` | Surface `Rectangle` that uses `surface` palette + outline. |
| Popover | `Material.MaterialPopover` | `Popup` with arrow and surface coloring. |
| PopoverProps | `Material.MaterialPopoverProps` | Props helper for popover-specific flags like arrow visibility. |
| Radio / RadioGroup | `QtQuick.Controls` `RadioButton` plus `Material.MaterialRadioGroup` | `RowLayout` that keeps buttons themed. |
| Select / SelectChangeEvent | `Material.MaterialSelect` | `ComboBox` shim with label/input slot. |
| Skeleton | `Material.MaterialSkeleton` | Animated gradient `Rectangle` for loading placeholders. |
| Slider / SliderProps | `Material.MaterialSlider` | `QtQuick.Controls.Slider` with palette colors. |
| Snackbar | `Material.MaterialSnackbar` | Bottom-aligned `Rectangle` that slides in/out. |
| Stack | `Material.MaterialStack` | Chooses `ColumnLayout`/`RowLayout` depending on orientation property. |
| Switch / SwitchProps | `Material.MaterialSwitch` | Toggle control built on `QtQuick.Controls.Switch` with dark background. |
| Tab / Tabs | `Material.MaterialTabBar` + `Material.MaterialTabContent` | TabView analog with indicator built from `Rectangle`. |
| Table / TableHead / TableBody / TableRow / TableCell / TableContainer / TableFooter | `Material.MaterialTable` | Basic grid using `Repeater` + `RowLayout` + `ColumnLayout` replicating header/body separation. |
| TabsProps | `Material.MaterialTabBar` | Accepts orientation/scroll props. |
| Theme / ThemeProvider / useTheme | `Material.MaterialPalette` / `Material.MaterialTheme` | Singleton palette plus helper `QtObject` for derived colors. |
| ToggleButton / ToggleButtonGroup | `Material.MaterialToggleGroup` | `RowLayout` of `Material.MaterialButton` toggles with `exclusive` property. |
| Toolbar | `Material.MaterialToolbar` | Horizontal container used inside navigation bars. |
| Tooltip / TooltipProps | `Material.MaterialTooltip` | Floating `Rectangle` with arrow and text, anchored to host. |
| Typography | `Material.MaterialTypography` | `Text` wrapper providing Material font weights/sizes (h1–h4, button, body). |
| Breadcrumbs (2nd mention) | `Material.MaterialBreadcrumbs` | See above for horizontal nav. |
| useMediaQuery / useScrollTrigger / useTheme | Signals exposed via `Material.MaterialResponsive` helpers | Provide screen width bindings and scroll watchers for `AppBar`. |

Additional Qt Quick Controls (Tabs, Dialog, Menu, Drawer, Slider, Switch, RadioButton, ComboBox, TableView, ProgressBar, MenuBar, etc.) can be composed directly when the Material-specific wrapper doesn’t exist yet. File a follow-up when you need a dedicated component and we’ll implement it inside `qmllib/Material`.

This mapping is kept up to date whenever a new Material UI pattern is added to the Next.js surface, so the Qt6 team knows which QML primitives to extend for a faithful replica.
