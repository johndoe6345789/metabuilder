--- Schedule a new stream
---@param data { title: string, start_time: string, duration?: number } Schedule data
---@return ScheduleStreamAction Schedule stream action
local function schedule_stream(data)
  return {
    action = "schedule_stream",
    data = {
      title = data.title,
      start_time = data.start_time,
      duration = data.duration or 60
    }
  }
end

return schedule_stream
