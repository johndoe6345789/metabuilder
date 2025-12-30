-- Stream scene screen share component
local function screen(id, label)
  return {
    type = "scene_screen",
    id = id,
    label = label
  }
end

return screen
