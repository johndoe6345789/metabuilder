-- Schemas module facade
-- Re-exports all schemas functions for backward compatibility

local M = {}

M.render = require("schemas.render")
M.addSchema = require("schemas.add_schema")
M.editSchema = require("schemas.edit_schema")

return M
