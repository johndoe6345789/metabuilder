-- Example: Dashboard stats cards with icons
local icons = require("icons")
local stat_card = require("stats.card")

---@class StatsExample
local M = {}

---Create example dashboard stats with icons
---@return UIComponent[]
function M.create_example_stats()
  return {
    stat_card.create({
      label = "Total Revenue",
      value = "$45,231.89",
      icon = icons.get("CHART_LINE"),
      change = "+20.1% from last month",
      positive = true,
      className = "col-span-1"
    }),
    stat_card.create({
      label = "Active Users",
      value = "2,350",
      icon = icons.get("USERS"),
      change = "+180 new users",
      positive = true,
      className = "col-span-1"
    }),
    stat_card.create({
      label = "Success Rate",
      value = "98.5%",
      icon = icons.get("SHIELD_CHECK"),
      change = "+2.5% improvement",
      positive = true,
      className = "col-span-1"
    }),
    stat_card.create({
      label = "Pending Tasks",
      value = 12,
      icon = icons.get("CLOCK"),
      change = "3 overdue",
      positive = false,
      className = "col-span-1"
    })
  }
end

---Create analytics dashboard
---@return UIComponent
function M.create_analytics_dashboard()
  return {
    type = "Box",
    props = { className = "p-6" },
    children = {
      {
        type = "Typography",
        props = { variant = "h4", text = "Analytics Dashboard", className = "mb-6" }
      },
      {
        type = "Grid",
        props = { container = true, spacing = 3 },
        children = M.create_example_stats()
      }
    }
  }
end

return M
