--- Generate a unique step ID
---@return string Unique step identifier
local function generate_step_id()
  return "step_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999)
end

return generate_step_id
