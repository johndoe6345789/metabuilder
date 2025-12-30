-- Icon mappings for dashboard components
-- This module provides icon names that work with fakemui icons

---@class DashboardIcons
local M = {}

---Common dashboard icon names mapped to fakemui icons
M.icons = {
  -- Stats & Analytics
  CHART_LINE = "ChartLine",
  TREND_UP = "TrendUp",
  BAR_CHART = "BarChart",
  PIE_CHART = "PieChart",
  ANALYTICS = "Analytics",
  DASHBOARD = "Dashboard",
  STATS = "Stats",

  -- Status & Validation
  CHECK_CIRCLE = "CheckCircle",
  SHIELD_CHECK = "ShieldCheck",
  WARNING = "Warning",
  ERROR = "CircleX",
  INFO = "Info",

  -- Time & Schedule
  CLOCK = "Clock",
  CALENDAR = "Calendar",
  SCHEDULE = "Schedule",

  -- User & People
  USER = "User",
  USERS = "Users",
  USER_CIRCLE = "UserCircle",
  PEOPLE = "People",

  -- Actions
  ADD = "Add",
  EDIT = "Edit",
  DELETE = "Delete",
  REFRESH = "Refresh",
  SETTINGS = "Settings",
}

---Get icon name for a given dashboard element
---@param key string Icon key (e.g., "CHART_LINE")
---@return string icon_name The fakemui icon name
function M.get(key)
  return M.icons[key] or "Info"
end

return M
