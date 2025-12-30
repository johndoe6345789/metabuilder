--- Calculate total count from summary items
---@param items SummaryItem[] Summary items
---@return number Total count
local function calculate_total(items)
  local total = 0
  for _, item in ipairs(items) do
    local count = item.count or 0
    if count > 0 then
      total = total + count
    end
  end
  return total
end

return calculate_total
