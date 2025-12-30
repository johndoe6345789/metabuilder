---@meta
-- Type definitions for user_manager package

---@class UserAction
---@field action string Action type
---@field user_id? string Target user ID
---@field data? table Action data
---@field confirm? boolean Requires confirmation
---@field level? number Target access level
---@field active? boolean Active status

---@class User
---@field id string User ID
---@field username string Username
---@field email string Email address
---@field role string User role
---@field level number Access level (1-6)
---@field active boolean Whether user is active

---@class TableColumn
---@field id string Column identifier
---@field label string Column header label
---@field sortable? boolean Whether column is sortable
---@field type? string Column type (badge, actions, etc.)

---@class TableRow
---@field username string
---@field email string
---@field role string
---@field level number
---@field active string Status badge text
---@field actions string[] Available actions

---@class DataTableConfig
---@field type string Component type
---@field columns TableColumn[] Column definitions
---@field rows TableRow[] Row data

return {}
