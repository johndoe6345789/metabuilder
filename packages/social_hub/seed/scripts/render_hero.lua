--- Render user hero section
---@param user User User data
---@return HeroSectionComponent Hero section component
local function render_hero(user)
  return {
    type = "hero_section",
    children = {
      { type = "avatar", props = { src = user.avatar, size = "xl" } },
      { type = "heading", props = { level = 1, text = user.name } },
      { type = "text", props = { variant = "muted", text = user.bio } }
    }
  }
end

return render_hero
