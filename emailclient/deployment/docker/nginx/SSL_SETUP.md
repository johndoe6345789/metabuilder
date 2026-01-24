# SSL/TLS Certificate Setup Guide

Guide for generating SSL certificates for Nginx reverse proxy in development and production environments.

## Table of Contents

1. [Development (Self-Signed Certificates)](#development-self-signed-certificates)
2. [Production (Let's Encrypt with Certbot)](#production-lets-encrypt-with-certbot)
3. [Certificate Renewal](#certificate-renewal)
4. [Troubleshooting](#troubleshooting)

---

## Development (Self-Signed Certificates)

For local testing and development environments, generate self-signed certificates that last 365 days.

### Quick Setup (Bash Script)

Create `generate-dev-certs.sh`:

```bash
#!/bin/bash
# Generate self-signed certificates for development
# Usage: ./generate-dev-certs.sh

SSL_DIR="./ssl"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"
DHPARAM_FILE="$SSL_DIR/dhparam.pem"

# Create ssl directory
mkdir -p "$SSL_DIR"

# Generate private key (2048-bit RSA)
echo "Generating private key..."
openssl genrsa -out "$KEY_FILE" 2048

# Generate self-signed certificate (valid for 365 days)
echo "Generating self-signed certificate..."
openssl req -new -x509 -key "$KEY_FILE" -out "$CERT_FILE" -days 365 \
  -subj "/C=US/ST=California/L=San Francisco/O=MetaBuilder/CN=localhost"

# Generate DH parameters (2048-bit, takes ~2-3 minutes)
echo "Generating DH parameters (this may take a few minutes)..."
openssl dhparam -out "$DHPARAM_FILE" 2048

# Set permissions
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"
chmod 644 "$DHPARAM_FILE"

echo "SSL certificates generated successfully!"
echo "  Certificate: $CERT_FILE"
echo "  Private Key: $KEY_FILE"
echo "  DH Params:   $DHPARAM_FILE"
```

### Manual Setup

If you prefer to run commands individually:

```bash
# Create ssl directory
mkdir -p deployment/docker/nginx/ssl
cd deployment/docker/nginx/ssl

# Step 1: Generate private key
openssl genrsa -out key.pem 2048

# Step 2: Generate certificate (interactive)
openssl req -new -x509 -key key.pem -out cert.pem -days 365
# Prompts:
# Country Name: US
# State/Province: California
# Locality Name: San Francisco
# Organization: MetaBuilder
# Common Name: localhost (or your domain)

# Step 3: Generate DH parameters
openssl dhparam -out dhparam.pem 2048

# Verify files exist
ls -la
# Should show: cert.pem, key.pem, dhparam.pem
```

### Verify Development Certificates

```bash
# Check certificate validity
openssl x509 -in deployment/docker/nginx/ssl/cert.pem -text -noout

# Check expiration date
openssl x509 -in deployment/docker/nginx/ssl/cert.pem -noout -enddate
# Output: notAfter=Jan 24 12:34:56 2027 GMT

# Verify key/cert match
openssl x509 -noout -modulus -in deployment/docker/nginx/ssl/cert.pem | openssl md5
openssl rsa -noout -modulus -in deployment/docker/nginx/ssl/ssl/key.pem | openssl md5
# MD5 hashes should match
```

### Using Self-Signed Certificates in Docker

```bash
# Build Nginx image
docker build -t metabuilder-email-nginx:dev -f deployment/docker/nginx/Dockerfile .

# Run with self-signed certs
docker run -d \
  --name emailclient-nginx \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/deployment/docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v $(pwd)/deployment/docker/nginx/ssl:/etc/nginx/ssl:ro \
  metabuilder-email-nginx:dev
```

### Trust Self-Signed Certificates

#### macOS

```bash
# Add certificate to Keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain \
  deployment/docker/nginx/ssl/cert.pem

# Verify
curl https://localhost -I
# Should not show SSL certificate warning
```

#### Linux (Ubuntu/Debian)

```bash
# Copy certificate to system trust store
sudo cp deployment/docker/nginx/ssl/cert.pem /usr/local/share/ca-certificates/emailclient.crt

# Update CA bundle
sudo update-ca-certificates

# Verify
curl https://localhost -I
```

#### Windows (PowerShell)

```powershell
# Import certificate
Import-Certificate -FilePath "deployment/docker/nginx/ssl/cert.pem" `
  -CertStoreLocation "Cert:\CurrentUser\Root"

# Verify (in PowerShell, curl should work without warnings)
curl.exe https://localhost -I
```

#### Browser

For testing in a browser without trusting system-wide:

1. **Chrome/Edge**: Visit `https://localhost`, click the lock icon, then "Certificate is not valid" → Details → "Export..."
2. **Firefox**: Preferences → Privacy → Certificates → View Certificates → Import
3. **Safari**: Drag cert file to Keychain Access app

Or just click "Advanced" and "Proceed anyway" for testing.

---

## Production (Let's Encrypt with Certbot)

Automated certificate management using Let's Encrypt and Certbot.

### Prerequisites

- Domain name pointing to your server
- Port 80 accessible from internet (for ACME challenge)
- Port 443 accessible from internet (for HTTPS)
- Docker & Docker Compose installed

### Automatic Setup with Docker Compose

#### 1. Create `certbot-compose.yml` helper file

```yaml
version: '3.8'

services:
  certbot:
    image: certbot/certbot:latest
    container_name: certbot
    volumes:
      - ./ssl/letsencrypt:/etc/letsencrypt
      - ./ssl/certbot:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot -d emailclient.example.com -d api.emailclient.example.com --email admin@example.com --agree-tos --no-eff-email --noninteractive
    # Note: Change domains and email address as needed

  nginx:
    image: nginx:1.27-alpine
    container_name: emailclient-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl/letsencrypt/live/emailclient.example.com:/etc/nginx/ssl:ro
      - nginx_cache:/var/cache/nginx
      - ./ssl/certbot:/var/www/certbot:ro
    depends_on:
      - certbot
    restart: unless-stopped

volumes:
  nginx_cache:
    driver: local
```

#### 2. Update nginx.conf for Let's Encrypt

Point SSL certificate to Let's Encrypt paths:

```nginx
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;

# OR if using letsencrypt/live directory directly:
ssl_certificate /etc/letsencrypt/live/emailclient.example.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/emailclient.example.com/privkey.pem;
```

#### 3. Generate Certificates

```bash
# Replace example.com with your actual domain
docker-compose -f certbot-compose.yml up

# Verify certificates were created
docker exec certbot ls -la /etc/letsencrypt/live/emailclient.example.com/
# Should show: cert.pem, chain.pem, fullchain.pem, privkey.pem
```

#### 4. Start Production Stack

```bash
# Update docker-compose.yml with your domain
vim deployment/docker/docker-compose.production.yml

# Update nginx.conf server_name directives
vim deployment/docker/nginx/nginx.conf

# Start full stack
docker-compose -f deployment/docker/docker-compose.production.yml up -d

# Verify Nginx is running
docker logs emailclient-nginx | grep "successfully"
```

### Manual Setup with Certbot

#### 1. Install Certbot

```bash
# macOS
brew install certbot

# Ubuntu/Debian
sudo apt-get install certbot

# RHEL/CentOS
sudo yum install certbot
```

#### 2. Generate Certificates

```bash
# Standalone mode (easiest for one-time setup)
sudo certbot certonly --standalone \
  -d emailclient.example.com \
  -d api.emailclient.example.com \
  --email admin@example.com \
  --agree-tos \
  --no-eff-email

# Certificates saved to:
# /etc/letsencrypt/live/emailclient.example.com/
```

#### 3. Copy Certificates to Docker

```bash
# Copy certificates to nginx ssl directory
sudo cp /etc/letsencrypt/live/emailclient.example.com/fullchain.pem \
  deployment/docker/nginx/ssl/cert.pem

sudo cp /etc/letsencrypt/live/emailclient.example.com/privkey.pem \
  deployment/docker/nginx/ssl/key.pem

# Set permissions
sudo chmod 644 deployment/docker/nginx/ssl/cert.pem
sudo chmod 600 deployment/docker/nginx/ssl/key.pem

# Verify
ls -la deployment/docker/nginx/ssl/
```

#### 4. Copy DH Parameters

```bash
# Generate if not exists
openssl dhparam -out deployment/docker/nginx/ssl/dhparam.pem 2048

# OR use Let's Encrypt's if available
sudo cp /etc/letsencrypt/live/emailclient.example.com/dhparams.pem \
  deployment/docker/nginx/ssl/dhparam.pem 2>/dev/null || echo "Generating new DH params..."
```

---

## Certificate Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal.

### Automatic Renewal with Certbot Renewal Hook

#### 1. Create Renewal Hook Script

Create `/usr/local/bin/renew-emailclient-certs.sh`:

```bash
#!/bin/bash
# Renewal hook: Copy new certificates to Docker volume
# Called by certbot after successful renewal

CERT_SRC="/etc/letsencrypt/live/emailclient.example.com"
CERT_DEST="/path/to/emailclient/deployment/docker/nginx/ssl"

# Copy certificates
sudo cp "$CERT_SRC/fullchain.pem" "$CERT_DEST/cert.pem"
sudo cp "$CERT_SRC/privkey.pem" "$CERT_DEST/key.pem"

# Set permissions
sudo chmod 644 "$CERT_DEST/cert.pem"
sudo chmod 600 "$CERT_DEST/key.pem"

# Reload Nginx (signal SIGHUP)
docker kill -s HUP emailclient-nginx

# Log renewal
echo "Certificates renewed and Nginx reloaded at $(date)" >> /var/log/cert-renewal.log
```

Make executable:

```bash
chmod +x /usr/local/bin/renew-emailclient-certs.sh
```

#### 2. Configure Certbot Renewal Hook

Edit `/etc/letsencrypt/renewal/emailclient.example.com.conf`:

```conf
[emailclient.example.com]
account = ...
...
post_hook = /usr/local/bin/renew-emailclient-certs.sh
```

#### 3. Test Renewal Process

```bash
# Dry run (doesn't actually renew, but tests the process)
sudo certbot renew --dry-run

# Watch for output:
# "Preparing to renew emailclient.example.com"
# "1 renew success, 0 renew skipped, 0 renew failed"
```

#### 4. Enable Automatic Renewal Cron Job

Certbot automatically installs a systemd timer or cron job:

```bash
# Verify timer is running (systemd)
sudo systemctl status certbot.timer

# OR check cron job
sudo crontab -l | grep certbot

# Manual renewal (runs daily automatically)
sudo certbot renew
```

### Docker-Based Automatic Renewal

Run Certbot renewal container monthly:

```bash
# Create renewal script
cat > renewal-cron.sh << 'EOF'
#!/bin/bash
# Run certbot renewal in Docker

docker run --rm \
  -v $(pwd)/ssl/letsencrypt:/etc/letsencrypt \
  -v $(pwd)/ssl/certbot:/var/www/certbot \
  certbot/certbot renew \
  --webroot -w /var/www/certbot \
  --post-hook "docker kill -s HUP emailclient-nginx"

echo "Certificate renewal completed at $(date)" >> renewal.log
EOF

chmod +x renewal-cron.sh

# Add to crontab (runs on 1st of every month at 2 AM)
crontab -e
# Add line: 0 2 1 * * /path/to/renewal-cron.sh
```

### Monitor Certificate Expiration

```bash
# Check when certificate expires
openssl x509 -enddate -noout -in deployment/docker/nginx/ssl/cert.pem

# Set up monitoring alert (90+ days before expiration)
cat > check-cert-expiry.sh << 'EOF'
#!/bin/bash
CERT_FILE="deployment/docker/nginx/ssl/cert.pem"
EXPIRY=$(date -d "$(openssl x509 -enddate -noout -in $CERT_FILE | cut -d= -f2)" +%s)
NOW=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY - $NOW) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
  echo "WARNING: Certificate expires in $DAYS_LEFT days!" >&2
  exit 1
fi
echo "Certificate valid for $DAYS_LEFT more days"
EOF

chmod +x check-cert-expiry.sh

# Add to monitoring system (Prometheus, Datadog, etc.)
```

---

## Troubleshooting

### Certificate Not Recognized

```bash
# Check certificate chain
openssl s_client -connect localhost:443 -showcerts

# Verify certificate matches key
openssl x509 -noout -modulus -in cert.pem | md5sum
openssl rsa -noout -modulus -in key.pem | md5sum
# Hashes must match

# Test with curl
curl -vvv --insecure https://localhost
# Should show certificate details
```

### ACME Challenge Failure

```bash
# Ensure port 80 is accessible
nc -zv localhost 80

# Check nginx logs for challenge errors
docker logs emailclient-nginx | grep acme

# Verify DNS is pointing to server
nslookup emailclient.example.com
# Should resolve to your server IP

# Manual DNS verification
dig emailclient.example.com +short
```

### Certificate Renewal Failed

```bash
# Check renewal dry-run
sudo certbot renew --dry-run

# View certbot logs
sudo journalctl -xe | grep certbot

# Manual renewal with verbose output
sudo certbot renew --force-renewal -v

# Check file permissions
sudo ls -la /etc/letsencrypt/live/emailclient.example.com/
# Should be readable by your user
```

### Self-Signed Certificate Warnings

When using self-signed certs in development:

```bash
# Accept untrusted certificate with curl
curl --insecure https://localhost

# Or with Python
python3 -c "import requests; requests.get('https://localhost', verify=False)"

# Or with Node.js
NODE_TLS_REJECT_UNAUTHORIZED=0 node app.js
```

### DH Parameters Too Weak

```bash
# Regenerate with stronger parameters (4096-bit, takes ~15 minutes)
openssl dhparam -out dhparam.pem 4096

# Copy to nginx
cp dhparam.pem deployment/docker/nginx/ssl/dhparam.pem

# Reload nginx
docker kill -s HUP emailclient-nginx
```

---

## Security Best Practices

1. **Keep Certificates Secure**
   ```bash
   # Private key should be readable only by nginx/root
   chmod 600 deployment/docker/nginx/ssl/key.pem
   chmod 644 deployment/docker/nginx/ssl/cert.pem
   ```

2. **Use Strong DH Parameters**
   ```bash
   # For production, use 4096-bit (takes ~15 min)
   openssl dhparam -out dhparam.pem 4096
   ```

3. **Enable HSTS Header**
   ```nginx
   # Already in nginx.conf
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
   ```

4. **Test SSL Configuration**
   ```bash
   # Use SSL Labs or similar
   https://www.ssllabs.com/ssltest/

   # Or test locally
   openssl s_client -connect localhost:443 -tls1_2
   ```

5. **Backup Certificates**
   ```bash
   # Regular backups of Let's Encrypt directory
   tar -czf letsencrypt-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt
   ```

---

## Version History

- **v1.0.0** (2026-01-24): Initial SSL setup guide
  - Development self-signed certificate setup
  - Let's Encrypt + Certbot production setup
  - Automatic renewal configuration
  - Troubleshooting guide

## References

- [Let's Encrypt](https://letsencrypt.org/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Mozilla SSL Configuration](https://ssl-config.mozilla.org/)
- [OpenSSL Documentation](https://www.openssl.org/)
