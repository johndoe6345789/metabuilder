-- css_designer/seed/scripts/db/operations.lua
-- DBAL operations for Theme and Style entities
-- @module css_designer.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- THEME OPERATIONS
---------------------------------------------------------------------------

---@class ThemeCreateParams
---@field tenantId string
---@field name string
---@field baseTheme string|nil ('light', 'dark', or parent theme ID)
---@field variables table CSS variable definitions
---@field metadata table|nil

---Create a new theme
---@param dbal table DBAL client instance
---@param params ThemeCreateParams
---@return table Created theme
function M.createTheme(dbal, params)
  return dbal:create('Theme', {
    tenantId = params.tenantId,
    name = params.name,
    baseTheme = params.baseTheme or 'light',
    variables = json.encode(params.variables),
    metadata = params.metadata and json.encode(params.metadata) or nil,
    isActive = true,
    version = 1,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get theme by ID
---@param dbal table
---@param themeId string
---@return table|nil Theme with decoded variables
function M.getTheme(dbal, themeId)
  local theme = dbal:read('Theme', themeId)
  if theme then
    theme.variables = json.decode(theme.variables or '{}')
    if theme.metadata then
      theme.metadata = json.decode(theme.metadata)
    end
  end
  return theme
end

---Get theme by name
---@param dbal table
---@param tenantId string
---@param name string
---@return table|nil Theme
function M.getThemeByName(dbal, tenantId, name)
  local theme = dbal:findFirst('Theme', {
    where = { tenantId = tenantId, name = name },
  })
  if theme then
    theme.variables = json.decode(theme.variables or '{}')
  end
  return theme
end

---List themes for tenant
---@param dbal table
---@param tenantId string
---@param activeOnly boolean|nil
---@return table[] Themes
function M.listThemes(dbal, tenantId, activeOnly)
  local where = { tenantId = tenantId }
  if activeOnly then
    where.isActive = true
  end
  
  local result = dbal:list('Theme', {
    where = where,
    orderBy = { name = 'asc' },
    take = 50,
  })
  
  return result.items or {}
end

---Update theme
---@param dbal table
---@param themeId string
---@param updates table
---@return table Updated theme
function M.updateTheme(dbal, themeId, updates)
  if updates.variables and type(updates.variables) == 'table' then
    updates.variables = json.encode(updates.variables)
    -- Increment version on variable changes
    local theme = M.getTheme(dbal, themeId)
    if theme then
      updates.version = (theme.version or 1) + 1
    end
  end
  if updates.metadata and type(updates.metadata) == 'table' then
    updates.metadata = json.encode(updates.metadata)
  end
  updates.updatedAt = os.time() * 1000
  return dbal:update('Theme', themeId, updates)
end

---Set theme variable
---@param dbal table
---@param themeId string
---@param varName string CSS variable name
---@param value string Value
function M.setVariable(dbal, themeId, varName, value)
  local theme = M.getTheme(dbal, themeId)
  if not theme then
    error('Theme not found: ' .. themeId)
  end
  
  local vars = theme.variables or {}
  vars[varName] = value
  
  return M.updateTheme(dbal, themeId, { variables = vars })
end

---Clone theme
---@param dbal table
---@param themeId string
---@param newName string
---@return table Cloned theme
function M.cloneTheme(dbal, themeId, newName)
  local original = M.getTheme(dbal, themeId)
  if not original then
    error('Theme not found: ' .. themeId)
  end
  
  return M.createTheme(dbal, {
    tenantId = original.tenantId,
    name = newName,
    baseTheme = original.baseTheme,
    variables = original.variables,
    metadata = original.metadata,
  })
end

---Delete theme
---@param dbal table
---@param themeId string
function M.deleteTheme(dbal, themeId)
  return dbal:delete('Theme', themeId)
end

---------------------------------------------------------------------------
-- STYLE COMPONENT OPERATIONS
---------------------------------------------------------------------------

---@class StyleComponentParams
---@field tenantId string
---@field themeId string|nil
---@field name string
---@field selector string CSS selector
---@field styles table CSS properties
---@field variants table|nil Style variants

---Create style component
---@param dbal table
---@param params StyleComponentParams
---@return table Created component
function M.createComponent(dbal, params)
  return dbal:create('StyleComponent', {
    tenantId = params.tenantId,
    themeId = params.themeId,
    name = params.name,
    selector = params.selector,
    styles = json.encode(params.styles),
    variants = params.variants and json.encode(params.variants) or nil,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get component by ID
---@param dbal table
---@param componentId string
---@return table|nil Component
function M.getComponent(dbal, componentId)
  local comp = dbal:read('StyleComponent', componentId)
  if comp then
    comp.styles = json.decode(comp.styles or '{}')
    if comp.variants then
      comp.variants = json.decode(comp.variants)
    end
  end
  return comp
end

---List components for theme
---@param dbal table
---@param themeId string|nil
---@param tenantId string
---@return table[] Components
function M.listComponents(dbal, tenantId, themeId)
  local where = { tenantId = tenantId }
  if themeId then
    where.themeId = themeId
  end
  
  local result = dbal:list('StyleComponent', {
    where = where,
    orderBy = { name = 'asc' },
    take = 200,
  })
  
  return result.items or {}
end

---Update component styles
---@param dbal table
---@param componentId string
---@param styles table CSS properties
function M.updateStyles(dbal, componentId, styles)
  return dbal:update('StyleComponent', componentId, {
    styles = json.encode(styles),
    updatedAt = os.time() * 1000,
  })
end

---Delete component
---@param dbal table
---@param componentId string
function M.deleteComponent(dbal, componentId)
  return dbal:delete('StyleComponent', componentId)
end

---------------------------------------------------------------------------
-- CSS GENERATION
---------------------------------------------------------------------------

---Generate CSS variables from theme
---@param dbal table
---@param themeId string
---@return string CSS custom properties
function M.generateVariablesCSS(dbal, themeId)
  local theme = M.getTheme(dbal, themeId)
  if not theme then
    return ''
  end
  
  local css = ':root {\n'
  for name, value in pairs(theme.variables or {}) do
    css = css .. '  --' .. name .. ': ' .. value .. ';\n'
  end
  css = css .. '}\n'
  
  return css
end

---Generate CSS for all components
---@param dbal table
---@param tenantId string
---@param themeId string|nil
---@return string Generated CSS
function M.generateComponentsCSS(dbal, tenantId, themeId)
  local components = M.listComponents(dbal, tenantId, themeId)
  local css = ''
  
  for _, comp in ipairs(components) do
    local styles = json.decode(comp.styles or '{}')
    css = css .. comp.selector .. ' {\n'
    for prop, value in pairs(styles) do
      css = css .. '  ' .. prop .. ': ' .. value .. ';\n'
    end
    css = css .. '}\n\n'
    
    -- Add variants if present
    local variants = comp.variants and json.decode(comp.variants) or nil
    if variants then
      for variant, varStyles in pairs(variants) do
        css = css .. comp.selector .. ':' .. variant .. ' {\n'
        for prop, value in pairs(varStyles) do
          css = css .. '  ' .. prop .. ': ' .. value .. ';\n'
        end
        css = css .. '}\n\n'
      end
    end
  end
  
  return css
end

---Generate complete CSS bundle
---@param dbal table
---@param tenantId string
---@param themeId string
---@return string Complete CSS
function M.generateFullCSS(dbal, tenantId, themeId)
  local css = '/* Generated Theme CSS */\n\n'
  css = css .. M.generateVariablesCSS(dbal, themeId)
  css = css .. '\n/* Component Styles */\n\n'
  css = css .. M.generateComponentsCSS(dbal, tenantId, themeId)
  return css
end

---------------------------------------------------------------------------
-- PRESET MANAGEMENT
---------------------------------------------------------------------------

---Save theme as preset
---@param dbal table
---@param themeId string
---@param presetName string
---@param description string|nil
function M.saveAsPreset(dbal, themeId, presetName, description)
  local theme = M.getTheme(dbal, themeId)
  if not theme then
    error('Theme not found: ' .. themeId)
  end
  
  return dbal:create('ThemePreset', {
    tenantId = theme.tenantId,
    name = presetName,
    description = description,
    variables = json.encode(theme.variables),
    baseTheme = theme.baseTheme,
    createdAt = os.time() * 1000,
  })
end

---List available presets
---@param dbal table
---@param tenantId string
---@return table[] Presets
function M.listPresets(dbal, tenantId)
  local result = dbal:list('ThemePreset', {
    where = { tenantId = tenantId },
    orderBy = { name = 'asc' },
    take = 50,
  })
  return result.items or {}
end

---Apply preset to theme
---@param dbal table
---@param themeId string
---@param presetId string
function M.applyPreset(dbal, themeId, presetId)
  local preset = dbal:read('ThemePreset', presetId)
  if not preset then
    error('Preset not found: ' .. presetId)
  end
  
  local variables = json.decode(preset.variables or '{}')
  return M.updateTheme(dbal, themeId, {
    variables = variables,
    baseTheme = preset.baseTheme,
  })
end

return M
