-- DBAL Demo Package Initialization

---@class DbalDemoTab
---@field value string Tab identifier
---@field label string Tab display label

---@class DbalDemoConfig
---@field default_endpoint string Default DBAL endpoint URL
---@field default_api_key string Default API key
---@field tabs DbalDemoTab[] Available demo tabs

---@class DbalDemoInitResult
---@field success boolean Whether initialization succeeded
---@field message string Status message

---@class DbalDemoModule
---@field name string Package name
---@field version string Package version
---@field init fun(): DbalDemoInitResult Initialize the package
---@field get_config fun(): DbalDemoConfig Get configuration

---@type DbalDemoModule
local M = {}

M.name = "dbal_demo"
M.version = "1.0.0"

---Initialize the DBAL demo package
---@return DbalDemoInitResult
function M.init()
  return {
    success = true,
    message = "DBAL Demo package initialized"
  }
end

---Get demo configuration
---@return DbalDemoConfig
function M.get_config()
  return {
    default_endpoint = "",
    default_api_key = "",
    tabs = {
      { value = "kv", label = "Key-Value Store" },
      { value = "blob", label = "Blob Storage" },
      { value = "cache", label = "Cached Data" }
    }
  }
end

return M
