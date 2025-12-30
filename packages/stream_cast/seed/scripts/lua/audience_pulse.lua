---@class AudiencePulse
local M = {}

---@class Metrics
---@field messagesPerMinute? number
---@field reactionsPerMinute? number
---@field viewers? number

---@class PulseResult
---@field score number
---@field tier "surging"|"steady"|"cooling"

---@param metrics Metrics
---@return PulseResult
function M.score(metrics)
  local messages = metrics.messagesPerMinute or 0
  local reactions = metrics.reactionsPerMinute or 0
  local viewers = metrics.viewers or 1

  local raw = (messages * 0.6) + (reactions * 0.4)
  local score = (raw / viewers) * 100

  local tier = "steady"
  if score >= 80 then
    tier = "surging"
  elseif score <= 30 then
    tier = "cooling"
  end

  return {
    score = score,
    tier = tier
  }
end

return M
