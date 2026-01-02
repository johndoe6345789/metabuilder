local render_schedule_item = require("render_schedule_item")

--- Render schedule list
---@param streams ScheduledStream[] Array of scheduled streams
---@return ScheduleListComponent Schedule list component
local function render_schedule_list(streams)
  local items = {}
  for _, stream in ipairs(streams) do
    table.insert(items, render_schedule_item(stream))
  end
  return {
    type = "schedule_list",
    children = items
  }
end

return render_schedule_list
