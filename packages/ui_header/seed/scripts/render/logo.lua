-- Header logo section
local function logo_section(logo_url, title)
  return {
    type = "logo",
    url = logo_url or "/logo.svg",
    title = title or "MetaBuilder",
    link = "/"
  }
end

return logo_section
