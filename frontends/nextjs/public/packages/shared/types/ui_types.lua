-- Shared UI type definitions for all Lua packages
-- Import this file to get common types used across the UI system
-- 
-- Usage:
--   local types = require("shared.ui_types")
-- 
-- @meta

---@alias UIComponentType
---| "Box"
---| "Stack"
---| "Grid"
---| "Container"
---| "Flex"
---| "Paper"
---| "Card"
---| "CardHeader"
---| "CardContent"
---| "CardActions"
---| "CardTitle"
---| "CardFooter"
---| "Button"
---| "IconButton"
---| "Icon"
---| "Input"
---| "TextField"
---| "TextArea"
---| "Select"
---| "Checkbox"
---| "Radio"
---| "RadioGroup"
---| "Switch"
---| "Slider"
---| "Typography"
---| "Avatar"
---| "Badge"
---| "Chip"
---| "Divider"
---| "List"
---| "ListItem"
---| "ListItemText"
---| "ListItemIcon"
---| "Table"
---| "TableHead"
---| "TableBody"
---| "TableRow"
---| "TableCell"
---| "TableHeader"
---| "Tabs"
---| "TabsList"
---| "TabsTrigger"
---| "TabsContent"
---| "Dialog"
---| "DialogTitle"
---| "DialogContent"
---| "DialogActions"
---| "Alert"
---| "Snackbar"
---| "Menu"
---| "MenuItem"
---| "Tooltip"
---| "AppHeader"
---| "AppBar"
---| "Toolbar"
---| "IntroSection"
---| "ProfileTab"
---| "CommentsTab"
---| "ChatTab"

---@class UIComponent
---@field type UIComponentType|string Component type identifier
---@field props? table<string, any> Component properties
---@field children? UIComponent[] Nested child components

---@class ButtonProps
---@field text? string Button label text
---@field variant? "contained"|"outlined"|"text" Button style variant
---@field color? "primary"|"secondary"|"error"|"success"|"warning" Color scheme
---@field size? "sm"|"md"|"lg" Button size
---@field disabled? boolean Disable button interactions
---@field onClick? string Action handler name
---@field data? any Additional data passed to handler

---@class IconProps
---@field name string Icon name from fakemui/icons
---@field size? "small"|"medium"|"large"|"inherit" Icon size
---@field className? string CSS class name

---@class InputProps
---@field label? string Input field label
---@field name? string Form field name
---@field value? string Current input value
---@field placeholder? string Placeholder text
---@field disabled? boolean Disable input
---@field required? boolean Mark as required field
---@field type? "text"|"email"|"password"|"number"|"tel"|"url" Input type

---@class TypographyProps
---@field text? string Text content to display
---@field variant? "h1"|"h2"|"h3"|"h4"|"h5"|"h6"|"body1"|"body2"|"caption"|"overline" Typography variant
---@field color? string Text color
---@field align? "left"|"center"|"right"|"justify" Text alignment

---@class CardProps
---@field className? string CSS class name
---@field elevation? number Shadow depth (0-24)
---@field variant? "elevation"|"outlined" Card style

---@class StackProps
---@field spacing? number Gap between children
---@field direction? "row"|"column" Stack direction
---@field className? string CSS class name

---@class GridProps
---@field cols? number Number of columns
---@field gap? number Gap between items
---@field className? string CSS class name

---@class TabsProps
---@field defaultValue? string Initially selected tab value
---@field value? string Controlled selected tab

---@class TableCellProps
---@field text? string Cell text content
---@field align? "left"|"center"|"right" Cell alignment
---@field colSpan? number Column span

---@class BadgeProps
---@field text? string Badge label
---@field color? "primary"|"secondary"|"error"|"success"|"warning" Badge color
---@field variant? "standard"|"dot" Badge variant

---@class AlertProps
---@field severity? "error"|"warning"|"info"|"success" Alert type
---@field text? string Alert message

---@class TooltipProps
---@field title? string Tooltip text
---@field placement? "top"|"bottom"|"left"|"right" Tooltip position

---User identity information
---@class UserInfo
---@field id? string User identifier
---@field username string Display username
---@field email? string Email address
---@field role? string User permission role
---@field level? number Permission level (1-6)
---@field avatarUrl? string Profile image URL

---Standard render context passed to Lua render functions
---@class RenderContext
---@field user? UserInfo Current logged-in user
---@field tenant? TenantInfo Current tenant context
---@field params? table<string, any> URL or route parameters
---@field data? table<string, any> Fetched data from API

---Tenant/organization information
---@class TenantInfo
---@field id string Tenant identifier
---@field name string Tenant display name
---@field domain? string Tenant domain

---Result of an action handler
---@class ActionResult
---@field success boolean Whether the action succeeded
---@field error? string Error message if failed
---@field action? string Action type identifier
---@field data? any Result data

---Form validation result
---@class ValidationResult
---@field valid boolean Whether validation passed
---@field errors? table<string, string> Field-specific error messages

return {}
