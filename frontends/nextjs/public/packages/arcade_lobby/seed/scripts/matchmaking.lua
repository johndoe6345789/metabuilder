---@class Matchmaking
local M = {}

---@class Party
---@field size? number

---@param party Party
---@return "squad"|"duo"|"solo"
function M.assign_bucket(party)
  local size = party.size or 1
  if size >= 4 then
    return "squad"
  end
  if size == 2 then
    return "duo"
  end
  return "solo"
end

return M
