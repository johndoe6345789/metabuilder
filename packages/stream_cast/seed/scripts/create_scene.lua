--- Create a new scene
---@param name string Scene name
---@param sources? table[] Scene sources
---@return CreateSceneAction Create scene action
local function create_scene(name, sources)
  return {
    action = "create_scene",
    data = {
      name = name,
      sources = sources or {}
    }
  }
end

return create_scene
