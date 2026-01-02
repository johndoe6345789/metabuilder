-- Type definitions for smtp_config package
-- Central types for SMTP email configuration
-- @meta

---@alias SMTPEncryption "none"|"tls"|"ssl"|"starttls"

---@alias SMTPAuthMethod "plain"|"login"|"cram-md5"|"oauth2"

---@class SMTPConfig
---@field host string SMTP server hostname
---@field port number SMTP server port (25, 465, 587)
---@field encryption SMTPEncryption Encryption method
---@field username string SMTP username
---@field password string SMTP password (encrypted)
---@field authMethod SMTPAuthMethod Authentication method
---@field fromEmail string Default sender email
---@field fromName string Default sender name
---@field replyTo? string Reply-to email address
---@field timeout number Connection timeout in seconds
---@field maxRetries number Maximum retry attempts

---@class SMTPField
---@field id string Field identifier
---@field name string Field name
---@field type "text"|"password"|"number"|"select" Field type
---@field label string Display label
---@field placeholder? string Placeholder text
---@field required boolean Whether field is required
---@field helpText? string Help text
---@field options? SMTPFieldOption[] Options for select fields

---@class SMTPFieldOption
---@field value string|number Option value
---@field label string Option label

---@class ValidationResult
---@field valid boolean Whether validation passed
---@field errors table<string, string> Field errors
---@field warnings? table<string, string> Field warnings

---@class SMTPTestResult
---@field success boolean Whether test succeeded
---@field message string Result message
---@field duration number Test duration in ms
---@field details? SMTPTestDetails Detailed results

---@class SMTPTestDetails
---@field connected boolean Connection established
---@field authenticated boolean Authentication succeeded
---@field tlsEnabled boolean TLS enabled
---@field serverResponse string Server response
---@field capabilities string[] Server capabilities

---@class EmailTemplate
---@field id string Template identifier
---@field name string Template name
---@field subject string Email subject
---@field body string Email body (HTML or text)
---@field isHtml boolean Whether body is HTML
---@field variables string[] Template variables

---@class SendEmailRequest
---@field to string|string[] Recipient(s)
---@field cc? string|string[] CC recipient(s)
---@field bcc? string|string[] BCC recipient(s)
---@field subject string Email subject
---@field body string Email body
---@field isHtml? boolean Whether body is HTML
---@field attachments? EmailAttachment[] File attachments
---@field template? string Template ID to use
---@field templateData? table<string, any> Template variable values

---@class EmailAttachment
---@field filename string Attachment filename
---@field content string Base64 encoded content
---@field contentType string MIME type

---@class SendEmailResult
---@field success boolean Whether send succeeded
---@field messageId? string Message ID from server
---@field error? string Error message if failed
---@field timestamp number Send timestamp

---@class SMTPConfigProps
---@field config SMTPConfig Current configuration
---@field onSave fun(config: SMTPConfig): void Save callback
---@field onTest fun(): Promise<SMTPTestResult> Test callback
---@field onCancel? fun(): void Cancel callback
---@field readonly? boolean Read-only mode

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
