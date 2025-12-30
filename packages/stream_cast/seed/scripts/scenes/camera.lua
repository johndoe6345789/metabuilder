-- Stream scene camera component
local function camera(id, label, source)
  return {
    type = "scene_camera",
    id = id,
    label = label,
    source = source
  }
end

return camera
