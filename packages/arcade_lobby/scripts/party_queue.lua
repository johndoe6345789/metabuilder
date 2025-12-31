-- arcade_lobby: Party Queue Component
-- Create and join party queues for multiplayer games

local M = {}

function M.render(context)
  local party = context.party or {
    members = {},
    maxSize = 4,
    status = "open"
  }

  local memberList = {}
  for i, member in ipairs(party.members) do
    table.insert(memberList, {
      type = "div",
      className = "arcade_lobby_party_member",
      children = {
        {
          type = "span",
          text = "👤 " .. member
        }
      }
    })
  end

  -- Add empty slots
  for i = #party.members + 1, party.maxSize do
    table.insert(memberList, {
      type = "div",
      className = "arcade_lobby_party_slot_empty",
      children = {
        {
          type = "span",
          text = "⭕ Empty slot"
        }
      }
    })
  end

  return {
    type = "div",
    className = "arcade_lobby_party",
    children = {
      {
        type = "div",
        className = "card",
        children = {
          {
            type = "h2",
            className = "arcade_lobby_heading",
            text = "Party Queue"
          },
          {
            type = "div",
            className = "arcade_lobby_party_info",
            children = {
              {
                type = "span",
                text = #party.members .. " / " .. party.maxSize .. " players"
              },
              {
                type = "span",
                className = "arcade_lobby_status",
                text = "Status: " .. party.status
              }
            }
          },
          {
            type = "div",
            className = "arcade_lobby_party_members",
            children = memberList
          },
          {
            type = "div",
            className = "arcade_lobby_actions",
            children = {
              {
                type = "button",
                className = "button arcade_lobby_button",
                text = "Invite Friends",
                action = "arcade.party.invite"
              },
              {
                type = "button",
                className = "button arcade_lobby_button",
                text = "Start Queue",
                action = "arcade.party.queue",
                disabled = #party.members < 2
              }
            }
          }
        }
      }
    }
  }
end

return M
