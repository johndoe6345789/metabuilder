-- smtp_config/seed/scripts/db/operations.lua
-- DBAL operations for SMTP configuration
-- @module smtp_config.db.operations

local M = {}
local json = require('json')

---------------------------------------------------------------------------
-- SMTP CONFIGURATION OPERATIONS
---------------------------------------------------------------------------

---@class SMTPConfigParams
---@field tenantId string
---@field name string Configuration name
---@field host string SMTP host
---@field port number SMTP port
---@field secure boolean Use TLS
---@field username string
---@field password string Encrypted password
---@field fromName string Default sender name
---@field fromEmail string Default sender email
---@field replyTo string|nil

---Create or update SMTP configuration
---@param dbal table DBAL client instance
---@param params SMTPConfigParams
---@return table Created/updated config
function M.saveConfig(dbal, params)
  -- Check for existing config with same name
  local existing = dbal:findFirst('SMTPConfig', {
    where = { tenantId = params.tenantId, name = params.name },
  })
  
  if existing then
    return dbal:update('SMTPConfig', existing.id, {
      host = params.host,
      port = params.port,
      secure = params.secure,
      username = params.username,
      password = params.password,
      fromName = params.fromName,
      fromEmail = params.fromEmail,
      replyTo = params.replyTo,
      updatedAt = os.time() * 1000,
    })
  end
  
  return dbal:create('SMTPConfig', {
    tenantId = params.tenantId,
    name = params.name,
    host = params.host,
    port = params.port,
    secure = params.secure,
    username = params.username,
    password = params.password,
    fromName = params.fromName,
    fromEmail = params.fromEmail,
    replyTo = params.replyTo,
    isDefault = false,
    isVerified = false,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get configuration by ID
---@param dbal table
---@param configId string
---@return table|nil Config
function M.getConfig(dbal, configId)
  return dbal:read('SMTPConfig', configId)
end

---Get default configuration for tenant
---@param dbal table
---@param tenantId string
---@return table|nil Default config
function M.getDefaultConfig(dbal, tenantId)
  return dbal:findFirst('SMTPConfig', {
    where = { tenantId = tenantId, isDefault = true },
  })
end

---List all configurations for tenant
---@param dbal table
---@param tenantId string
---@return table[] Configs
function M.listConfigs(dbal, tenantId)
  local result = dbal:list('SMTPConfig', {
    where = { tenantId = tenantId },
    orderBy = { name = 'asc' },
    take = 50,
  })
  return result.items or {}
end

---Set as default configuration
---@param dbal table
---@param tenantId string
---@param configId string
function M.setDefault(dbal, tenantId, configId)
  -- Clear existing default
  local configs = M.listConfigs(dbal, tenantId)
  for _, config in ipairs(configs) do
    if config.isDefault then
      dbal:update('SMTPConfig', config.id, { isDefault = false })
    end
  end
  
  -- Set new default
  return dbal:update('SMTPConfig', configId, {
    isDefault = true,
    updatedAt = os.time() * 1000,
  })
end

---Mark configuration as verified
---@param dbal table
---@param configId string
function M.markVerified(dbal, configId)
  return dbal:update('SMTPConfig', configId, {
    isVerified = true,
    verifiedAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Mark configuration as failed
---@param dbal table
---@param configId string
---@param error string
function M.markFailed(dbal, configId, error)
  return dbal:update('SMTPConfig', configId, {
    isVerified = false,
    lastError = error,
    updatedAt = os.time() * 1000,
  })
end

---Delete configuration
---@param dbal table
---@param configId string
---@return boolean Success
function M.deleteConfig(dbal, configId)
  return dbal:delete('SMTPConfig', configId)
end

---------------------------------------------------------------------------
-- EMAIL TEMPLATE OPERATIONS
---------------------------------------------------------------------------

---@class EmailTemplateParams
---@field tenantId string
---@field name string Template name/key
---@field subject string Email subject (can include placeholders)
---@field bodyHtml string HTML body
---@field bodyText string|nil Plain text body
---@field variables table|nil Variable definitions

---Create email template
---@param dbal table
---@param params EmailTemplateParams
---@return table Created template
function M.createTemplate(dbal, params)
  return dbal:create('EmailTemplate', {
    tenantId = params.tenantId,
    name = params.name,
    subject = params.subject,
    bodyHtml = params.bodyHtml,
    bodyText = params.bodyText,
    variables = params.variables and json.encode(params.variables) or '[]',
    isActive = true,
    createdAt = os.time() * 1000,
    updatedAt = os.time() * 1000,
  })
end

---Get template by name
---@param dbal table
---@param tenantId string
---@param name string
---@return table|nil Template
function M.getTemplate(dbal, tenantId, name)
  local template = dbal:findFirst('EmailTemplate', {
    where = { tenantId = tenantId, name = name, isActive = true },
  })
  if template and template.variables then
    template.variables = json.decode(template.variables)
  end
  return template
end

---List all templates
---@param dbal table
---@param tenantId string
---@return table[] Templates
function M.listTemplates(dbal, tenantId)
  local result = dbal:list('EmailTemplate', {
    where = { tenantId = tenantId },
    orderBy = { name = 'asc' },
    take = 100,
  })
  return result.items or {}
end

---Update template
---@param dbal table
---@param templateId string
---@param updates table
---@return table Updated template
function M.updateTemplate(dbal, templateId, updates)
  if updates.variables and type(updates.variables) == 'table' then
    updates.variables = json.encode(updates.variables)
  end
  updates.updatedAt = os.time() * 1000
  return dbal:update('EmailTemplate', templateId, updates)
end

---Delete template
---@param dbal table
---@param templateId string
---@return boolean Success
function M.deleteTemplate(dbal, templateId)
  return dbal:delete('EmailTemplate', templateId)
end

---------------------------------------------------------------------------
-- EMAIL LOG OPERATIONS
---------------------------------------------------------------------------

---Log an email send
---@param dbal table
---@param tenantId string
---@param configId string
---@param to string
---@param subject string
---@param templateName string|nil
---@param status string sent|failed|queued
---@param error string|nil
function M.logEmail(dbal, tenantId, configId, to, subject, templateName, status, error)
  return dbal:create('EmailLog', {
    tenantId = tenantId,
    configId = configId,
    recipient = to,
    subject = subject,
    templateName = templateName,
    status = status,
    error = error,
    sentAt = os.time() * 1000,
  })
end

---List email logs
---@param dbal table
---@param tenantId string
---@param status string|nil Filter by status
---@param take number|nil
---@return table[] Logs
function M.listEmailLogs(dbal, tenantId, status, take)
  local where = { tenantId = tenantId }
  
  if status then
    where.status = status
  end
  
  local result = dbal:list('EmailLog', {
    where = where,
    orderBy = { sentAt = 'desc' },
    take = take or 50,
  })
  
  return result.items or {}
end

---Get email stats
---@param dbal table
---@param tenantId string
---@param days number|nil Number of days to look back
---@return table Stats
function M.getEmailStats(dbal, tenantId, days)
  local cutoff = (os.time() - (days or 30) * 86400) * 1000
  
  local result = dbal:list('EmailLog', {
    where = { tenantId = tenantId },
    take = 10000,
  })
  
  local stats = {
    total = 0,
    sent = 0,
    failed = 0,
    queued = 0,
  }
  
  for _, log in ipairs(result.items or {}) do
    if log.sentAt >= cutoff then
      stats.total = stats.total + 1
      local status = log.status or 'sent'
      stats[status] = (stats[status] or 0) + 1
    end
  end
  
  return stats
end

---------------------------------------------------------------------------
-- DEFAULT TEMPLATES
---------------------------------------------------------------------------

---Create default email templates
---@param dbal table
---@param tenantId string
---@return table[] Created templates
function M.createDefaultTemplates(dbal, tenantId)
  local templates = {}
  
  -- Welcome email
  table.insert(templates, M.createTemplate(dbal, {
    tenantId = tenantId,
    name = 'welcome',
    subject = 'Welcome to {{appName}}!',
    bodyHtml = [[
      <h1>Welcome, {{username}}!</h1>
      <p>Thank you for joining {{appName}}.</p>
      <p>Click <a href="{{loginUrl}}">here</a> to get started.</p>
    ]],
    bodyText = 'Welcome, {{username}}! Thank you for joining {{appName}}.',
    variables = {
      { name = 'username', required = true },
      { name = 'appName', required = true },
      { name = 'loginUrl', required = true },
    },
  }))
  
  -- Password reset
  table.insert(templates, M.createTemplate(dbal, {
    tenantId = tenantId,
    name = 'password-reset',
    subject = 'Reset Your Password',
    bodyHtml = [[
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="{{resetUrl}}">Reset Password</a></p>
      <p>This link expires in {{expiresIn}} hours.</p>
    ]],
    bodyText = 'Reset your password: {{resetUrl}}',
    variables = {
      { name = 'resetUrl', required = true },
      { name = 'expiresIn', default = '24' },
    },
  }))
  
  -- Email verification
  table.insert(templates, M.createTemplate(dbal, {
    tenantId = tenantId,
    name = 'verify-email',
    subject = 'Verify Your Email',
    bodyHtml = [[
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email address:</p>
      <p><a href="{{verifyUrl}}">Verify Email</a></p>
    ]],
    bodyText = 'Verify your email: {{verifyUrl}}',
    variables = {
      { name = 'verifyUrl', required = true },
    },
  }))
  
  return templates
end

return M
