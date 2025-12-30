-- Code editor module

---@class EditorModule
---@field syntax function
---@field toolbar function
---@field gutter function
local editor = {
  syntax = require("editor.syntax"),
  toolbar = require("editor.toolbar"),
  gutter = require("editor.gutter")
}

return editor
