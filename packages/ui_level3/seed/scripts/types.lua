-- LuaCATS type definitions for ui_level3 package (Moderator Panel)
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Render Context
--------------------------------------------------------------------------------

---@class RenderContext
---@field user User Current logged-in user (level 3+)
---@field stats? ModerationStats Current moderation statistics

---@class User
---@field id string User ID
---@field username string Username
---@field level number Permission level (3 = MODERATOR)

---@class ModerationStats
---@field pendingReports number Reports awaiting review
---@field resolvedToday number Reports resolved today
---@field activeFlags number Currently flagged items
---@field userWarnings number Active user warnings

--------------------------------------------------------------------------------
-- Moderation Types
--------------------------------------------------------------------------------

---@class Report
---@field id string Report ID
---@field type "comment"|"user"|"content" Report type
---@field targetId string ID of reported item
---@field reason string Report reason
---@field reporterId string Reporting user ID
---@field createdAt string ISO date string
---@field status "pending"|"resolved"|"dismissed" Report status

---@class ModerationAction
---@field action "warn"|"mute"|"ban"|"dismiss"|"delete" Action type
---@field targetId string Target user/content ID
---@field reason? string Reason for action
---@field duration? number Duration in hours (for mute/ban)

---@class ModerationResult
---@field success boolean Whether action succeeded
---@field action string Action taken
---@field message? string Result message

--------------------------------------------------------------------------------
-- User Management Types
--------------------------------------------------------------------------------

---@class ManagedUser
---@field id string User ID
---@field username string Username
---@field email string Email address
---@field level number Permission level
---@field status "active"|"muted"|"banned" User status
---@field warningCount number Number of warnings
---@field lastActive? string ISO date string

---@class UserFilter
---@field status? "active"|"muted"|"banned" Filter by status
---@field search? string Search username/email
---@field level? number Filter by level

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

---@class DataGridColumn
---@field field string Data field name
---@field header string Column header
---@field width? number Column width
---@field sortable? boolean Enable sorting

--------------------------------------------------------------------------------
-- Moderation Module
--------------------------------------------------------------------------------

---@class ModerationModule
---@field getReports fun(filter?: ReportFilter): Report[] Get pending reports
---@field resolveReport fun(id: string, action: ModerationAction): ModerationResult
---@field warnUser fun(userId: string, reason: string): ModerationResult
---@field muteUser fun(userId: string, hours: number, reason?: string): ModerationResult

---@class ReportFilter
---@field type? "comment"|"user"|"content" Filter by type
---@field status? "pending"|"resolved"|"dismissed" Filter by status

---@class LayoutModule
---@field render fun(ctx: RenderContext): UIComponent Main layout renderer
---@field tabs fun(): UIComponent Tab navigation component

return {}
