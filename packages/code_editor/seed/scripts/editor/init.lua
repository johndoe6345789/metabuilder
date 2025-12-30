-- Code editor module

---@class EditorModule
---@field syntax function Syntax highlighting configuration
---@field toolbar function Editor toolbar configuration
---@field gutter function Editor gutter configuration

---@type EditorModule
local editor = {
  syntax = require("editor.syntax"),
  toolbar = require("editor.toolbar"),
  gutter = require("editor.gutter")
}

return editor
