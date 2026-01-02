--- Stream scene layout component
---@param type "single"|"pip"|"split" Layout type
---@param sources? table[] Layout sources
---@return SceneLayoutComponent Layout component
local function layout(type, sources)
  return {
    type = "scene_layout",
    layoutType = type,
    sources = sources or {}
  }
end

return layout
