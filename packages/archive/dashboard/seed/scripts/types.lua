-- Type definitions for dashboard package
-- Central types file consolidating all module types
-- @meta

-- Re-export module types
local stats_types = require("stats.types")
local layout_types = require("layout.types")

---@alias TrendDirection "up"|"down"|"flat"

---@alias StatVariant "default"|"primary"|"success"|"warning"|"error"|"info"

---@alias ChartType "line"|"bar"|"area"|"pie"|"donut"|"gauge"

---@class StatValue
---@field current number|string Current value
---@field previous? number Previous value for comparison
---@field change? number Percentage change
---@field trend? TrendDirection Trend direction

---@class StatCardConfig
---@field id string Unique stat identifier
---@field label string Display label
---@field value StatValue|number|string Stat value
---@field icon? string Icon name from fakemui icons
---@field variant? StatVariant Card color variant
---@field format? "number"|"currency"|"percentage"|"compact" Value format
---@field precision? number Decimal precision
---@field prefix? string Value prefix (e.g., "$")
---@field suffix? string Value suffix (e.g., "%")
---@field href? string Link when clicked
---@field loading? boolean Loading state
---@field sparkline? number[] Mini chart data

---@class StatGridConfig
---@field columns? number Number of columns (1-6)
---@field gap? number Gap between cards
---@field stats StatCardConfig[] Stats to display

---@class ChartDataPoint
---@field x string|number X-axis value
---@field y number Y-axis value
---@field label? string Point label
---@field color? string Point color

---@class ChartSeries
---@field id string Series identifier
---@field name string Series display name
---@field data ChartDataPoint[] Series data points
---@field color? string Series color
---@field type? ChartType Override chart type for series

---@class ChartConfig
---@field id string Chart identifier
---@field title? string Chart title
---@field type ChartType Chart type
---@field series ChartSeries[] Chart data series
---@field xAxis? AxisConfig X-axis configuration
---@field yAxis? AxisConfig Y-axis configuration
---@field legend? LegendConfig Legend configuration
---@field tooltip? TooltipConfig Tooltip configuration
---@field height? number Chart height in pixels
---@field loading? boolean Loading state
---@field animate? boolean Enable animations

---@class AxisConfig
---@field label? string Axis label
---@field min? number Minimum value
---@field max? number Maximum value
---@field format? string Value format
---@field ticks? number Number of ticks
---@field gridLines? boolean Show grid lines

---@class LegendConfig
---@field show boolean Show legend
---@field position "top"|"bottom"|"left"|"right" Legend position
---@field align "start"|"center"|"end" Legend alignment

---@class TooltipConfig
---@field show boolean Show tooltips
---@field format? fun(value: number, series: string): string Custom format function

---@class DashboardWidget
---@field id string Widget identifier
---@field type "stats"|"chart"|"table"|"custom" Widget type
---@field title? string Widget title
---@field config StatGridConfig|ChartConfig|table Widget configuration
---@field layout WidgetLayout Widget layout
---@field refreshInterval? number Auto-refresh interval in seconds
---@field loading? boolean Loading state
---@field error? string Error message

---@class WidgetLayout
---@field x number Grid column position
---@field y number Grid row position
---@field w number Width in grid units
---@field h number Height in grid units
---@field minW? number Minimum width
---@field minH? number Minimum height
---@field maxW? number Maximum width
---@field maxH? number Maximum height
---@field static? boolean Prevent dragging/resizing

---@class DashboardConfig
---@field id string Dashboard identifier
---@field title string Dashboard title
---@field description? string Dashboard description
---@field widgets DashboardWidget[] Dashboard widgets
---@field columns number Grid columns
---@field rowHeight number Grid row height
---@field gap number Gap between widgets
---@field editable? boolean Allow editing layout
---@field refreshAll? number Global refresh interval

---@class DashboardState
---@field config DashboardConfig Current configuration
---@field editing boolean Edit mode active
---@field selectedWidget string|nil Selected widget ID
---@field loading table<string, boolean> Widget loading states
---@field errors table<string, string> Widget error states
---@field data table<string, any> Widget data cache

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
