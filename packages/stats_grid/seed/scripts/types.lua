-- Type definitions for stats_grid package
-- Central types file consolidating all module types
-- @meta

-- Re-export module types
local stats_types = require("stats.types")

---@alias StatColor "white"|"red"|"yellow"|"blue"|"green"|"orange"|"purple"|"gray"|"primary"|"secondary"|"success"|"warning"|"error"|"info"

---@alias FormatType "number"|"currency"|"percentage"|"compact"|"duration"|"bytes"|"custom"

---@alias TrendDirection "up"|"down"|"flat"

---@class StatValue
---@field current number|string Current value
---@field previous? number Previous value for comparison
---@field target? number Target/goal value
---@field min? number Minimum value for range
---@field max? number Maximum value for range

---@class StatTrend
---@field direction TrendDirection Trend direction
---@field value number Change value
---@field percentage number Change percentage
---@field period string Comparison period (e.g., "day", "week", "month")

---@class StatItem
---@field id string Unique stat identifier
---@field key string Data key
---@field label string Display label
---@field value StatValue|number Stat value
---@field color? StatColor Card color
---@field icon? string Icon name from fakemui icons
---@field trend? StatTrend Trend information
---@field format? FormatType Value format type
---@field formatOptions? FormatOptions Format configuration
---@field href? string Link when clicked
---@field tooltip? string Hover tooltip
---@field loading? boolean Loading state
---@field error? string Error message
---@field sparkline? number[] Mini chart data points

---@class FormatOptions
---@field locale? string Locale for formatting (e.g., "en-US")
---@field currency? string Currency code (e.g., "USD")
---@field precision? number Decimal places
---@field prefix? string Value prefix
---@field suffix? string Value suffix
---@field compact? boolean Use compact notation
---@field custom? fun(value: number): string Custom format function

---@class GridLayout
---@field columns number Number of columns (1-6)
---@field gap? number Gap between cards in pixels
---@field responsive? ResponsiveLayout Responsive breakpoints

---@class ResponsiveLayout
---@field xs? number Columns at xs breakpoint
---@field sm? number Columns at sm breakpoint
---@field md? number Columns at md breakpoint
---@field lg? number Columns at lg breakpoint
---@field xl? number Columns at xl breakpoint

---@class StatCardStyle
---@field variant? "default"|"outlined"|"elevated" Card variant
---@field size? "small"|"medium"|"large" Card size
---@field showIcon? boolean Show icon
---@field showTrend? boolean Show trend indicator
---@field showSparkline? boolean Show sparkline chart
---@field iconPosition? "left"|"right"|"top" Icon position
---@field valuePosition? "left"|"center"|"right" Value alignment

---@class StatsGridConfig
---@field id string Grid identifier
---@field title? string Grid title
---@field description? string Grid description
---@field stats StatItem[] Stats to display
---@field layout? GridLayout Layout configuration
---@field style? StatCardStyle Card style configuration
---@field refreshInterval? number Auto-refresh interval in seconds
---@field emptyMessage? string Message when no stats
---@field loading? boolean Overall loading state

---@class StatsData
---@field [string] number|StatValue Raw stats data

---@class StatConfig
---@field key string Data key to match
---@field label string Display label
---@field color? StatColor Card color
---@field icon? string Icon name
---@field format? FormatType Value format
---@field priority? number Display order priority

---@class StatsGridProps
---@field stats StatsData Stats data object
---@field config? StatConfig[] Configuration per stat
---@field layout? GridLayout Layout configuration
---@field style? StatCardStyle Card style
---@field className? string Additional CSS class
---@field onStatClick? fun(stat: StatItem): void Stat click handler
---@field onRefresh? fun(): void Refresh callback

---@class GridConfig
---@field defaultGridClass string Default grid CSS class
---@field defaultCardClass string Default card CSS class
---@field colorClasses table<StatColor, string> Color to CSS class mapping

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
