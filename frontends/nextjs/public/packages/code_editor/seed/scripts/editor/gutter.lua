-- Code editor gutter (line numbers)

---@class GutterConfig
---@field type string
---@field showLineNumbers boolean
---@field showFoldMarkers boolean

---@param show_line_numbers? boolean
---@param show_fold_markers? boolean
---@return GutterConfig
local function gutter(show_line_numbers, show_fold_markers)
  return {
    type = "editor_gutter",
    showLineNumbers = show_line_numbers ~= false,
    showFoldMarkers = show_fold_markers ~= false
  }
end

return gutter
