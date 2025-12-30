-- Page Analysis Operations
local M = {}

-- Analyze page structure
function M.analyze_structure()
  local text_sample = page_get_text_content(3000)
  local html_sample = page_get_html_sample(3000)
  
  -- Count elements
  local headings = dom_get_element_count("h1, h2, h3, h4, h5, h6")
  local paragraphs = dom_get_element_count("p")
  local links = dom_get_element_count("a")
  local images = dom_get_element_count("img")
  local buttons = dom_get_element_count("button")
  local inputs = dom_get_element_count("input")
  local forms = dom_get_element_count("form")
  
  return {
    success = true,
    structure = {
      text_length = #text_sample,
      html_length = #html_sample,
      element_counts = {
        headings = headings,
        paragraphs = paragraphs,
        links = links,
        images = images,
        buttons = buttons,
        inputs = inputs,
        forms = forms
      }
    }
  }
end

-- Detect page type
function M.detect_page_type()
  local url = page_get_url()
  local title = page_get_title()
  
  -- Check for common patterns
  local has_form = dom_get_element_count("form") > 0
  local has_login = dom_get_element_count("input[type='password']") > 0
  local has_table = dom_get_element_count("table") > 0
  local has_article = dom_get_element_count("article") > 0
  
  local page_type = "unknown"
  local confidence = 0.5
  
  if has_login then
    page_type = "login"
    confidence = 0.9
  elseif has_form and not has_login then
    page_type = "form"
    confidence = 0.8
  elseif has_table then
    page_type = "data_table"
    confidence = 0.7
  elseif has_article then
    page_type = "article"
    confidence = 0.8
  end
  
  return {
    success = true,
    page_type = page_type,
    confidence = confidence,
    indicators = {
      has_form = has_form,
      has_login = has_login,
      has_table = has_table,
      has_article = has_article
    }
  }
end

-- Generate analysis report
function M.generate_report()
  local structure = M.analyze_structure()
  local page_type = M.detect_page_type()
  local info = require("page_info").get_all()
  
  local report_lines = {
    "# Page Analysis Report",
    "",
    "## Overview",
    "- **Title:** " .. info.info.title,
    "- **URL:** " .. info.info.url,
    "- **Viewport:** " .. info.info.viewport.width .. " × " .. info.info.viewport.height,
    "- **Page Type:** " .. page_type.page_type .. " (confidence: " .. (page_type.confidence * 100) .. "%)",
    "",
    "## Structure",
    "- Headings: " .. structure.structure.element_counts.headings,
    "- Paragraphs: " .. structure.structure.element_counts.paragraphs,
    "- Links: " .. structure.structure.element_counts.links,
    "- Images: " .. structure.structure.element_counts.images,
    "- Buttons: " .. structure.structure.element_counts.buttons,
    "- Inputs: " .. structure.structure.element_counts.inputs,
    "- Forms: " .. structure.structure.element_counts.forms,
    "",
    "## Content",
    "- Text content length: " .. structure.structure.text_length .. " chars",
    "- HTML sample length: " .. structure.structure.html_length .. " chars"
  }
  
  return {
    success = true,
    report = table.concat(report_lines, "\n"),
    data = {
      structure = structure.structure,
      page_type = page_type,
      info = info.info
    }
  }
end

-- Get recommendations based on analysis
function M.get_recommendations()
  local structure = M.analyze_structure()
  local recommendations = {}
  
  local counts = structure.structure.element_counts
  
  if counts.headings == 0 then
    table.insert(recommendations, {
      type = "accessibility",
      priority = "high",
      message = "Add heading elements (h1-h6) for better document structure"
    })
  end
  
  if counts.images > 0 then
    table.insert(recommendations, {
      type = "accessibility",
      priority = "medium",
      message = "Ensure all images have alt text for accessibility"
    })
  end
  
  if counts.forms > 0 and counts.buttons == 0 then
    table.insert(recommendations, {
      type = "usability",
      priority = "medium",
      message = "Forms should have clear submit buttons"
    })
  end
  
  if counts.links > 50 then
    table.insert(recommendations, {
      type = "usability",
      priority = "low",
      message = "Consider grouping or paginating links for better navigation"
    })
  end
  
  return {
    success = true,
    recommendations = recommendations,
    count = #recommendations
  }
end

return M
