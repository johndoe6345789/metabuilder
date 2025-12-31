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

-- Unified document helpers module - combines format definitions and conversion
local formats = require("lua.document_formats")
local converter = require("lua.document_converter")

local M = {}

-- Re-export format functions
M.get_input_formats = formats.get_input_formats
M.get_output_formats = formats.get_output_formats
M.get_supported_formats = formats.get_supported_formats
M.supports_conversion = formats.supports_conversion
M.get_format_name = formats.get_format_name
M.get_format_icon = formats.get_format_icon

-- Re-export converter functions
M.configure = converter.configure
M.convert = converter.convert
M.markdown_to_pdf = converter.markdown_to_pdf
M.markdown_to_html = converter.markdown_to_html
M.markdown_to_docx = converter.markdown_to_docx
M.html_to_pdf = converter.html_to_pdf
M.docx_to_pdf = converter.docx_to_pdf

return M
