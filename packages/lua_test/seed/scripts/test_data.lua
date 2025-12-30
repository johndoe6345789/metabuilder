-- Test data generation utilities
-- Provides functions for generating test fixtures

---@class TestDataGenerator
local M = {}

---@class TestDataTemplate
---@field [string] any Field template (value, function, or $variable)

---Generate test data from a template
---@param template TestDataTemplate Template defining field patterns
---@param count? number Number of items to generate (default 10)
---@return table[] Array of generated test data items
function M.generateTestData(template, count)
  local data = {}
  count = count or 10
  
  for i = 1, count do
    local item = {}
    for k, v in pairs(template) do
      if type(v) == "function" then
        item[k] = v(i)
      elseif type(v) == "string" and v:match("^%$") then
        -- Template variables
        local varName = v:sub(2)
        if varName == "index" then
          item[k] = i
        elseif varName == "random" then
          item[k] = math.random(1, 1000)
        elseif varName == "uuid" then
          item[k] = string.format("%08x-%04x-%04x-%04x-%012x",
            math.random(0, 0xffffffff),
            math.random(0, 0xffff),
            math.random(0, 0xffff),
            math.random(0, 0xffff),
            math.random(0, 0xffffffffffff))
        else
          item[k] = v
        end
      else
        item[k] = v
      end
    end
    data[#data + 1] = item
  end
  
  return data
end

return M
