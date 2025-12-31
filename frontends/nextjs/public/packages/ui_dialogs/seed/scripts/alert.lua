---@class Alert
local M = {}

---@class AlertProps
---@field open boolean
---@field variant? "info"|"warning"|"error"
---@field title string
---@field message string

---@class UIComponent
---@field type string
---@field props? table
---@field children? table

---@param props AlertProps
---@return UIComponent
function M.render(props)
  local variant = props.variant or "info"
  local icon = variant == "error" and "alert-circle" or variant == "warning" and "alert-triangle" or "info"
  return {
    type = "Dialog",
    props = { open = props.open },
    children = {
      {
        type = "DialogContent",
        children = {
          { type = "DialogHeader", children = {
            { type = "Icon", props = { name = icon, className = variant == "error" and "text-red-500" or "text-blue-500" } },
            { type = "DialogTitle", props = { text = props.title } },
            { type = "DialogDescription", props = { text = props.message } }
          }},
          { type = "DialogFooter", children = {
            { type = "Button", props = { text = "OK", onClick = "onClose" } }
          }}
        }
      }
    }
  }
end

return M
