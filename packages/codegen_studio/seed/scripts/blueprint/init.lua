-- Codegen blueprint module

---@class BlueprintModule
---@field component function
---@field service function
---@field model function

---@type BlueprintModule
local blueprint = {
  component = require("blueprint.component"),
  service = require("blueprint.service"),
  model = require("blueprint.model")
}

return blueprint
