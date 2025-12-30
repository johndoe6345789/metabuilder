-- Form validation module

---@class ValidateModule
---@field required function
---@field email function
---@field min_length function
---@field max_length function
---@field pattern function

local validate = {
  required = require("validate.required"),
  email = require("validate.email"),
  min_length = require("validate.min_length"),
  max_length = require("validate.max_length"),
  pattern = require("validate.pattern")
}

return validate
