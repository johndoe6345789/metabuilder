-- Connection Management

---@class ConnectResult
---@field success boolean Whether connection succeeded
---@field endpoint string? The endpoint connected to
---@field api_key string? Masked API key or status
---@field timestamp string? Connection timestamp
---@field message string Status message
---@field error string? Error message if failed

---@class DisconnectResult
---@field success boolean Whether disconnection succeeded
---@field message string Status message

---@class ConnectionStatus
---@field status string Current status ("connected" | "disconnected")
---@field is_connected boolean Whether currently connected

---@class LogsResult
---@field logs string[] Array of log entries
---@field count number Number of log entries

---@class ClearLogsResult
---@field success boolean Whether logs were cleared
---@field message string Status message

---@class LogEntryResult
---@field success boolean Whether log was added
---@field entry string The formatted log entry

---@class ConnectionModule
---@field logs string[] Connection logs
---@field status string Current connection status
---@field connect fun(endpoint: string, api_key: string?): ConnectResult Connect to DBAL
---@field disconnect fun(): DisconnectResult Disconnect from DBAL
---@field get_status fun(): ConnectionStatus Get connection status
---@field get_logs fun(): LogsResult Get connection logs
---@field clear_logs fun(): ClearLogsResult Clear logs
---@field log fun(message: string): LogEntryResult Add custom log

---@type ConnectionModule
local M = {}

M.logs = {}
M.status = "disconnected"

---Connect to DBAL endpoint
---@param endpoint string The DBAL endpoint URL
---@param api_key string? Optional API key
---@return ConnectResult
function M.connect(endpoint, api_key)
  if not endpoint or endpoint == "" then
    return { success = false, error = "Endpoint is required" }
  end
  
  local timestamp = os.date("%H:%M:%S")
  local log_entry = timestamp .. ": Connected to " .. endpoint
  
  table.insert(M.logs, log_entry)
  M.status = "connected"
  
  return {
    success = true,
    endpoint = endpoint,
    api_key = api_key and "***" or "Not provided",
    timestamp = timestamp,
    message = "Connected successfully"
  }
end

---Disconnect from DBAL
---@return DisconnectResult
function M.disconnect()
  local timestamp = os.date("%H:%M:%S")
  table.insert(M.logs, timestamp .. ": Disconnected")
  M.status = "disconnected"
  
  return {
    success = true,
    message = "Disconnected"
  }
end

---Get connection status
---@return ConnectionStatus
function M.get_status()
  return {
    status = M.status,
    is_connected = M.status == "connected"
  }
end

---Get connection logs
---@return LogsResult
function M.get_logs()
  return {
    logs = M.logs,
    count = #M.logs
  }
end

---Clear logs
---@return ClearLogsResult
function M.clear_logs()
  M.logs = {}
  return {
    success = true,
    message = "Logs cleared"
  }
end

---Add custom log entry
---@param message string Message to log
---@return LogEntryResult
function M.log(message)
  local timestamp = os.date("%H:%M:%S")
  table.insert(M.logs, timestamp .. ": " .. message)
  return {
    success = true,
    entry = timestamp .. ": " .. message
  }
end

return M
