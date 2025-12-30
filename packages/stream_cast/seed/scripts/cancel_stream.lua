--- Cancel a scheduled stream
---@param stream_id string Stream ID to cancel
---@return CancelStreamAction Cancel stream action
local function cancel_stream(stream_id)
  return {
    action = "cancel_stream",
    stream_id = stream_id
  }
end

return cancel_stream
