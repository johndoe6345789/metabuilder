-- Type definitions for nav_menu package
-- Central types file for navigation menu construction
-- @meta

---@alias NavItemType "link"|"group"|"divider"|"header"|"custom"

---@alias BadgeVariant "default"|"primary"|"secondary"|"success"|"warning"|"error"|"info"

---@class NavBadge
---@field text string|number Badge text or count
---@field variant? BadgeVariant Badge color variant
---@field max? number Max value before showing "99+"

---@class NavItemBase
---@field id string Unique item identifier
---@field type NavItemType Item type
---@field visible? boolean Whether item is visible
---@field disabled? boolean Whether item is disabled
---@field minLevel? number Minimum permission level required

---@class NavLink : NavItemBase
---@field type "link"
---@field label string Display label
---@field href string Navigation URL
---@field icon? string Icon name from fakemui icons
---@field badge? NavBadge Optional badge
---@field external? boolean Open in new tab
---@field active? boolean Whether link is active
---@field exact? boolean Match exact path only

---@class NavGroup : NavItemBase
---@field type "group"
---@field label string Group label
---@field icon? string Group icon
---@field children NavItem[] Child items
---@field collapsible? boolean Whether group can be collapsed
---@field defaultOpen? boolean Default open state
---@field badge? NavBadge Optional badge

---@class NavDivider : NavItemBase
---@field type "divider"
---@field label? string Optional divider label

---@class NavHeader : NavItemBase
---@field type "header"
---@field label string Header text
---@field icon? string Header icon

---@alias NavItem NavLink|NavGroup|NavDivider|NavHeader

---@class NavMenuConfig
---@field items NavItem[] Menu items
---@field collapsed? boolean Sidebar collapsed state
---@field collapsible? boolean Whether sidebar can collapse
---@field width? number Sidebar width in pixels
---@field collapsedWidth? number Collapsed sidebar width
---@field position? "left"|"right" Sidebar position
---@field sticky? boolean Sticky positioning
---@field showLabels? boolean Show labels in collapsed state
---@field theme? "light"|"dark"|"auto" Menu theme

---@class SidebarConfig
---@field header? SidebarHeader Header configuration
---@field footer? SidebarFooter Footer configuration
---@field navigation NavMenuConfig Navigation configuration
---@field user? UserInfo Current user info

---@class SidebarHeader
---@field logo? string Logo URL or icon name
---@field title? string Application title
---@field subtitle? string Application subtitle
---@field showInCollapsed? boolean Show in collapsed state

---@class SidebarFooter
---@field items? NavItem[] Footer items
---@field version? string App version
---@field showInCollapsed? boolean Show in collapsed state

---@class UserInfo
---@field id string|number User ID
---@field name string User display name
---@field email? string User email
---@field avatar? string Avatar URL
---@field role? string User role label
---@field level number Permission level (0-6)

---@class NavMenuState
---@field activeItem string|nil Currently active item ID
---@field expandedGroups table<string, boolean> Expanded group IDs
---@field collapsed boolean Sidebar collapsed state
---@field hoveredItem string|nil Currently hovered item ID

---@class NavMenuCallbacks
---@field onNavigate? fun(item: NavLink): void Navigation callback
---@field onToggleCollapse? fun(collapsed: boolean): void Collapse toggle callback
---@field onToggleGroup? fun(groupId: string, open: boolean): void Group toggle callback

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
