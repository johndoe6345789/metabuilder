-- Form fields module
-- Re-exports all field types

local fields = {
  text = require("fields.text"),
  email = require("fields.email"),
  password = require("fields.password"),
  number = require("fields.number"),
  textarea = require("fields.textarea")
}

return fields
