# Dovecot IMAP/POP3 Container
## Phase 8: Email Client Implementation - Mail Storage & Access Layer

This directory contains the Dovecot mail server configuration for the email client system. Dovecot provides IMAP, POP3, and LMTP support for message retrieval and delivery.

## Files

- **Dockerfile** - Alpine Linux-based Dovecot image with TLS support
- **dovecot.conf** - Main configuration file with protocols, authentication, and storage settings
- **dovecot-local.conf** - Docker-specific overrides and environment customizations
- **dovecot-users** - Virtual user database (development/testing)
- **docker-entrypoint.sh** - Container initialization script

## Architecture

```
┌─────────────────────────────────────────┐
│         Dovecot IMAP/POP3 Server        │
├─────────────────────────────────────────┤
│  Port 143  (IMAP)                       │
│  Port 993  (IMAPS - TLS)                │
│  Port 110  (POP3)                       │
│  Port 995  (POP3S - TLS)                │
│  UNIX Socket (LMTP for Postfix)         │
├─────────────────────────────────────────┤
│         Mail Storage (Maildir)          │
│    /var/mail/vmail/{username}/          │
└─────────────────────────────────────────┘
       ↑                        ↑
       │                        │
   Postfix                  Email Clients
   (LMTP)                   (IMAP/POP3)
```

## Features

### Protocols
- **IMAP** - Full IMAP4rev1 support with IDLE, COMPRESS=DEFLATE
- **POP3** - POP3 with UIDL support for reliable message retrieval
- **LMTP** - Local Mail Transfer Protocol for Postfix integration

### Security
- **TLS/SSL** - Full encryption support (STARTTLS and implicit SSL/TLS)
- **Authentication** - Multiple backends supported:
  - Static file-based (development)
  - LDAP/Active Directory (production)
  - SQL database (scalable)
- **Self-signed certificates** - Auto-generated for local testing
- **Privilege separation** - Services run as unprivileged `vmail` user

### Storage
- **Maildir format** - One file per message for reliability
- **Namespace support** - Virtual mailboxes (Drafts, Sent, Spam, Trash)
- **Automatic folder creation** - Clients can create custom folders
- **Indexed search** - Fast message searching and sorting

### Performance
- **Connection pooling** - Multiple worker processes
- **Message caching** - In-memory cache for fast access
- **Compression** - DEFLATE support reduces bandwidth
- **Rate limiting** - Per-IP connection limits

### Postfix Integration
- **LMTP socket** - Unix socket at `/var/spool/postfix/private/dovecot-lmtp`
- **Automatic delivery** - Messages routed from Postfix to Dovecot
- **User lookup** - Shared user database with Postfix

## Building the Image

```bash
cd deployment/docker/dovecot

# Build with default settings
docker build -t emailclient-dovecot:latest .

# Build with custom hostname
docker build --build-arg DOVECOT_HOSTNAME=mail.example.com -t emailclient-dovecot:latest .
```

## Running the Container

### Basic Docker Command
```bash
docker run -d \
  --name emailclient-dovecot \
  --network emailclient-net \
  -p 143:143 \
  -p 993:993 \
  -p 110:110 \
  -p 995:995 \
  -v dovecot-data:/var/mail \
  -v dovecot-config:/etc/dovecot \
  emailclient-dovecot:latest
```

### Docker Compose (Included in docker-compose.yml)
```bash
docker-compose up -d dovecot
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DOVECOT_HOSTNAME` | `emailclient.local` | Server hostname |
| `DOVECOT_DEBUG` | `false` | Enable debug logging |
| `DOVECOT_AUTH_BACKEND` | `static` | Authentication backend: `static`, `ldap`, or `sql` |
| `DOVECOT_MAX_MESSAGE_SIZE` | `102400000` | Maximum message size (bytes) |
| `DOVECOT_USERS` | (empty) | Virtual users list (development only) |
| `LDAP_URI` | (empty) | LDAP server URI (e.g., `ldap://ldap.example.com:389`) |
| `LDAP_BASE_DN` | (empty) | LDAP base DN (e.g., `dc=example,dc=com`) |
| `LDAP_BIND_DN` | (empty) | LDAP bind DN for authentication |
| `LDAP_BIND_PASSWORD` | (empty) | LDAP bind password |
| `LDAP_TLS` | `start_tls` | TLS mode: `start_tls` or `tls` |

### Custom Certificates

To use custom TLS certificates:

```bash
docker run -d \
  --name emailclient-dovecot \
  -v /path/to/cert.crt:/etc/dovecot/certs/custom.crt:ro \
  -v /path/to/key.key:/etc/dovecot/private/custom.key:ro \
  emailclient-dovecot:latest
```

### LDAP Configuration

For production environments using Active Directory or OpenLDAP:

```bash
docker run -d \
  --name emailclient-dovecot \
  -e DOVECOT_AUTH_BACKEND=ldap \
  -e LDAP_URI="ldap://ldap.example.com:389" \
  -e LDAP_BASE_DN="dc=example,dc=com" \
  -e LDAP_BIND_DN="cn=admin,dc=example,dc=com" \
  -e LDAP_BIND_PASSWORD="secret" \
  emailclient-dovecot:latest
```

## Testing & Verification

### Check Container Health
```bash
docker exec emailclient-dovecot doveconf

# Should show no errors - full configuration will be output
```

### Test IMAP Connection
```bash
# Using telnet or nc
nc -w 5 localhost 143

# Expected output:
# * OK Dovecot ready.
```

### Test POP3 Connection
```bash
nc -w 5 localhost 110

# Expected output:
# +OK Dovecot ready.
```

### Check Logs
```bash
docker logs -f emailclient-dovecot
```

### Verify Mail Storage
```bash
docker exec emailclient-dovecot ls -la /var/mail/vmail/

# Should show user mailboxes and Maildir directories
```

### Test User Authentication

Using OpenSSL to test IMAP LOGIN:
```bash
# Connect to IMAP with TLS
openssl s_client -connect localhost:993

# Then enter (base64 encoded):
# A LOGIN user@localhost password
# A NOOP
# A LOGOUT
```

## Managing Users

### Adding a User (Development)

Using doveadm inside the container:

```bash
# Generate password hash
docker exec emailclient-dovecot doveadm pw -s SHA512-CRYPT -p "mypassword"

# Output: {SHA512-CRYPT}$6$....

# Edit dovecot-users file and add:
# user@localhost:{SHA512-CRYPT}$6/$...:1000:1000:/var/mail/user@localhost:/sbin/nologin::

# Restart container for changes to take effect
docker restart emailclient-dovecot
```

### User Database Format

```
username:password_hash:uid:gid:home_directory:shell:extra_fields
```

Example:
```
demo@localhost:{SHA512-CRYPT}$6/xxxx:1000:1000:/var/mail/demo@localhost:/sbin/nologin::
```

### Production: LDAP Backend

In production, use LDAP (Active Directory, OpenLDAP, FreeIPA) instead of static files:

1. Set `DOVECOT_AUTH_BACKEND=ldap`
2. Configure LDAP connection parameters
3. Users are queried from LDAP directory on each login

### Production: SQL Backend

For scalable deployments, use SQL database:

1. Create DBAL schema for email users
2. Configure Dovecot with SQL userdb/passdb
3. Connect to PostgreSQL or MySQL

## Integration with Postfix

### Socket Configuration

Postfix LMTP delivery uses the Dovecot LMTP socket:

```
/var/spool/postfix/private/dovecot-lmtp
```

### Postfix Configuration (main.cf)

```
# Virtual mailbox delivery via Dovecot LMTP
virtual_transport = lmtp:unix:private/dovecot-lmtp

# Or use TCP (not recommended for local)
# virtual_transport = lmtp:[127.0.0.1]:24
```

### Message Flow

```
1. Email arrives at Postfix (SMTP port 25)
2. Postfix validates recipient via virtual_mailbox_domains
3. Postfix routes to Dovecot via LMTP socket
4. Dovecot delivers to Maildir
5. Client retrieves via IMAP/POP3
```

## Performance Tuning

### Increase Process Limits

Edit `dovecot-local.conf`:
```
service imap-login {
  process_limit = 1024
  process_min_avail = 4
}

service pop3-login {
  process_limit = 512
}
```

### Enable Caching

```
mail_cache_fields = flags date.received date.sent size.virtual uid
mail_always_cache_fields = flags
```

### Connection Pooling

```
mail_max_userip_connections = 50
```

### Message Indexing

```
mail_mkdir_parent = yes
mail_cache_min_mail_count = 10
```

## Monitoring & Logging

### Container Logs

```bash
docker logs emailclient-dovecot
```

### Dovecot Logs

Inside container:
```
/var/log/dovecot/dovecot.log       # Main log
/var/log/dovecot/info.log          # Info messages
/var/log/dovecot/debug.log         # Debug (when enabled)
```

### Health Check

Docker health check runs every 30s:
```bash
curl -f -N -X "NOOP" telnet localhost 143
```

### Monitoring Metrics

Enable mail_log plugin to track:
- Message deletions
- Message copies
- Mailbox operations
- Login/logout events

## Troubleshooting

### Connection Refused

Check if Dovecot is running:
```bash
docker exec emailclient-dovecot ps aux | grep dovecot
```

Check port bindings:
```bash
docker exec emailclient-dovecot netstat -tlnp | grep dovecot
```

### Authentication Failures

Enable auth debugging:
```bash
docker run -e DOVECOT_DEBUG=true emailclient-dovecot
docker logs emailclient-dovecot | grep -i auth
```

### Mail Storage Issues

Check directory permissions:
```bash
docker exec emailclient-dovecot ls -la /var/mail/
docker exec emailclient-dovecot ls -la /var/mail/vmail/
```

Fix permissions if needed:
```bash
docker exec emailclient-dovecot chown -R vmail:mail /var/mail/vmail
```

### Postfix Integration Issues

Verify LMTP socket exists:
```bash
docker exec emailclient-dovecot ls -la /var/spool/postfix/private/dovecot-lmtp
```

Check Postfix logs for delivery errors:
```bash
docker logs emailclient-postfix | grep dovecot
```

## Security Best Practices

### Production Checklist

- [ ] Use real TLS certificates (not self-signed)
- [ ] Use LDAP/SQL authentication (not static files)
- [ ] Restrict network access (firewall rules)
- [ ] Enable rate limiting (mail_max_userip_connections)
- [ ] Use strong passwords
- [ ] Regular backups of /var/mail
- [ ] Monitor disk space
- [ ] Update Dovecot regularly
- [ ] Disable debug logging
- [ ] Remove test users

### Network Security

Only expose ports to trusted networks:

```dockerfile
ports:
  - "127.0.0.1:143:143"    # IMAP - localhost only
  - "127.0.0.1:110:110"    # POP3 - localhost only
  - "0.0.0.0:993:993"      # IMAPS - public
  - "0.0.0.0:995:995"      # POP3S - public
```

### Data Protection

- **Encryption in transit**: TLS/SSL on all protocols
- **Encryption at rest**: Use container host encryption
- **User isolation**: Maildir per user with proper permissions
- **Audit logging**: Enable mail_log plugin

## References

- [Dovecot Documentation](https://doc.dovecot.org/)
- [Dovecot IMAP Configuration](https://doc.dovecot.org/configuration_manual/protocol_imap/)
- [Dovecot POP3 Configuration](https://doc.dovecot.org/configuration_manual/protocol_pop3/)
- [Dovecot LMTP Configuration](https://doc.dovecot.org/configuration_manual/protocol_lmtp/)
- [RFC 3501 - IMAP4rev1](https://tools.ietf.org/html/rfc3501)
- [RFC 1939 - POP3](https://tools.ietf.org/html/rfc1939)

## License

Part of the MetaBuilder Email Client project. See project LICENSE file.
