-- Form validation module
local validate = {
  required = require("validate.required"),
  email = require("validate.email"),
  min_length = require("validate.min_length"),
  max_length = require("validate.max_length"),
  pattern = require("validate.pattern")
}

return validate
