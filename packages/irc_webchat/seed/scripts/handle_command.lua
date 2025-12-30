-- Handle IRC Command
-- Processes IRC commands like /help, /users, /clear, /me

function handleCommand(command, channelId, username, onlineUsers)
  local parts = {}
  for part in string.gmatch(command, "%S+") do
    table.insert(parts, part)
  end

  local cmd = parts[1]:lower()
  local response = {
    id = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999),
    username = "System",
    userId = "system",
    type = "system",
    timestamp = os.time() * 1000,
    channelId = channelId
  }

  if cmd == "/help" then
    response.message = "Available commands: /help, /users, /clear, /me <action>"
  elseif cmd == "/users" then
    local userCount = #onlineUsers
    local userList = table.concat(onlineUsers, ", ")
    response.message = "Online users (" .. userCount .. "): " .. userList
  elseif cmd == "/clear" then
    response.message = "CLEAR_MESSAGES"
    response.type = "command"
  elseif cmd == "/me" then
    if #parts > 1 then
      local action = table.concat(parts, " ", 2)
      response.message = action
      response.username = username
      response.userId = username
      response.type = "system"
    else
      response.message = "Usage: /me <action>"
    end
  else
    response.message = "Unknown command: " .. cmd .. ". Type /help for available commands."
  end

  return response
end

return handleCommand
