--- Metadata JSON schema validation facade
--- Re-exports validate_metadata for backward compatibility
---@module metadata_schema

local validate_metadata = require("validate_metadata")

---@class MetadataSchema
local M = {}

--- Validate metadata.json structure
---@param metadata Metadata The metadata object to validate
---@return boolean valid Whether the metadata is valid
---@return string[] errors List of validation errors
M.validate_metadata = validate_metadata

return M
