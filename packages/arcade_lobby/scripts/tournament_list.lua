-- arcade_lobby: Tournament List Component
-- View and join active tournaments

local M = {}

function M.render(context)
  local user = context.user or {}
  local canCreateTournament = user.level and user.level >= 3

  local tournaments = context.tournaments or {
    { id = 1, name = "Weekend Warriors", game = "Space Shooter", participants = 16, maxParticipants = 32, prize = "100 tokens", status = "open" },
    { id = 2, name = "Speed Run Challenge", game = "Puzzle Quest", participants = 8, maxParticipants = 16, prize = "50 tokens", status = "open" },
    { id = 3, name = "Battle Royale", game = "Battle Arena", participants = 32, maxParticipants = 32, prize = "200 tokens", status = "in_progress" },
    { id = 4, name = "Racing League", game = "Racing Circuit", participants = 12, maxParticipants = 24, prize = "75 tokens", status = "open" }
  }

  local tournamentCards = {}
  for _, tournament in ipairs(tournaments) do
    local statusClass = "arcade_lobby_status_" .. tournament.status
    local canJoin = tournament.status == "open" and tournament.participants < tournament.maxParticipants

    table.insert(tournamentCards, {
      type = "div",
      className = "card arcade_lobby_tournament",
      children = {
        {
          type = "h3",
          className = "arcade_lobby_tournament_name",
          text = "🏆 " .. tournament.name
        },
        {
          type = "div",
          className = "arcade_lobby_tournament_info",
          children = {
            {
              type = "span",
              text = "Game: " .. tournament.game
            },
            {
              type = "span",
              text = "Players: " .. tournament.participants .. "/" .. tournament.maxParticipants
            },
            {
              type = "span",
              text = "Prize: " .. tournament.prize
            },
            {
              type = "span",
              className = statusClass,
              text = "Status: " .. tournament.status
            }
          }
        },
        {
          type = "button",
          className = "button arcade_lobby_button",
          text = canJoin and "Join Tournament" or "View Details",
          action = canJoin and "arcade.tournament.join" or "arcade.tournament.view",
          data = { tournamentId = tournament.id },
          disabled = not canJoin and tournament.status ~= "in_progress"
        }
      }
    })
  end

  local children = {
    {
      type = "h2",
      className = "arcade_lobby_heading",
      text = "Active Tournaments"
    }
  }

  if canCreateTournament then
    table.insert(children, {
      type = "button",
      className = "button arcade_lobby_button_primary",
      text = "+ Create Tournament",
      action = "arcade.tournament.create"
    })
  end

  table.insert(children, {
    type = "div",
    className = "arcade_lobby_tournament_list",
    children = tournamentCards
  })

  return {
    type = "div",
    className = "arcade_lobby_tournaments",
    children = children
  }
end

return M
