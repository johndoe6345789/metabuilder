-- LuaCATS type definitions for config_summary package
-- Re-exports types from summary/types.lua for consistency
-- See: https://luals.github.io/wiki/annotations/

-- Import from subdirectory types
local summaryTypes = require("summary.types") or {}

--------------------------------------------------------------------------------
-- Summary Row Types
--------------------------------------------------------------------------------

---@class SummaryRow
---@field label string Row label
---@field value string|number Row value
---@field visible? boolean Whether row is visible

---@class SummaryConfig
---@field title string Section title
---@field rows SummaryRow[] Data rows
---@field wrapperClass? string Wrapper CSS class
---@field titleClass? string Title CSS class
---@field gridClass? string Grid CSS class

--------------------------------------------------------------------------------
-- Aggregate Config Types
--------------------------------------------------------------------------------

---@class AggregateConfig
---@field schemas? table[] Schema definitions
---@field workflows? table[] Workflow definitions
---@field luaScripts? table[] Lua script definitions
---@field users? table[] User definitions
---@field packages? table[] Package definitions
---@field [string] any Additional config sections

--------------------------------------------------------------------------------
-- Style Configuration
--------------------------------------------------------------------------------

---@class StyleConfig
---@field defaultWrapperClass string Default wrapper CSS class
---@field defaultTitleClass string Default title CSS class
---@field defaultGridClass string Default grid CSS class
---@field defaultRowClass string Default row CSS class
---@field defaultLabelClass string Default label CSS class
---@field defaultValueClass string Default value CSS class

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

--------------------------------------------------------------------------------
-- Summary Module
--------------------------------------------------------------------------------

---@class SummaryModule
---@field render fun(config: SummaryConfig): UIComponent Render summary section
---@field aggregate fun(config: AggregateConfig): SummaryConfig[] Generate summaries from config
---@field renderAll fun(configs: SummaryConfig[]): UIComponent Render all summaries

return summaryTypes
