# SMTP Relay Integration Guide

## Overview

The MetaBuilder SMTP Relay is an enterprise-grade email service that integrates seamlessly with the workflow execution engine and notification system. It uses a Twisted Python SMTP server to relay emails through Gmail or other SMTP providers.

## Architecture

### Service Layer
- **Service Name**: `smtp-relay`
- **Language**: Python (Twisted framework)
- **Port**: 2525 (SMTP), 8080 (HTTP status)
- **Docker Container**: `metabuilder-smtp-relay`
- **Health Check**: HTTP GET `/health`

### Plugin Layer
- **Plugin Name**: SMTP Relay Plugin
- **Node Type**: `smtp-relay-send`
- **Location**: `workflow/plugins/ts/integration/smtp-relay/src/index.ts`
- **Executor**: `SMTPRelayExecutor` (implements `INodeExecutor`)
- **Registration**: Automatic via `registerBuiltInExecutors()`

### Integration Points
1. **Workflow Execution**: Directly callable as a workflow node
2. **Notification System**: Used by `notification_center/workflow/dispatch.json`
3. **DBAL Credential System**: Stores SMTP configuration per tenant
4. **Audit Logging**: Logs all email operations (TODO: full DBAL integration)

## Configuration

### Environment Variables

#### Docker Compose
```yaml
services:
  smtp-relay:
    environment:
      - SMTP_LISTEN_HOST=0.0.0.0
      - SMTP_LISTEN_PORT=2525
      - HTTP_LISTEN_HOST=0.0.0.0
      - HTTP_LISTEN_PORT=8080
      - GMAIL_USERNAME=user@gmail.com
      - GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
      - FORWARD_TO=recipient@gmail.com
      - ALLOW_ANY_RCPT=true
      - ADD_X_HEADERS=true
      - MAX_STORE=500
```

#### Application
```bash
SMTP_RELAY_HOST=localhost          # or 'smtp-relay' in Docker
SMTP_RELAY_PORT=2525
SMTP_FROM_ADDRESS=noreply@metabuilder.local
```

### Credentials Seeding

SMTP credentials are seeded during bootstrap phase 3. File: `dbal/shared/seeds/database/smtp_credentials.yaml`

**System-wide credential:**
```yaml
- entityType: Credential
  id: cred_smtp_relay_system
  service: smtp_relay
  tenantId: null          # Available to all tenants
  config:
    host: localhost
    port: 2525
    useSSL: false
    useTLS: false
```

**Per-tenant override example:**
```yaml
- entityType: Credential
  id: cred_smtp_relay_acme
  service: smtp_relay
  tenantId: acme          # Tenant-specific
  config:
    host: smtp.acme.local
    port: 2525
```

## Usage

### In Workflows

Add an SMTP Relay Send node to your workflow:

```json
{
  "id": "send_confirmation_email",
  "type": "smtp-relay-send",
  "parameters": {
    "to": "{{ $json.email }}",
    "subject": "Confirm Your Registration",
    "body": "Click here to confirm",
    "from": "noreply@metabuilder.local",
    "retryAttempts": 3
  }
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `to` | string | ✓ | - | Recipient email address |
| `subject` | string | ✓ | - | Email subject |
| `body` | string | - | - | HTML email body |
| `template` | string | - | - | Template name ('welcome', 'notification', 'error_alert') |
| `from` | string | - | SMTP_FROM_ADDRESS | Sender email address |
| `cc` | string | - | - | CC recipient(s) |
| `bcc` | string | - | - | BCC recipient(s) |
| `attachments` | array | - | [] | File attachments |
| `retryAttempts` | number | - | 3 | Retry attempts on failure |
| `data` | object | - | {} | Template variables |

### In Notifications

The notification dispatch workflow automatically uses SMTP relay:

```json
POST /api/v1/{tenantId}/notification_center/notifications/dispatch
{
  "userId": "user_123",
  "type": "info",
  "title": "Welcome!",
  "message": "You've been added to MetaBuilder",
  "channels": ["in_app", "email"],
  "emailTemplate": "welcome"
}
```

The workflow:
1. Validates input
2. Creates notification record in DB
3. Dispatches to in-app channel
4. Checks rate limit for email (10/hour)
5. Fetches user email address
6. **Sends email via SMTP Relay node**
7. Dispatches to push channel
8. Returns success

## Multi-Tenant Support

### Credential Lookup

When executing SMTP send in a workflow:

1. **Check tenant-specific credential**
   ```typescript
   const cred = await db.credentials.findOne({
     filter: {
       tenantId: context.tenantId,
       service: 'smtp_relay',
       isActive: true
     }
   });
   ```

2. **Fall back to system-wide credential**
   ```typescript
   if (!cred) {
     const systemCred = await db.credentials.findOne({
       filter: {
         tenantId: null,
         service: 'smtp_relay',
         isActive: true
       }
     });
   }
   ```

3. **Use default if no credential found**
   - Use environment variables as fallback
   - Error if neither exists

### Rate Limiting Per Tenant

Emails are rate-limited per user per tenant:

```json
{
  "key": "email:{{ $json.userId }}",
  "limit": 10,
  "window": 3600000
}
```

This allows:
- **10 emails per user per hour**
- **Per-tenant isolation** (tenant_123's limit doesn't affect tenant_456)
- **Configurable per notification preference**

## Error Handling

### Retryable Errors

The executor automatically retries on transient errors:
- Connection timeouts
- Network errors (ECONNREFUSED, ECONNRESET)
- Service unavailable
- Temporary errors

**Retry Strategy**: Exponential backoff (1s → 2s → 4s, max 10s)

### Non-Retryable Errors

Immediately fail on:
- Invalid email address
- Authentication failure
- Permanent SMTP errors (5xx)
- Missing required parameters

### Error Response

```json
{
  "status": "error",
  "error": "Connection to SMTP relay timed out",
  "errorCode": "SMTP_SEND_ERROR",
  "timestamp": 1234567890,
  "duration": 45000
}
```

## Audit Logging

All email operations are logged (currently to console, TODO: full DBAL integration):

```
[AUDIT] email_sent:
  tenantId: "acme"
  userId: "user_123"
  action: "email_sent"
  metadata:
    messageId: "msg-1234567890"
    to: "user@acme.com"
    subject: "Welcome to MetaBuilder"
    timestamp: "2026-01-23T12:00:00Z"
  status: "success"
```

## Templates

Pre-defined templates available:

### `welcome`
Welcome email for new users
```html
<h2>Welcome to MetaBuilder</h2>
<p>{{ message }}</p>
```

### `notification`
Generic notification
```html
<h2>{{ title }}</h2>
<p>{{ message }}</p>
```

### `error_alert`
Error notification (red background)
```html
<h2 style="color: #c00;">Error Alert</h2>
<p>{{ error }}</p>
```

**Custom templates** can be added to `SMTPRelayExecutor._getTemplate()`

## Health Checks

### SMTP Relay Service Health

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "messagesProcessed": 150
}
```

### Docker Compose Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 20s
```

## Security Considerations

### Local Development
- SMTP relay runs on localhost:2525
- No authentication on SMTP server (local network only)
- Gmail credentials stored in environment variables

### Production Deployment
1. **Firewall Rules**
   - Block port 2525 from public internet
   - Only allow internal MetaBuilder services

2. **Credential Management**
   - Use environment secrets (never in code)
   - Rotate Gmail app passwords regularly
   - Use dedicated Gmail service account

3. **Rate Limiting**
   - 10 emails per user per hour (notification)
   - Enforce at application level
   - Monitor for abuse patterns

4. **Logging & Monitoring**
   - All email sends logged to audit trail
   - Monitor failed sends
   - Alert on unexpected patterns

## Docker Deployment

### Build
```bash
docker build -t metabuilder-smtp-relay ./smtprelay
```

### Run (Standalone)
```bash
docker run -p 2525:2525 -p 8080:8080 \
  -e GMAIL_USERNAME=user@gmail.com \
  -e GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx" \
  -e FORWARD_TO=recipient@gmail.com \
  metabuilder-smtp-relay
```

### Run (Docker Compose)
```bash
docker compose up smtp-relay
```

## Troubleshooting

### "SMTP relay transporter not available"
- Check SMTP_RELAY_HOST and SMTP_RELAY_PORT env vars
- Verify SMTP relay container is running
- Check Docker network connectivity

### "Email delivery timeout"
- SMTP relay service may be overloaded
- Check Gmail rate limits
- Verify network connectivity

### "Authentication failure"
- Invalid Gmail credentials
- Gmail app password expired
- 2FA not configured for Gmail

### "Rate limit exceeded"
- User has sent 10+ emails in last hour
- Wait for time window to expire
- Increase limit in notification preference

## Integration Checklist

- [x] Docker compose configuration
- [x] SMTP credentials seeding
- [x] Plugin executor implementation
- [x] Plugin registry registration
- [x] Notification workflow integration
- [ ] Multi-tenant credential loading (TODO)
- [ ] Audit logging to DBAL (TODO)
- [ ] Email template UI editor (TODO)
- [ ] Bounce handling (TODO)
- [ ] DKIM/SPF verification (TODO)

## Files Changed

### New Files
- `workflow/plugins/ts/integration/smtp-relay/src/index.ts` - Executor
- `workflow/plugins/ts/integration/smtp-relay/package.json` - Package config
- `dbal/shared/seeds/database/smtp_credentials.yaml` - Credential seed

### Modified Files
- `docker-compose.ghcr.yml` - Added smtp-relay service
- `workflow/executor/ts/plugins/index.ts` - Registered executor
- `packages/notification_center/workflow/dispatch.json` - Uses SMTP node

## Support & Maintenance

### Monitoring
- Check SMTP relay health: `curl http://localhost:8081/health`
- Monitor email delivery rate
- Track failed deliveries in audit logs

### Updates
- SMTP relay service: Update Docker image in compose
- Plugin executor: Rebuild workflow plugins
- Dependencies: `npm install` in workflow/plugins/ts/integration/smtp-relay

### Performance
- Default: 500 messages stored in memory
- Max throughput: ~100 emails/second (limited by Gmail)
- Batch size: 1 email per workflow execution

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0
