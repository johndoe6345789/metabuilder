-- DBAL Demo Package Initialization
local M = {}

M.name = "dbal_demo"
M.version = "1.0.0"

function M.init()
  return {
    success = true,
    message = "DBAL Demo package initialized"
  }
end

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
