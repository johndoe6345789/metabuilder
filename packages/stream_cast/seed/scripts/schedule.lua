-- Stream scheduling
local M = {}

function M.render_item(stream)
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

function M.render_list(streams)
  local items = {}
  for _, stream in ipairs(streams) do
    table.insert(items, M.render_item(stream))
  end
  return {
    type = "schedule_list",
    children = items
  }
end

function M.create(data)
  return {
    action = "schedule_stream",
    data = {
      title = data.title,
      start_time = data.start_time,
      duration = data.duration or 60
    }
  }
end

function M.cancel(stream_id)
  return {
    action = "cancel_stream",
    stream_id = stream_id
  }
end

return M
