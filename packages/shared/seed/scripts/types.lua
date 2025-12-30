-- LuaCATS type definitions for shared package
-- Common types used across all Lua packages
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- UI Component Types (Universal)
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children
---@field key? string Unique key for lists

---@class BoxProps
---@field className? string CSS class name
---@field sx? table<string, any> Style object
---@field component? string HTML element to render

---@class TypographyProps
---@field text string Text content
---@field variant? TypographyVariant Typography variant
---@field className? string CSS class name
---@field component? string HTML element

---@alias TypographyVariant
---| "h1"|"h2"|"h3"|"h4"|"h5"|"h6"
---| "body1"|"body2"
---| "caption"|"overline"
---| "subtitle1"|"subtitle2"

---@class ButtonProps
---@field text string Button text
---@field variant? "contained"|"outlined"|"text" Button style
---@field color? "primary"|"secondary"|"error"|"warning"|"info"|"success" Button color
---@field size? "small"|"medium"|"large" Button size
---@field disabled? boolean Disable button
---@field onClick? string Click handler name
---@field startIcon? string Icon before text
---@field endIcon? string Icon after text

--------------------------------------------------------------------------------
-- Common Data Types
--------------------------------------------------------------------------------

---@class ApiResponse<T>
---@field success boolean Request succeeded
---@field data? T Response data
---@field error? string Error message
---@field code? number Error code

---@class PaginatedResponse<T>
---@field items T[] Page items
---@field total number Total count
---@field page number Current page
---@field pageSize number Items per page
---@field hasMore boolean More pages available

---@class ValidationResult
---@field valid boolean Is data valid
---@field errors? table<string, string> Field errors

--------------------------------------------------------------------------------
-- User Types
--------------------------------------------------------------------------------

---@class BaseUser
---@field id string User ID
---@field username string Username
---@field level PermissionLevel Permission level

---@alias PermissionLevel
---| 1 # PUBLIC
---| 2 # USER
---| 3 # MODERATOR
---| 4 # ADMIN
---| 5 # GOD
---| 6 # SUPERGOD

--------------------------------------------------------------------------------
-- Action Result Types
--------------------------------------------------------------------------------

---@class ActionResult
---@field success boolean Action succeeded
---@field action string Action identifier
---@field message? string Result message
---@field data? any Result data
---@field error? string Error message

---@class FormSubmitResult
---@field success boolean Submission succeeded
---@field errors? table<string, string> Field-level errors
---@field data? table Submitted data

--------------------------------------------------------------------------------
-- Event Types
--------------------------------------------------------------------------------

---@class UIEvent
---@field type string Event type
---@field target string Target component ID
---@field data? table Event data
---@field timestamp string ISO timestamp

---@class ClickEvent : UIEvent
---@field type "click"
---@field position? { x: number, y: number } Click position

---@class ChangeEvent : UIEvent
---@field type "change"
---@field value any New value
---@field previousValue? any Previous value

--------------------------------------------------------------------------------
-- Utility Functions
--------------------------------------------------------------------------------

---@class SharedUtils
---@field isEmpty fun(value: any): boolean Check if value is empty
---@field deepCopy fun(value: table): table Deep copy table
---@field merge fun(base: table, override: table): table Merge tables
---@field formatDate fun(date: string, format?: string): string Format ISO date

return {}
