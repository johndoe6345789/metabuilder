-- SMTP configuration module
require("smtp.types")
local json = require("json")

---@class SMTPModule
local M = {}

-- Load SMTP configuration data from JSON
---@type SMTPConfigData
M.configData = json.load("config.json")

---Get default SMTP configuration
---@return SMTPConfig
function M.getDefaults()
  return M.configData.defaults
end

---Get all field definitions
---@return SMTPField[]
function M.getFields()
  return M.configData.fields
end

---Get a specific field definition
---@param name string
---@return SMTPField|nil
function M.getField(name)
  for _, field in ipairs(M.configData.fields) do
    if field.name == name then
      return field
    end
  end
  return nil
end

---Validate SMTP configuration
---@param config SMTPConfig
---@return ValidationResult
function M.validate(config)
  local errors = {}

  -- Validate host
  if not config.host or config.host == "" then
    errors.host = "SMTP host is required"
  end

  -- Validate port
  if not config.port or config.port < 1 or config.port > 65535 then
    errors.port = "Port must be between 1 and 65535"
  end

  -- Validate username
  if not config.username or config.username == "" then
    errors.username = "Username is required"
  end

  -- Validate password
  if not config.password or config.password == "" then
    errors.password = "Password is required"
  end

  -- Validate fromEmail
  if not config.fromEmail or config.fromEmail == "" then
    errors.fromEmail = "From email is required"
  elseif not string.match(config.fromEmail, "^[^%s@]+@[^%s@]+%.[^%s@]+$") then
    errors.fromEmail = "Invalid email format"
  end

  -- Validate fromName
  if not config.fromName or config.fromName == "" then
    errors.fromName = "From name is required"
  end

  return {
    valid = next(errors) == nil,
    errors = errors
  }
end

---Create a default configuration
---@return SMTPConfig
function M.createDefault()
  return {
    host = M.configData.defaults.host,
    port = M.configData.defaults.port,
    username = M.configData.defaults.username,
    password = M.configData.defaults.password,
    fromEmail = M.configData.defaults.fromEmail,
    fromName = M.configData.defaults.fromName,
    secure = M.configData.defaults.secure
  }
end

return M
