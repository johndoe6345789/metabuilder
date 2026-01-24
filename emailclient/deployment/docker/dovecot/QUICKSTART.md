# Dovecot IMAP/POP3 - Quick Start Guide
## Phase 8: Email Client Implementation - 5-Minute Setup

Get Dovecot running in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- Email client repository cloned
- Postfix container running (or accessible)

## 1. Build the Image (1 minute)

```bash
cd deployment/docker/dovecot

# Build Dovecot image
docker build -t emailclient-dovecot:latest .

# Verify build
docker images | grep emailclient-dovecot
```

Expected output:
```
emailclient-dovecot   latest    xxxxxxxxxxxx   2 minutes ago   ~120MB
```

## 2. Start the Container (2 minutes)

### Option A: With Docker Compose (Recommended for Development)

```bash
# From emailclient root directory
docker-compose up -d dovecot

# Verify it's running
docker ps | grep dovecot
```

### Option B: Standalone Docker Command

```bash
docker run -d \
  --name emailclient-dovecot \
  --network emailclient-net \
  -p 143:143 \
  -p 993:993 \
  -p 110:110 \
  -p 995:995 \
  -v dovecot-data:/var/mail \
  emailclient-dovecot:latest
```

## 3. Verify It's Running (1 minute)

```bash
# Check container status
docker ps | grep dovecot

# Check logs
docker logs emailclient-dovecot

# Health check
docker exec emailclient-dovecot doveconf -c /etc/dovecot/dovecot.conf

# Should show: Full configuration output with no errors
```

## 4. Test Connectivity (1 minute)

### IMAP Test
```bash
# Connect to IMAP
telnet localhost 143

# Expected output:
# * OK Dovecot ready.

# Type:
A001 LOGOUT

# Expected:
# * BYE Dovecot closing connection
# A001 OK Logout completed
```

### POP3 Test
```bash
# Connect to POP3
telnet localhost 110

# Expected output:
# +OK Dovecot ready.

# Type:
QUIT

# Expected:
# +OK Bye.
```

## Common First Steps

### Add a Test User

```bash
# Generate password hash
docker exec emailclient-dovecot doveadm pw -s SHA512-CRYPT -p "testpass123"

# Copy the output: {SHA512-CRYPT}$6$...

# Edit dovecot-users
nano deployment/docker/dovecot/dovecot-users

# Add line:
testuser@localhost:{SHA512-CRYPT}$6$...:1000:1000:/var/mail/testuser@localhost:/sbin/nologin::

# Restart container
docker restart emailclient-dovecot
```

### View Logs

```bash
# Real-time logs
docker logs -f emailclient-dovecot

# Logs from container
docker exec emailclient-dovecot tail -f /var/log/dovecot/dovecot.log
```

### Check Mail Storage

```bash
# List virtual users
docker exec emailclient-dovecot ls -la /var/mail/

# Check specific user
docker exec emailclient-dovecot ls -la /var/mail/testuser@localhost/
```

## Configuration

### Using Environment Variables

```bash
# Create .env file
cat > deployment/docker/dovecot/.env <<EOF
DOVECOT_HOSTNAME=emailclient.local
DOVECOT_DEBUG=false
DOVECOT_AUTH_BACKEND=static
DOVECOT_MAX_MESSAGE_SIZE=102400000
EOF

# Run with .env
docker-compose --env-file deployment/docker/dovecot/.env up -d dovecot
```

### Custom Configuration

Edit configuration files:
```bash
# Main config
nano deployment/docker/dovecot/dovecot.conf

# Local overrides
nano deployment/docker/dovecot/dovecot-local.conf

# Restart to apply
docker restart emailclient-dovecot
```

## Integration with Postfix

Dovecot automatically integrates with Postfix via LMTP socket:

```bash
# Verify socket exists (from Postfix container)
docker exec emailclient-postfix ls -la /var/spool/postfix/private/dovecot-lmtp

# Expected: Socket file present
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs emailclient-dovecot

# Validate configuration
docker run --rm -v $(pwd)/dovecot.conf:/etc/dovecot/dovecot.conf:ro \
  emailclient-dovecot:latest doveconf -c /etc/dovecot/dovecot.conf

# Check disk space
docker exec emailclient-dovecot df -h /var/mail
```

### Connection Refused

```bash
# Check if ports are listening
docker exec emailclient-dovecot netstat -tlnp | grep dovecot

# Expected ports: 143, 993, 110, 995

# Check firewall
sudo ufw status
```

### Authentication Failures

```bash
# Enable debug logging
docker exec emailclient-dovecot sed -i 's/# auth_debug/auth_debug/' /etc/dovecot/conf.d/99-local.conf
docker restart emailclient-dovecot

# Check auth logs
docker logs emailclient-dovecot 2>&1 | grep -i auth
```

## Next Steps

1. **Read Full Documentation**: See `README.md`
2. **Run Test Suite**: Follow `TESTING.md` (35 comprehensive tests)
3. **Configure Production**: Set up LDAP authentication, real certificates
4. **Monitor Logs**: Set up centralized logging
5. **Integrate with Email Service**: Connect to Flask API

## Quick Commands Reference

```bash
# Start container
docker-compose up -d dovecot

# Stop container
docker-compose down dovecot

# View logs
docker logs -f emailclient-dovecot

# Execute command in container
docker exec emailclient-dovecot COMMAND

# Restart container
docker restart emailclient-dovecot

# Remove container (WARNING: loses data)
docker-compose down -v dovecot

# SSH into container
docker exec -it emailclient-dovecot /bin/sh

# Check configuration
docker exec emailclient-dovecot doveconf

# List users
docker exec emailclient-dovecot doveadm user "*"

# Add user
docker exec emailclient-dovecot doveadm pw -s SHA512-CRYPT -p "password"

# View mail
docker exec emailclient-dovecot find /var/mail -type f

# Check health
docker inspect emailclient-dovecot --format '{{.State.Health.Status}}'
```

## File Locations (Inside Container)

```
/etc/dovecot/                    # Configuration
/var/mail/                       # Mail storage (Maildir)
/var/mail/vmail/                 # Virtual users directory
/var/log/dovecot/                # Log files
/var/run/dovecot/                # Runtime files
/var/spool/postfix/private/      # Postfix socket
/etc/dovecot/certs/              # TLS certificates
/etc/dovecot/private/            # TLS private keys
```

## Port Reference

| Port | Protocol | Encryption | Use Case |
|------|----------|-----------|----------|
| 143 | IMAP | STARTTLS | Plaintext with STARTTLS upgrade |
| 993 | IMAPS | TLS | Encrypted IMAP (recommended) |
| 110 | POP3 | STARTTLS | Plaintext with STARTTLS upgrade |
| 995 | POP3S | TLS | Encrypted POP3 (recommended) |

## Performance Tuning

For production use, adjust in `dovecot.conf`:

```dovecot
# Increase process limits
service imap-login {
  process_limit = 1024
  process_min_avail = 4
}

# Increase connection limits
mail_max_userip_connections = 50

# Enable caching
mail_cache_fields = flags date.received date.sent size.virtual uid
```

## Security Checklist

- [ ] Using real TLS certificates (not self-signed)
- [ ] Strong passwords configured
- [ ] LDAP/SQL authentication (not static files)
- [ ] Debug logging disabled
- [ ] Rate limiting enabled
- [ ] Network access restricted (firewall)
- [ ] Regular backups configured
- [ ] Monitoring and alerting setup

## Support

- **Documentation**: See `README.md`
- **Testing**: Follow `TESTING.md` (35 tests)
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Issues**: Check troubleshooting section above

## Ready?

You now have a fully functional Dovecot IMAP/POP3 server running! 🎉

Next: Integration with email service API and testing with email clients (Thunderbird, Outlook, etc.)

---

**Phase 8 Complete**: Dovecot IMAP/POP3 Container Infrastructure
