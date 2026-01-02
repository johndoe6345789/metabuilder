-- Type definitions for ui_login package
-- Central types for login UI components
-- @meta

---@alias LoginState "idle"|"loading"|"success"|"error"

---@alias LoginMethod "password"|"oauth"|"sso"|"magic-link"|"2fa"

---@class LoginCredentials
---@field username string Username or email
---@field password string Password
---@field rememberMe? boolean Remember login
---@field tenantId? string Tenant identifier

---@class LoginResult
---@field success boolean Whether login succeeded
---@field user? AuthUser Authenticated user
---@field token? string Auth token
---@field error? string Error message
---@field requiresTwoFactor? boolean Whether 2FA is needed
---@field twoFactorToken? string Token for 2FA verification

---@class AuthUser
---@field id string User identifier
---@field username string Username
---@field email string Email address
---@field level number Permission level (0-6)
---@field role string Role name
---@field avatar? string Avatar URL
---@field tenantId string Tenant identifier

---@class TwoFactorRequest
---@field code string 2FA code
---@field token string 2FA token from login
---@field method "totp"|"sms"|"email" 2FA method

---@class RegisterCredentials
---@field username string Desired username
---@field email string Email address
---@field password string Password
---@field confirmPassword string Password confirmation
---@field acceptTerms boolean Accept terms and conditions
---@field tenantId? string Tenant identifier

---@class RegisterResult
---@field success boolean Whether registration succeeded
---@field user? AuthUser Created user
---@field error? string Error message
---@field requiresVerification? boolean Email verification needed
---@field verificationSent? boolean Verification email sent

---@class PasswordResetRequest
---@field email string Email address

---@class PasswordResetResult
---@field success boolean Whether reset was initiated
---@field message string Result message

---@class LoginFormProps
---@field onSubmit fun(credentials: LoginCredentials): void Submit callback
---@field onRegister? fun(): void Navigate to register
---@field onForgotPassword? fun(): void Navigate to forgot password
---@field loading? boolean Loading state
---@field error? string Error message
---@field methods? LoginMethod[] Available login methods
---@field showRememberMe? boolean Show remember me checkbox
---@field showTenantSelect? boolean Show tenant selector
---@field tenants? TenantOption[] Available tenants

---@class TenantOption
---@field id string Tenant identifier
---@field name string Tenant name
---@field logo? string Tenant logo URL

---@class RegisterFormProps
---@field onSubmit fun(credentials: RegisterCredentials): void Submit callback
---@field onLogin? fun(): void Navigate to login
---@field loading? boolean Loading state
---@field error? string Error message
---@field requireAcceptTerms? boolean Require terms acceptance
---@field termsUrl? string Terms of service URL
---@field privacyUrl? string Privacy policy URL

---@class LoginPageConfig
---@field title? string Page title
---@field subtitle? string Page subtitle
---@field logo? string Logo URL
---@field showRegister boolean Show register link
---@field showForgotPassword boolean Show forgot password link
---@field backgroundImage? string Background image URL

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
