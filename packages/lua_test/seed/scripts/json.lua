-- JSON parser for loading test cases
-- Lightweight parser for test case data

---@class JSONParser
local M = {}

---Decode a JSON string into a Lua value
---@param str string JSON string to parse
---@return any Parsed value (table, string, number, boolean, or nil)
function M.decode(str)
  local pos = 1
  
  local function skip_whitespace()
    while pos <= #str and str:sub(pos, pos):match("%s") do
      pos = pos + 1
    end
  end
  
  local function parse_string()
    pos = pos + 1 -- skip opening quote
    local start = pos
    while pos <= #str do
      local c = str:sub(pos, pos)
      if c == '"' then
        local result = str:sub(start, pos - 1)
        pos = pos + 1
        -- Handle escape sequences
        result = result:gsub("\\n", "\n"):gsub("\\t", "\t"):gsub("\\r", "\r")
        result = result:gsub('\\"', '"'):gsub("\\\\", "\\")
        return result
      elseif c == "\\" then
        pos = pos + 2 -- skip escape sequence
      else
        pos = pos + 1
      end
    end
    error("Unterminated string")
  end
  
  local function parse_number()
    local start = pos
    while pos <= #str and str:sub(pos, pos):match("[%d%.eE%+%-]") do
      pos = pos + 1
    end
    return tonumber(str:sub(start, pos - 1))
  end
  
  local parse_value -- forward declaration
  
  local function parse_array()
    pos = pos + 1 -- skip [
    local arr = {}
    skip_whitespace()
    if str:sub(pos, pos) == "]" then
      pos = pos + 1
      return arr
    end
    while true do
      skip_whitespace()
      arr[#arr + 1] = parse_value()
      skip_whitespace()
      local c = str:sub(pos, pos)
      if c == "]" then
        pos = pos + 1
        return arr
      elseif c == "," then
        pos = pos + 1
      else
        error("Expected ',' or ']' in array at position " .. pos)
      end
    end
  end
  
  local function parse_object()
    pos = pos + 1 -- skip {
    local obj = {}
    skip_whitespace()
    if str:sub(pos, pos) == "}" then
      pos = pos + 1
      return obj
    end
    while true do
      skip_whitespace()
      if str:sub(pos, pos) ~= '"' then
        error("Expected string key at position " .. pos)
      end
      local key = parse_string()
      skip_whitespace()
      if str:sub(pos, pos) ~= ":" then
        error("Expected ':' at position " .. pos)
      end
      pos = pos + 1
      skip_whitespace()
      obj[key] = parse_value()
      skip_whitespace()
      local c = str:sub(pos, pos)
      if c == "}" then
        pos = pos + 1
        return obj
      elseif c == "," then
        pos = pos + 1
      else
        error("Expected ',' or '}' in object at position " .. pos)
      end
    end
  end
  
  parse_value = function()
    skip_whitespace()
    local c = str:sub(pos, pos)
    if c == '"' then
      return parse_string()
    elseif c == "{" then
      return parse_object()
    elseif c == "[" then
      return parse_array()
    elseif c == "t" and str:sub(pos, pos + 3) == "true" then
      pos = pos + 4
      return true
    elseif c == "f" and str:sub(pos, pos + 4) == "false" then
      pos = pos + 5
      return false
    elseif c == "n" and str:sub(pos, pos + 3) == "null" then
      pos = pos + 4
      return nil
    elseif c:match("[%d%-]") then
      return parse_number()
    else
      error("Unexpected character '" .. c .. "' at position " .. pos)
    end
  end
  
  return parse_value()
end

return M
