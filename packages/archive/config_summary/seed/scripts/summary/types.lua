-- Type definitions for config summary

---@class SummaryRow
---@field label string
---@field value string|number
---@field visible? boolean

---@class SummaryConfig
---@field title string
---@field rows SummaryRow[]
---@field wrapperClass? string
---@field titleClass? string
---@field gridClass? string

---@class AggregateConfig
---@field schemas? table[]
---@field workflows? table[]
---@field luaScripts? table[]
---@field [string] any

---@class StyleConfig
---@field defaultWrapperClass string
---@field defaultTitleClass string
---@field defaultGridClass string
---@field defaultRowClass string
---@field defaultLabelClass string
---@field defaultValueClass string

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]
