-- screenshot_analyzer/seed/scripts/db/operations.lua
-- DBAL operations for Screenshot analysis
-- @module screenshot_analyzer.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- SCREENSHOT OPERATIONS
---------------------------------------------------------------------------

---@class ScreenshotParams
---@field tenantId string
---@field userId string
---@field url string Image URL or base64
---@field filename string|nil Original filename
---@field metadata table|nil Additional metadata

---Save screenshot
---@param dbal table DBAL client instance
---@param params ScreenshotParams
---@return table Created screenshot
function M.saveScreenshot(dbal, params)
  return dbal:create('Screenshot', {
    tenantId = params.tenantId,
    userId = params.userId,
    url = params.url,
    filename = params.filename,
    metadata = params.metadata and json.encode(params.metadata) or nil,
    status = 'uploaded',
    createdAt = os.time() * 1000,
  })
end

---Get screenshot by ID
---@param dbal table
---@param screenshotId string
---@return table|nil Screenshot
function M.getScreenshot(dbal, screenshotId)
  local ss = dbal:read('Screenshot', screenshotId)
  if ss and ss.metadata then
    ss.metadata = json.decode(ss.metadata)
  end
  return ss
end

---List user's screenshots
---@param dbal table
---@param tenantId string
---@param userId string
---@param take number|nil
---@return table[] Screenshots
function M.listUserScreenshots(dbal, tenantId, userId, take)
  local result = dbal:list('Screenshot', {
    where = { tenantId = tenantId, userId = userId },
    orderBy = { createdAt = 'desc' },
    take = take or 50,
  })
  
  return result.items or {}
end

---Update screenshot status
---@param dbal table
---@param screenshotId string
---@param status string
function M.updateStatus(dbal, screenshotId, status)
  return dbal:update('Screenshot', screenshotId, { status = status })
end

---Delete screenshot
---@param dbal table
---@param screenshotId string
function M.deleteScreenshot(dbal, screenshotId)
  -- Delete associated analyses first
  local analyses = M.listAnalyses(dbal, screenshotId)
  for _, analysis in ipairs(analyses) do
    dbal:delete('ScreenshotAnalysis', analysis.id)
  end
  
  return dbal:delete('Screenshot', screenshotId)
end

---------------------------------------------------------------------------
-- ANALYSIS OPERATIONS
---------------------------------------------------------------------------

---@class AnalysisParams
---@field screenshotId string
---@field analysisType string (component, color, layout, accessibility)
---@field result table Analysis result data

---Create analysis record
---@param dbal table
---@param params AnalysisParams
---@return table Created analysis
function M.createAnalysis(dbal, params)
  return dbal:create('ScreenshotAnalysis', {
    screenshotId = params.screenshotId,
    analysisType = params.analysisType,
    result = json.encode(params.result),
    confidence = params.result.confidence,
    createdAt = os.time() * 1000,
  })
end

---Get analysis by ID
---@param dbal table
---@param analysisId string
---@return table|nil Analysis
function M.getAnalysis(dbal, analysisId)
  local analysis = dbal:read('ScreenshotAnalysis', analysisId)
  if analysis and analysis.result then
    analysis.result = json.decode(analysis.result)
  end
  return analysis
end

---List analyses for screenshot
---@param dbal table
---@param screenshotId string
---@return table[] Analyses
function M.listAnalyses(dbal, screenshotId)
  local result = dbal:list('ScreenshotAnalysis', {
    where = { screenshotId = screenshotId },
    orderBy = { createdAt = 'desc' },
    take = 50,
  })
  
  local analyses = result.items or {}
  for _, analysis in ipairs(analyses) do
    if analysis.result then
      analysis.result = json.decode(analysis.result)
    end
  end
  
  return analyses
end

---Get analysis by type
---@param dbal table
---@param screenshotId string
---@param analysisType string
---@return table|nil Analysis
function M.getAnalysisByType(dbal, screenshotId, analysisType)
  local analysis = dbal:findFirst('ScreenshotAnalysis', {
    where = { screenshotId = screenshotId, analysisType = analysisType },
  })
  
  if analysis and analysis.result then
    analysis.result = json.decode(analysis.result)
  end
  
  return analysis
end

---------------------------------------------------------------------------
-- DETECTED COMPONENT OPERATIONS
---------------------------------------------------------------------------

---@class DetectedComponentParams
---@field analysisId string
---@field componentType string
---@field bounds table {x, y, width, height}
---@field confidence number
---@field properties table|nil

---Save detected component
---@param dbal table
---@param params DetectedComponentParams
---@return table Created component
function M.saveDetectedComponent(dbal, params)
  return dbal:create('DetectedComponent', {
    analysisId = params.analysisId,
    componentType = params.componentType,
    bounds = json.encode(params.bounds),
    confidence = params.confidence,
    properties = params.properties and json.encode(params.properties) or nil,
    createdAt = os.time() * 1000,
  })
end

---Get detected components for analysis
---@param dbal table
---@param analysisId string
---@return table[] Components
function M.getDetectedComponents(dbal, analysisId)
  local result = dbal:list('DetectedComponent', {
    where = { analysisId = analysisId },
    orderBy = { confidence = 'desc' },
    take = 200,
  })
  
  local components = result.items or {}
  for _, comp in ipairs(components) do
    if comp.bounds then
      comp.bounds = json.decode(comp.bounds)
    end
    if comp.properties then
      comp.properties = json.decode(comp.properties)
    end
  end
  
  return components
end

---Get components by type
---@param dbal table
---@param analysisId string
---@param componentType string
---@return table[] Components
function M.getComponentsByType(dbal, analysisId, componentType)
  local all = M.getDetectedComponents(dbal, analysisId)
  local filtered = {}
  
  for _, comp in ipairs(all) do
    if comp.componentType == componentType then
      table.insert(filtered, comp)
    end
  end
  
  return filtered
end

---------------------------------------------------------------------------
-- COLOR PALETTE OPERATIONS
---------------------------------------------------------------------------

---@class ColorPaletteParams
---@field analysisId string
---@field colors table[] Array of {hex, rgb, usage, count}
---@field dominantColor string|nil

---Save color palette
---@param dbal table
---@param params ColorPaletteParams
---@return table Created palette
function M.saveColorPalette(dbal, params)
  return dbal:create('ColorPalette', {
    analysisId = params.analysisId,
    colors = json.encode(params.colors),
    dominantColor = params.dominantColor,
    createdAt = os.time() * 1000,
  })
end

---Get color palette for analysis
---@param dbal table
---@param analysisId string
---@return table|nil Palette
function M.getColorPalette(dbal, analysisId)
  local palette = dbal:findFirst('ColorPalette', {
    where = { analysisId = analysisId },
  })
  
  if palette and palette.colors then
    palette.colors = json.decode(palette.colors)
  end
  
  return palette
end

---------------------------------------------------------------------------
-- GENERATED CODE OPERATIONS
---------------------------------------------------------------------------

---@class GeneratedCodeParams
---@field screenshotId string
---@field framework string (react, vue, html, qml)
---@field code string
---@field metadata table|nil

---Save generated code
---@param dbal table
---@param params GeneratedCodeParams
---@return table Created code
function M.saveGeneratedCode(dbal, params)
  return dbal:create('GeneratedCode', {
    screenshotId = params.screenshotId,
    framework = params.framework,
    code = params.code,
    metadata = params.metadata and json.encode(params.metadata) or nil,
    createdAt = os.time() * 1000,
  })
end

---Get generated code for screenshot
---@param dbal table
---@param screenshotId string
---@param framework string
---@return table|nil Generated code
function M.getGeneratedCode(dbal, screenshotId, framework)
  return dbal:findFirst('GeneratedCode', {
    where = { screenshotId = screenshotId, framework = framework },
  })
end

---List all generated code for screenshot
---@param dbal table
---@param screenshotId string
---@return table[] Generated codes
function M.listGeneratedCode(dbal, screenshotId)
  local result = dbal:list('GeneratedCode', {
    where = { screenshotId = screenshotId },
    orderBy = { createdAt = 'desc' },
    take = 20,
  })
  
  return result.items or {}
end

return M
