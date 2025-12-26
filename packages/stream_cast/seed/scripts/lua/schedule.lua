local M = {}

function M.next_scene(schedule, current_index)
  local index = current_index or 1
  local entry = schedule[index]
  if not entry then
    return nil
  end
  return entry.scene
end

return M
