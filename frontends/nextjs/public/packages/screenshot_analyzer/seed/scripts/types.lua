-- LuaCATS type definitions for screenshot_analyzer package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Page Analysis Types
--------------------------------------------------------------------------------

---@class ElementCounts
---@field headings integer Number of heading elements
---@field paragraphs integer Number of paragraph elements
---@field links integer Number of link elements
---@field images integer Number of image elements
---@field buttons integer Number of button elements
---@field inputs integer Number of input elements
---@field forms integer Number of form elements
---@field tables integer Number of table elements

---@class PageStructure
---@field text_length integer Length of text content
---@field html_length integer Length of HTML sample
---@field element_counts ElementCounts Element count breakdown

---@class StructureResult
---@field success boolean Whether analysis succeeded
---@field structure PageStructure Structure analysis data

--------------------------------------------------------------------------------
-- Page Type Detection
--------------------------------------------------------------------------------

---@alias PageType
---| "homepage"
---| "login"
---| "dashboard"
---| "article"
---| "form"
---| "listing"
---| "profile"
---| "settings"
---| "error"
---| "unknown"

---@class PageTypeIndicators
---@field has_form boolean Whether page has forms
---@field has_login boolean Whether page has login form
---@field has_table boolean Whether page has tables
---@field has_article boolean Whether page has article element
---@field has_navigation boolean Whether page has nav element
---@field has_sidebar boolean Whether page has sidebar

---@class PageTypeResult
---@field success boolean Whether detection succeeded
---@field page_type PageType Detected page type
---@field confidence number Confidence score (0-1)
---@field indicators PageTypeIndicators Detection indicators

--------------------------------------------------------------------------------
-- Page Info
--------------------------------------------------------------------------------

---@class PageInfo
---@field url string Current page URL
---@field title string Page title
---@field description? string Meta description
---@field viewport? ViewportInfo Viewport dimensions
---@field loadTime? number Page load time in ms

---@class ViewportInfo
---@field width number Viewport width
---@field height number Viewport height
---@field devicePixelRatio number Device pixel ratio

--------------------------------------------------------------------------------
-- Screenshot Capture
--------------------------------------------------------------------------------

---@class CaptureOptions
---@field fullPage? boolean Capture full page
---@field selector? string CSS selector to capture
---@field format? "png"|"jpeg"|"webp" Image format
---@field quality? number Image quality (1-100)
---@field scale? number Screenshot scale factor

---@class CaptureResult
---@field success boolean Whether capture succeeded
---@field dataUrl? string Base64 data URL
---@field width? number Image width
---@field height? number Image height
---@field error? string Error message

--------------------------------------------------------------------------------
-- Recommendations
--------------------------------------------------------------------------------

---@alias RecommendationType "accessibility"|"usability"|"performance"|"seo"
---@alias RecommendationPriority "high"|"medium"|"low"

---@class Recommendation
---@field type RecommendationType Type of recommendation
---@field priority RecommendationPriority Priority level
---@field message string Recommendation message
---@field element? string Related element selector
---@field fix? string Suggested fix

---@class RecommendationsResult
---@field success boolean Whether analysis succeeded
---@field recommendations Recommendation[] List of recommendations
---@field count integer Number of recommendations
---@field byPriority table<RecommendationPriority, integer> Count by priority

--------------------------------------------------------------------------------
-- Report Generation
--------------------------------------------------------------------------------

---@class ReportData
---@field structure PageStructure Structure data
---@field page_type PageTypeResult Page type data
---@field info PageInfo Page info data
---@field recommendations Recommendation[] Recommendations

---@class ReportResult
---@field success boolean Whether report generation succeeded
---@field report string Markdown formatted report
---@field data ReportData Raw report data

--------------------------------------------------------------------------------
-- Analyzer Modules
--------------------------------------------------------------------------------

---@class AnalyzeModule
---@field analyze_structure fun(): StructureResult Analyze page structure
---@field detect_page_type fun(): PageTypeResult Detect page type
---@field get_recommendations fun(): RecommendationsResult Get improvement recommendations
---@field generate_report fun(): ReportResult Generate full report

---@class CaptureModule
---@field screenshot fun(options?: CaptureOptions): CaptureResult Take screenshot
---@field captureElement fun(selector: string, options?: CaptureOptions): CaptureResult Capture element

---@class PageInfoModule
---@field get fun(): PageInfo Get current page info
---@field getViewport fun(): ViewportInfo Get viewport info

return {}
