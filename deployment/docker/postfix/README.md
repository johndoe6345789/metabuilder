# Postfix SMTP Container - MetaBuilder Email Client Phase 8

Production-ready Postfix SMTP server container with integrated Dovecot POP3/IMAP support for the MetaBuilder email client infrastructure.

## Overview

This container provides:
- **Postfix SMTP Server** (Port 25, 587, 465) - Email relay and submission
- **Dovecot POP3/IMAP** (Port 110, 143, 993, 995) - Mailbox access
- **TLS/SSL Encryption** - Secure SMTP and mailbox connections
- **SASL Authentication** - Integrated with Dovecot for user auth
- **Docker Networking** - Ready for docker-compose deployment
- **Health Checks** - Built-in monitoring for container orchestration

## Architecture

### Components

| Component | Purpose | Ports |
|-----------|---------|-------|
| **Postfix** | SMTP server for message relay and submission | 25, 587, 465 |
| **Dovecot** | POP3/IMAP server for mailbox access | 110, 143, 993, 995 |
| **OpenSSL** | TLS certificate generation and management | - |
| **Rsyslog** | Log aggregation and management | - |

### Data Flow

```
┌─────────────────┐
│  Python Email   │
│  Service        │  Sends outbound mail via SMTP:25
└────────┬────────┘
         │
    SMTP:25 (relay)
         │
    ┌────▼──────────────────────┐
    │  Postfix SMTP Server       │
    │  - Relay configuration     │
    │  - SASL auth (Dovecot)     │
    │  - TLS/STARTTLS support    │
    └────┬──────────────────────┘
         │
    SMTP:587 (submission)
         │
    ┌────▼──────────────────────┐
    │  Client Mail Submission    │
    │  - webmail, mobile apps    │
    │  - TLS required            │
    └──────────────────────────┘

┌──────────────────────────────┐
│  Mailbox Storage             │
│  /var/mail/{user}/Maildir    │
└────────┬─────────────────────┘
         │
    IMAP:143, 993
    POP3:110, 995
         │
    ┌────▼──────────────────────┐
    │  Dovecot POP3/IMAP Server  │
    │  - Maildir format          │
    │  - TLS encryption          │
    │  - User authentication     │
    └──────────────────────────┘
```

## Build & Deployment

### Quick Start

```bash
# Build the image
docker build -t metabuilder-postfix:latest deployment/docker/postfix/

# Run container with docker-compose
docker-compose -f deployment/docker/docker-compose.development.yml up postfix

# Check logs
docker logs -f metabuilder-postfix
```

### Docker Compose Integration

Add to `docker-compose.yml`:

```yaml
services:
  postfix:
    build:
      context: deployment/docker/postfix
      dockerfile: Dockerfile
    container_name: metabuilder-postfix
    environment:
      POSTFIX_MYHOSTNAME: postfix.metabuilder.local
      POSTFIX_MYDOMAIN: metabuilder.local
      POSTFIX_MYNETWORKS: "127.0.0.1/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
      POSTFIX_SMTP_TLS_SECURITY_LEVEL: may
      POSTFIX_SMTPD_TLS_SECURITY_LEVEL: may
    volumes:
      - postfix_data:/var/mail
      - postfix_config:/etc/postfix
      - postfix_dovecot:/etc/dovecot/certs
    ports:
      - "25:25"      # SMTP (relay)
      - "587:587"    # SMTP submission (authenticated)
      - "465:465"    # SMTPS (implicit TLS)
      - "110:110"    # POP3
      - "143:143"    # IMAP
      - "993:993"    # IMAPS (TLS)
      - "995:995"    # POP3S (TLS)
    networks:
      - metabuilder-network
    healthcheck:
      test: ["CMD", "/healthcheck.sh"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

volumes:
  postfix_data:
    driver: local
  postfix_config:
    driver: local
  postfix_dovecot:
    driver: local
```

## Configuration

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTFIX_MYHOSTNAME` | `postfix.metabuilder.local` | Postfix hostname |
| `POSTFIX_MYDOMAIN` | `metabuilder.local` | Mail domain |
| `POSTFIX_MYNETWORKS` | Docker networks | Trusted relay networks |
| `POSTFIX_SMTP_TLS_SECURITY_LEVEL` | `may` | Outbound TLS (`may`, `encrypt`, `require`) |
| `POSTFIX_SMTPD_TLS_SECURITY_LEVEL` | `may` | Inbound TLS (`may`, `encrypt`, `require`) |
| `POSTFIX_MESSAGE_SIZE_LIMIT` | `52428800` | Max message size (bytes) |
| `POSTFIX_RELAYHOST` | _(empty)_ | External relay host (optional) |
| `POSTFIX_SMTP_SASL_PASSWORD_MAPS` | _(empty)_ | SASL password database |

### Configuration Files

#### main.cf (Primary Configuration)

Core Postfix settings:

```postfix
# Basic identification
myhostname = postfix.metabuilder.local
mydomain = metabuilder.local
myorigin = $mydomain

# Network settings
inet_interfaces = all
inet_protocols = ipv4
mynetworks = 127.0.0.1/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16

# SASL authentication
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth

# TLS security
smtpd_tls_security_level = may
smtpd_tls_cert_file = /etc/dovecot/certs/dovecot.crt
smtpd_tls_key_file = /etc/dovecot/certs/dovecot.key

# Message limits
message_size_limit = 52428800
mailbox_size_limit = 0
```

#### master.cf (Process Configuration)

Defines SMTP services:

- **Port 25** - SMTP relay (for Python email service)
- **Port 587** - SMTP submission (authenticated, STARTTLS)
- **Port 465** - SMTPS (implicit TLS, implicit crypto)

### TLS Certificate Management

Certificates are auto-generated on first run:

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/dovecot/certs/dovecot.key \
  -out /etc/dovecot/certs/dovecot.crt \
  -subj "/C=US/ST=State/L=City/O=MetaBuilder/CN=postfix.metabuilder.local"
```

For production, mount your own certificates:

```yaml
volumes:
  - /path/to/your/certs/server.crt:/etc/dovecot/certs/dovecot.crt:ro
  - /path/to/your/certs/server.key:/etc/dovecot/certs/dovecot.key:ro
```

## Testing & Usage

### Connect to Container

```bash
# Bash shell
docker exec -it metabuilder-postfix bash

# View logs
docker logs -f metabuilder-postfix

# Check Postfix status
docker exec metabuilder-postfix postfix status

# Reload configuration
docker exec metabuilder-postfix postfix reload
```

### SMTP Relay Testing (Port 25)

Test mail relay from Python email service:

```bash
# From Python app container
docker exec metabuilder-app python << 'EOF'
import smtplib
from email.mime.text import MIMEText

sender = "test@metabuilder.local"
recipient = "user@example.com"
msg = MIMEText("Test message from relay")
msg["Subject"] = "Test Email"
msg["From"] = sender
msg["To"] = recipient

with smtplib.SMTP("postfix", 25) as smtp:
    smtp.send_message(msg)
    print("Email relayed successfully")
EOF
```

### SMTP Submission Testing (Port 587)

Test authenticated client submission:

```bash
# From any container with mail tools
docker exec metabuilder-postfix telnet localhost 587

# Expected response:
# Connected to localhost.
# Escape character is '^]'.
# 220 postfix.metabuilder.local ESMTP Postfix

# Type: EHLO client.example.com
# Response shows AUTH, STARTTLS, etc.
```

### Mail Accounts

Default test accounts created at startup:

| User | Password | Role |
|------|----------|------|
| `admin` | `adminpass123` | Administrator |
| `relay` | `relaypass123` | Relay service |
| `user` | `userpass123` | Regular user |

**Location**: `/var/mail/{username}/Maildir/`

### IMAP Testing

```bash
# Check account with telnet
docker exec -it metabuilder-postfix telnet localhost 143

# Or use mail client
# Server: postfix (or container IP)
# Port: 143 (plain) or 993 (TLS)
# Username: admin, relay, user
# Password: {username}pass123
```

### POP3 Testing

```bash
# Check account with telnet
docker exec -it metabuilder-postfix telnet localhost 110

# Or mail client
# Server: postfix
# Port: 110 (plain) or 995 (TLS)
# Username: admin, relay, user
# Password: {username}pass123
```

## Integration with Email Client

### Python Email Service Connection

Configure Python email service to use Postfix relay:

```python
# services/email_service/config.py
SMTP_RELAY_HOST = "postfix"  # Container name in docker-compose
SMTP_RELAY_PORT = 25
SMTP_TLS = False  # Plain connection (internal network)

# For authenticated submission:
SMTP_RELAY_PORT = 587
SMTP_TLS = True
SMTP_USERNAME = "relay"
SMTP_PASSWORD = "relaypass123"
```

### Docker Network Configuration

Ensure all containers share same network:

```yaml
networks:
  metabuilder-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Dovecot Socket for Postfix Authentication

Postfix connects to Dovecot via Unix socket:

```
/var/spool/postfix/private/auth
```

Socket is created by Dovecot and shared via Postfix spool directory.

## Monitoring & Health Checks

### Health Check Script

Runs every 30 seconds:

```bash
/healthcheck.sh

# Checks:
# 1. Postfix master process running
# 2. Dovecot process running
# 3. SMTP port 25 listening
# 4. SMTP port 587 listening
```

### Logs

View container logs:

```bash
docker logs metabuilder-postfix

# Expected output:
# [POSTFIX] 2026-01-24 12:34:56 Starting Postfix SMTP server configuration...
# [POSTFIX] 2026-01-24 12:34:56 Configuring: myhostname = postfix.metabuilder.local
# [POSTFIX] 2026-01-24 12:34:56 Mail server configuration complete
```

### Postfix Mail Log

Inside container:

```bash
tail -f /var/log/mail.log

# Shows all SMTP transactions
# Example:
# Jan 24 12:35:01 postfix postfix/smtpd[1234]: NOQUEUE: reject: RCPT from unknown[10.0.0.5]: ...
# Jan 24 12:35:02 postfix postfix/cleanup[1235]: XXXXXXXX: message-id=<xxx@example.com>
# Jan 24 12:35:02 postfix postfix/qmgr[123]: XXXXXXXX: from=<...>, ...
```

## Troubleshooting

### Postfix Not Starting

```bash
# Check configuration
docker exec metabuilder-postfix postfix check

# View error log
docker logs metabuilder-postfix

# Common issues:
# - Port already in use: Change exposed port mapping
# - Permission denied: Check file permissions
# - SASL path wrong: Verify /var/spool/postfix/private/auth exists
```

### SMTP Connection Refused

```bash
# Check if SMTP is listening
docker exec metabuilder-postfix netstat -tlnp | grep :25

# Check Postfix status
docker exec metabuilder-postfix postfix status

# Restart if needed
docker exec metabuilder-postfix postfix stop
docker exec metabuilder-postfix postfix start
```

### Dovecot Auth Issues

```bash
# Check Dovecot socket
docker exec metabuilder-postfix ls -la /var/spool/postfix/private/auth

# View Dovecot logs
docker exec metabuilder-postfix tail -f /var/log/dovecot.log

# Test auth socket
docker exec metabuilder-postfix doveadm -D auth test admin
```

### TLS Certificate Issues

```bash
# View certificate info
docker exec metabuilder-postfix openssl x509 -in /etc/dovecot/certs/dovecot.crt -text -noout

# Verify certificate matches key
docker exec metabuilder-postfix openssl x509 -noout -modulus -in /etc/dovecot/certs/dovecot.crt | md5sum
docker exec metabuilder-postfix openssl rsa -noout -modulus -in /etc/dovecot/certs/dovecot.key | md5sum

# (hashes should match)
```

## Ports & Protocols

| Port | Protocol | Use Case | TLS |
|------|----------|----------|-----|
| **25** | SMTP | Mail relay from backend services | Optional (STARTTLS) |
| **587** | SMTP | Client submission (MUA to MSA) | Required (STARTTLS) |
| **465** | SMTPS | Client submission (implicit TLS) | Required |
| **110** | POP3 | Legacy mailbox access | Optional |
| **143** | IMAP | Standard mailbox access | Optional |
| **993** | IMAPS | IMAP with TLS | Required |
| **995** | POP3S | POP3 with TLS | Required |

## Performance Tuning

For high-volume deployments, adjust:

```yaml
environment:
  # Increase process limits
  POSTFIX_DEFAULT_PROCESS_LIMIT: "200"

  # Tune queue settings
  POSTFIX_DEFAULT_TRANSPORT_RATE_LIMIT: "100"
  POSTFIX_DEFAULT_DESTINATION_RATE_LIMIT: "100"

  # Increase message size
  POSTFIX_MESSAGE_SIZE_LIMIT: "104857600"  # 100 MB
```

See `main.cf` for all tuning parameters.

## Security Best Practices

1. **Use TLS for client connections** - Require TLS on port 587/465
2. **Restrict relay networks** - Only allow trusted Docker networks
3. **Enable SASL authentication** - Require login for SMTP submission
4. **Monitor logs** - Review mail.log for suspicious activity
5. **Use strong certificates** - Deploy proper CA-signed certificates in production
6. **Rate limiting** - Configure per-domain connection limits
7. **Update regularly** - Keep Postfix and Dovecot updated

## File Structure

```
deployment/docker/postfix/
├── Dockerfile          # Alpine-based image with Postfix + Dovecot
├── main.cf            # Primary Postfix configuration
├── master.cf          # Postfix process definition
└── README.md          # This file
```

## Phase 8 Integration

This container is part of the **Email Client Phase 8** (Backend Infrastructure):

- **Phase 1-2**: DBAL schemas & FakeMUI components
- **Phase 3-4**: Redux state management & custom hooks
- **Phase 5-6**: Email package & API routes
- **Phase 7**: Backend Python email service
- **Phase 8** (this): Postfix SMTP & Docker infrastructure ← **You are here**
- **Phase 9+**: Integration testing & production deployment

See [docs/plans/2026-01-23-email-client-implementation.md](../../docs/plans/2026-01-23-email-client-implementation.md) for full plan.

## References

- [Postfix Documentation](http://www.postfix.org/)
- [Dovecot Documentation](https://doc.dovecot.org/)
- [RFC 5321 - SMTP](https://tools.ietf.org/html/rfc5321)
- [RFC 5322 - Email Format](https://tools.ietf.org/html/rfc5322)
- [RFC 6409 - SMTP Submission](https://tools.ietf.org/html/rfc6409)

## License

MetaBuilder Project - See LICENSE.md
