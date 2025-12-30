-- Stream scene layout component
local function layout(type, sources)
  return {
    type = "scene_layout",
    layoutType = type, -- "single", "pip", "split"
    sources = sources or {}
  }
end

return layout
