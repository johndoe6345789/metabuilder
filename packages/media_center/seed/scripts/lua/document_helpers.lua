---@alias DocumentFormat "md" | "markdown" | "html" | "docx" | "pdf" | "latex" | "epub" | "odt" | "rst" | "txt"

---@class DocumentConvertOptions
---@field toc? boolean Include table of contents
---@field template? string Custom template path
---@field title? string Document title
---@field author? string Document author
---@field date? string Document date
---@field paper_size? "a4" | "letter" | "legal" Paper size for PDF
---@field margin? string Margin (e.g., "1in", "2cm")
---@field highlight_style? string Code highlight style

---@class DocumentJob
---@field id string Job ID
---@field status string Job status
---@field progress? number Progress 0-100
---@field output_path? string Output file path
---@field error? string Error message

---@class DocumentHelpersModule
---@field convert fun(input_path: string, output_format: DocumentFormat, options?: DocumentConvertOptions): DocumentJob|nil, string?
---@field markdown_to_pdf fun(input_path: string, output_path?: string, options?: DocumentConvertOptions): DocumentJob|nil, string?
---@field markdown_to_html fun(input_path: string, output_path?: string, options?: DocumentConvertOptions): DocumentJob|nil, string?
---@field markdown_to_docx fun(input_path: string, output_path?: string, options?: DocumentConvertOptions): DocumentJob|nil, string?
---@field get_supported_formats fun(): table
local M = {}

local config = {
  base_url = "http://localhost:8090"
}

---Configure the helper
---@param opts table Configuration options
function M.configure(opts)
  if opts.base_url then config.base_url = opts.base_url end
end

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

---Generate output path from input path
---@param input_path string Input file path
---@param output_format string Output format extension
---@return string output_path Generated output path
local function generate_output_path(input_path, output_format)
  -- Remove extension and add new one
  local base = input_path:match("(.+)%.[^%.]+$") or input_path
  return base .. "." .. output_format
end

---Convert a document
---@param input_path string Path to input file
---@param output_format DocumentFormat Target format
---@param options? DocumentConvertOptions Conversion options
---@return DocumentJob|nil job Job info if successful
---@return string? error Error message if failed
function M.convert(input_path, output_format, options)
  if not input_path or input_path == "" then
    return nil, "Input path is required"
  end
  
  if not output_format or output_format == "" then
    return nil, "Output format is required"
  end
  
  options = options or {}
  
  local output_path = options.output_path or generate_output_path(input_path, output_format)
  
  -- Build request body
  local body = {
    type = "document_convert",
    params = {
      input_path = input_path,
      output_path = output_path,
      output_format = output_format,
      variables = {}
    },
    notify_user = true
  }
  
  -- Add options as variables
  if options.toc then
    body.params.variables.toc = "true"
  end
  if options.template then
    body.params.template_path = options.template
  end
  if options.title then
    body.params.variables.title = options.title
  end
  if options.author then
    body.params.variables.author = options.author
  end
  if options.date then
    body.params.variables.date = options.date
  end
  if options.paper_size then
    body.params.variables.papersize = options.paper_size
  end
  if options.margin then
    body.params.variables["geometry:margin"] = options.margin
  end
  
  -- HTTP POST /api/jobs would go here
  -- Return mock response for now
  return {
    id = "doc_" .. tostring(os.time()),
    status = "pending",
    progress = 0
  }
end

---Convert Markdown to PDF
---@param input_path string Path to markdown file
---@param output_path? string Path for PDF output (auto-generated if nil)
---@param options? DocumentConvertOptions Conversion options
---@return DocumentJob|nil job Job info if successful
---@return string? error Error message if failed
function M.markdown_to_pdf(input_path, output_path, options)
  options = options or {}
  options.output_path = output_path
  return M.convert(input_path, "pdf", options)
end

---Convert Markdown to HTML
---@param input_path string Path to markdown file
---@param output_path? string Path for HTML output (auto-generated if nil)
---@param options? DocumentConvertOptions Conversion options
---@return DocumentJob|nil job Job info if successful
---@return string? error Error message if failed
function M.markdown_to_html(input_path, output_path, options)
  options = options or {}
  options.output_path = output_path
  return M.convert(input_path, "html", options)
end

---Convert Markdown to DOCX
---@param input_path string Path to markdown file
---@param output_path? string Path for DOCX output (auto-generated if nil)
---@param options? DocumentConvertOptions Conversion options
---@return DocumentJob|nil job Job info if successful
---@return string? error Error message if failed
function M.markdown_to_docx(input_path, output_path, options)
  options = options or {}
  options.output_path = output_path
  return M.convert(input_path, "docx", options)
end

---Convert HTML to PDF
---@param input_path string Path to HTML file
---@param output_path? string Path for PDF output
---@param options? DocumentConvertOptions Conversion options
---@return DocumentJob|nil job Job info if successful
---@return string? error Error message if failed
function M.html_to_pdf(input_path, output_path, options)
  options = options or {}
  options.output_path = output_path
  return M.convert(input_path, "pdf", options)
end

---Convert DOCX to PDF
---@param input_path string Path to DOCX file
---@param output_path? string Path for PDF output
---@param options? DocumentConvertOptions Conversion options
---@return DocumentJob|nil job Job info if successful
---@return string? error Error message if failed
function M.docx_to_pdf(input_path, output_path, options)
  options = options or {}
  options.output_path = output_path
  return M.convert(input_path, "pdf", options)
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
