--- Stream scene screen share component
---@param id string Screen ID
---@param label string Screen label
---@return SceneScreenComponent Screen component
local function screen(id, label)
  return {
    type = "scene_screen",
    id = id,
    label = label
  }
end

return screen
