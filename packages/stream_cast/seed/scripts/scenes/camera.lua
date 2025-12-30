--- Stream scene camera component
---@param id string Camera ID
---@param label string Camera label
---@param source string Camera source
---@return SceneCameraComponent Camera component
---@class SceneCameraComponent
---@field type "scene_camera" Component type
---@field id string Camera ID
---@field label string Camera label
---@field source string Source identifier

---Create a camera scene source
---@param id string Camera ID
---@param label string Camera label
---@param source string Source identifier
---@return SceneCameraComponentlocal function camera(id, label, source)
  return {
    type = "scene_camera",
    id = id,
    label = label,
    source = source
  }
end

return camera
