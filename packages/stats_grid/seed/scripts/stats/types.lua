-- Type definitions for stats grid

---@alias StatColor "white"|"red"|"yellow"|"blue"|"green"|"orange"|"purple"|"gray"

---@class StatItem
---@field key string
---@field label string
---@field value number
---@field color StatColor

---@class StatsData
---@field [string] number

---@class StatConfig
---@field key string
---@field label string
---@field color StatColor

---@class StatsGridProps
---@field stats StatsData
---@field config? StatConfig[]
---@field gridClass? string
---@field cardClass? string

---@class GridConfig
---@field defaultGridClass string
---@field defaultCardClass string
---@field colorClasses table<StatColor, string>

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]
