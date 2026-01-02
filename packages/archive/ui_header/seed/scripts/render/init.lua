-- Header render module
---@class HeaderRenderModule
---@field logo fun(logo_url?: string, title?: string): LogoComponent
---@field user fun(user?: User): HeaderUserComponent
---@field actions fun(actions?: Action[]): ActionsComponent

---@type HeaderRenderModule
local render = {
  logo = require("render.logo"),
  user = require("render.user"),
  actions = require("render.actions")
}

return render
