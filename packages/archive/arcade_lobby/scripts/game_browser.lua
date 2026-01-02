-- arcade_lobby: Game Browser Component
-- Browse available games and tournaments

local M = {}

function M.render(context)
  local games = context.games or {
    { id = 1, name = "Space Shooter", players = 12, difficulty = "Medium", image = "space.png" },
    { id = 2, name = "Puzzle Quest", players = 5, difficulty = "Easy", image = "puzzle.png" },
    { id = 3, name = "Battle Arena", players = 24, difficulty = "Hard", image = "battle.png" },
    { id = 4, name = "Racing Circuit", players = 8, difficulty = "Medium", image = "racing.png" }
  }

  local gameCards = {}
  for _, game in ipairs(games) do
    table.insert(gameCards, {
      type = "div",
      className = "card arcade_lobby_game_card",
      children = {
        {
          type = "h3",
          className = "arcade_lobby_game_title",
          text = game.name
        },
        {
          type = "div",
          className = "arcade_lobby_game_info",
          children = {
            {
              type = "span",
              className = "arcade_lobby_players",
              text = "👥 " .. game.players .. " online"
            },
            {
              type = "span",
              className = "arcade_lobby_difficulty",
              text = "⭐ " .. game.difficulty
            }
          }
        },
        {
          type = "button",
          className = "button arcade_lobby_button",
          text = "Play Now",
          action = "arcade.play",
          data = { gameId = game.id }
        }
      }
    })
  end

  return {
    type = "div",
    className = "arcade_lobby_browser",
    children = {
      {
        type = "h2",
        className = "arcade_lobby_heading",
        text = "🎮 Arcade Games"
      },
      {
        type = "div",
        className = "arcade_lobby_game_grid",
        children = gameCards
      }
    }
  }
end

return M
