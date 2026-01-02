-- Type definitions for ui_auth package
-- Central types for authentication UI components
-- @meta

---@alias AuthState "unauthenticated"|"authenticating"|"authenticated"|"error"

---@alias GateAction "allow"|"deny"|"redirect"|"challenge"

---@class AuthUser
---@field id string User identifier
---@field username string Username
---@field email string Email address
---@field level number Permission level (0-6)
---@field role string Role name
---@field avatar? string Avatar URL
---@field tenantId string Tenant identifier

---@class AuthContext
---@field user? AuthUser Current user
---@field state AuthState Authentication state
---@field error? string Error message
---@field isLoading boolean Whether auth is loading

---@class GateConfig
---@field minLevel number Minimum permission level required
---@field allowedRoles? string[] Specific roles allowed
---@field deniedMessage? string Custom denied message
---@field redirectUrl? string Redirect URL when denied
---@field showLoginPrompt boolean Show login prompt when denied

---@class GateResult
---@field action GateAction Gate decision
---@field reason? string Reason for denial
---@field redirectUrl? string Where to redirect

---@class DeniedPageProps
---@field title? string Page title
---@field message? string Denial message
---@field requiredLevel? number Level required
---@field currentLevel? number User's current level
---@field showLoginButton boolean Show login button
---@field showBackButton boolean Show back button
---@field onLogin? fun(): void Login callback
---@field onBack? fun(): void Back callback

---@class AuthGuardProps
---@field minLevel number Minimum level required
---@field fallback? UIComponent Component to show when denied
---@field children UIComponent[] Children to protect
---@field onDenied? fun(reason: string): void Denied callback

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
