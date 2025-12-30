-- Code editor gutter (line numbers)
local function gutter(show_line_numbers, show_fold_markers)
  return {
    type = "editor_gutter",
    showLineNumbers = show_line_numbers ~= false,
    showFoldMarkers = show_fold_markers ~= false
  }
end

return gutter
