-- Icon mappings for navigation menu components
-- This module provides icon names that work with fakemui icons

---@class NavMenuIcons
local M = {}

---Common navigation icon names mapped to fakemui icons
M.icons = {
  -- Navigation
  HOME = "Home",
  HOUSE = "House",
  DASHBOARD = "Dashboard",
  MENU = "Menu",
  SIDEBAR = "Sidebar",

  -- Common pages
  SETTINGS = "Settings",
  PROFILE = "UserCircle",
  USER = "User",
  USERS = "Users",

  -- Actions & Tools
  SEARCH = "Search",
  NOTIFICATIONS = "Notifications",
  MAIL = "Mail",
  CALENDAR = "Calendar",

  -- Data & Content
  FILE = "File",
  FOLDER = "Folder",
  DATABASE = "Database",
  TABLE = "Table",
  LIST = "List",
  GRID = "Grid",

  -- System & Admin
  ADMIN_PANEL = "AdminPanelSettings",
  MANAGE_ACCOUNTS = "ManageAccounts",
  SECURITY = "Shield",
  VERIFIED_USER = "VerifiedUser",
  POLICY = "Policy",

  -- Navigation indicators
  CHEVRON_RIGHT = "ChevronRight",
  CHEVRON_DOWN = "ChevronDown",
  EXPAND_MORE = "ExpandMore",
  EXPAND_LESS = "ExpandLess",

  -- Special
  ANALYTICS = "Analytics",
  STATS = "Stats",
  CHART = "ChartLine",
  CODE = "Code",
  TERMINAL = "Terminal",
  WORKFLOW = "Workflow",
  SCHEMA = "Schema",
}

---Get icon name for a navigation item
---@param key string Icon key (e.g., "HOME")
---@return string icon_name The fakemui icon name
function M.get(key)
  return M.icons[key] or "Menu"
end

return M
