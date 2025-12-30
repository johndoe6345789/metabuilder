-- Code editor syntax highlighting
local function syntax(language)
  local themes = {
    typescript = { keyword = "#569cd6", string = "#ce9178", comment = "#6a9955" },
    lua = { keyword = "#c586c0", string = "#ce9178", comment = "#6a9955" },
    python = { keyword = "#569cd6", string = "#ce9178", comment = "#6a9955" }
  }
  return themes[language] or themes.typescript
end

return syntax
