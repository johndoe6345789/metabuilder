-- Connection Management
local M = {}

M.logs = {}
M.status = "disconnected"

-- Connect to DBAL endpoint
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

-- Disconnect from DBAL
function M.disconnect()
  local timestamp = os.date("%H:%M:%S")
  table.insert(M.logs, timestamp .. ": Disconnected")
  M.status = "disconnected"
  
  return {
    success = true,
    message = "Disconnected"
  }
end

-- Get connection status
function M.get_status()
  return {
    status = M.status,
    is_connected = M.status == "connected"
  }
end

-- Get connection logs
function M.get_logs()
  return {
    logs = M.logs,
    count = #M.logs
  }
end

-- Clear logs
function M.clear_logs()
  M.logs = {}
  return {
    success = true,
    message = "Logs cleared"
  }
end

-- Add custom log entry
function M.log(message)
  local timestamp = os.date("%H:%M:%S")
  table.insert(M.logs, timestamp .. ": " .. message)
  return {
    success = true,
    entry = timestamp .. ": " .. message
  }
end

return M
