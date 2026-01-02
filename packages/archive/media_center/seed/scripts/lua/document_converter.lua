--[[
  Document conversion functions
]]

---@class DocumentConverterModule
local M = {}

local config = {
  base_url = "http://localhost:8090"
}

---Configure the converter
---@param opts table Configuration options
function M.configure(opts)
  if opts.base_url then config.base_url = opts.base_url end
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

return M
