---@class QueueMetrics
local M = {}

---@class Queue
---@field players? number
---@field waitSeconds? number

---@class QueueSummary
---@field totalPlayers number
---@field longestWaitSeconds number

---@param queues Queue[]
---@return QueueSummary
function M.summarize(queues)
  local total_players = 0
  local longest_wait = 0

  for _, queue in ipairs(queues) do
    total_players = total_players + (queue.players or 0)
    if (queue.waitSeconds or 0) > longest_wait then
      longest_wait = queue.waitSeconds
    end
  end

  return {
    totalPlayers = total_players,
    longestWaitSeconds = longest_wait
  }
end

return M
