-- Intro page render component

---@class IntroProps
---@field eyebrow? string
---@field title? string
---@field description? string

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

local M = {}

---@param props IntroProps
---@return UIComponent
function M.render(props)
  return {
    type = "Stack",
    props = { spacing = 2 },
    children = {
      props.eyebrow and {
        type = "Typography",
        props = { variant = "overline", text = props.eyebrow, className = "text-primary" }
      } or nil,
      {
        type = "Typography",
        props = { variant = "h4", text = props.title or "Welcome" }
      },
      props.description and {
        type = "Typography",
        props = { variant = "body1", text = props.description, className = "text-muted-foreground" }
      } or nil
    }
  }
end

return M
