--- Lua file validation facade
--- Re-exports Lua validation functions for backward compatibility
---@module lua_validator

local validate_lua_syntax = require("validate_lua_syntax")
local validate_lua_structure = require("validate_lua_structure")
local validate_test_file = require("validate_test_file")
local validate_script_exports = require("validate_script_exports")
local validate_package_lua_files = require("validate_package_lua_files")
local check_lua_quality = require("check_lua_quality")
local validate_lua_requires = require("validate_lua_requires")

---@class LuaValidator
local M = {}

M.validate_lua_syntax = validate_lua_syntax
M.validate_lua_structure = validate_lua_structure
M.validate_test_file = validate_test_file
M.validate_script_exports = validate_script_exports
M.validate_package_lua_files = validate_package_lua_files
M.check_lua_quality = check_lua_quality
M.validate_lua_requires = validate_lua_requires

return M
