-- Dashboard section layout

---@class SectionLayoutConfig
---@field type string
---@field title string
---@field children table

---@param title string Section title
---@param children? table Child elements (default: {})
---@return SectionLayoutConfig
local function section(title, children)
  return {
    type = "section",
    title = title,
    children = children or {}
  }
end

return section
