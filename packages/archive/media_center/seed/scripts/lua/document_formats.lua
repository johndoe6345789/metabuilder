--[[
  Document format definitions and utilities
]]

---@class DocumentFormatsModule
local M = {}

---Get supported input formats
---@return string[] formats List of input formats
function M.get_input_formats()
  return {
    "md", "markdown", "gfm", "commonmark",
    "html", "htm",
    "tex", "latex",
    "docx", "odt",
    "rst", "org", "txt",
    "json", "yaml"
  }
end

---Get supported output formats
---@return string[] formats List of output formats
function M.get_output_formats()
  return {
    "pdf", "html", "html5",
    "docx", "odt", "rtf",
    "epub", "epub3",
    "latex", "beamer",
    "markdown", "gfm",
    "plain", "json"
  }
end

---Get supported format conversions as a table
---@return table formats { input = {...}, output = {...} }
function M.get_supported_formats()
  return {
    input = M.get_input_formats(),
    output = M.get_output_formats()
  }
end

---Check if a conversion is supported
---@param from_format DocumentFormat Input format
---@param to_format DocumentFormat Output format
---@return boolean supported Whether conversion is supported
function M.supports_conversion(from_format, to_format)
  local input_formats = M.get_input_formats()
  local output_formats = M.get_output_formats()

  local input_ok = false
  for _, fmt in ipairs(input_formats) do
    if fmt == from_format then
      input_ok = true
      break
    end
  end

  local output_ok = false
  for _, fmt in ipairs(output_formats) do
    if fmt == to_format then
      output_ok = true
      break
    end
  end

  return input_ok and output_ok
end

---Get format display name
---@param format string Format code
---@return string name Display name
function M.get_format_name(format)
  local names = {
    md = "Markdown",
    markdown = "Markdown",
    gfm = "GitHub Flavored Markdown",
    html = "HTML",
    htm = "HTML",
    pdf = "PDF",
    docx = "Word Document",
    odt = "OpenDocument Text",
    rtf = "Rich Text Format",
    epub = "EPUB",
    latex = "LaTeX",
    tex = "LaTeX",
    rst = "reStructuredText",
    org = "Org-mode",
    txt = "Plain Text",
    json = "JSON",
    yaml = "YAML"
  }
  return names[format] or format:upper()
end

---Get format icon name (for UI)
---@param format string Format code
---@return string icon MUI icon name
function M.get_format_icon(format)
  local icons = {
    md = "Description",
    markdown = "Description",
    html = "Code",
    pdf = "PictureAsPdf",
    docx = "Article",
    odt = "Article",
    epub = "MenuBook",
    latex = "Functions",
    tex = "Functions"
  }
  return icons[format] or "InsertDriveFile"
end

return M
