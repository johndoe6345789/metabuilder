-- Header logo section

---@class LogoComponent
---@field type string
---@field url string
---@field title string
---@field link string

---@param logo_url? string
---@param title? string
---@return LogoComponent
local function logo_section(logo_url, title)
  return {
    type = "logo",
    url = logo_url or "/logo.svg",
    title = title or "MetaBuilder",
    link = "/"
  }
end

return logo_section
