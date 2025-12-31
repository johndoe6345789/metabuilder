-- Snapshot testing utilities
-- Provides record/match snapshot functionality

---@class SnapshotModule
local M = {}

-- Forward declaration for serialize
local serialize

---Serialize a value to a deterministic string representation
---@param value any Value to serialize
---@param seen? table Circular reference tracker
---@return string Serialized string
function M.serialize(value, seen)
  seen = seen or {}
  local t = type(value)
  
  if t == "nil" then
    return "nil"
  elseif t == "boolean" then
    return value and "true" or "false"
  elseif t == "number" then
    return tostring(value)
  elseif t == "string" then
    return string.format("%q", value)
  elseif t == "table" then
    if seen[value] then
      return "<circular>"
    end
    seen[value] = true
    
    local parts = {}
    local keys = {}
    
    for k in pairs(value) do
      keys[#keys + 1] = k
    end
    
    table.sort(keys, function(a, b)
      return tostring(a) < tostring(b)
    end)
    
    for _, k in ipairs(keys) do
      parts[#parts + 1] = "[" .. M.serialize(k, seen) .. "]=" .. M.serialize(value[k], seen)
    end
    
    return "{" .. table.concat(parts, ",") .. "}"
  else
    return "<" .. t .. ">"
  end
end

---@class Snapshot
---@field record fun(key: string, value: any) Record a snapshot value
---@field match fun(key: string, value: any): boolean Match against recorded snapshot
---@field getSnapshots fun(): table<string, string> Get all recorded snapshots
---@field update fun(key: string, value: any) Update a snapshot value

---Create a snapshot testing helper
---@param name string Name for this snapshot set
---@return Snapshot Snapshot object with record/match methods
function M.createSnapshot(name)
  local snapshots = {}
  
  return {
    ---Record a snapshot value
    ---@param key string Snapshot identifier
    ---@param value any Value to record
    record = function(key, value)
      snapshots[key] = M.serialize(value)
    end,
    
    ---Match value against recorded snapshot
    ---@param key string Snapshot identifier
    ---@param value any Value to compare
    ---@return boolean True if matches or first run
    match = function(key, value)
      local serialized = M.serialize(value)
      if snapshots[key] then
        return snapshots[key] == serialized
      end
      -- First run - record the snapshot
      snapshots[key] = serialized
      return true
    end,
    
    ---Get all recorded snapshots
    ---@return table<string, string>
    getSnapshots = function()
      return snapshots
    end,
    
    ---Update a snapshot value
    ---@param key string Snapshot identifier
    ---@param value any New value to record
    update = function(key, value)
      snapshots[key] = M.serialize(value)
    end
  }
end

return M
