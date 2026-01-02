--- Render a schedule item
---@param stream ScheduledStream Scheduled stream data
---@return ScheduleItemComponent Schedule item component
local function render_schedule_item(stream)
  return {
    type = "schedule_item",
    props = {
      title = stream.title,
      start_time = stream.start_time,
      duration = stream.duration,
      thumbnail = stream.thumbnail
    }
  }
end

return render_schedule_item
