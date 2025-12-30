-- LuaCATS type definitions for ui_header package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- User Types
--------------------------------------------------------------------------------

---@class User
---@field id string User ID
---@field username string Username
---@field email? string Email address
---@field level number Permission level (1-6)
---@field avatarUrl? string Avatar image URL

---@class Action
---@field id string Action identifier
---@field label string Display label
---@field icon? string Icon name
---@field onClick? string Callback identifier
---@field href? string Navigation URL
---@field variant? "default"|"primary"|"secondary" Button variant

--------------------------------------------------------------------------------
-- Logo Component
--------------------------------------------------------------------------------

---@class LogoProps
---@field logoUrl? string Logo image URL
---@field title? string Site title
---@field href? string Link destination

---@class LogoComponent
---@field type string Component type name
---@field props LogoProps Component props

--------------------------------------------------------------------------------
-- Header User Component
--------------------------------------------------------------------------------

---@class HeaderUserProps
---@field user? User User object
---@field showAvatar? boolean Show avatar image
---@field showLevel? boolean Show level badge
---@field variant? "minimal"|"full" Display variant

---@class HeaderUserComponent
---@field type string Component type name
---@field props HeaderUserProps Component props

--------------------------------------------------------------------------------
-- Actions Component
--------------------------------------------------------------------------------

---@class ActionsProps
---@field actions? Action[] Action buttons
---@field spacing? number Spacing between actions

---@class ActionsComponent
---@field type string Component type name
---@field props ActionsProps Component props

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

--------------------------------------------------------------------------------
-- Header Render Module
--------------------------------------------------------------------------------

---@class HeaderRenderModule
---@field logo fun(logo_url?: string, title?: string): LogoComponent
---@field user fun(user?: User): HeaderUserComponent
---@field actions fun(actions?: Action[]): ActionsComponent

return {}
