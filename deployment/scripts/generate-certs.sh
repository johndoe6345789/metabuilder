#!/bin/bash
# Phase 8: SSL/TLS Certificate Generation
# Generates self-signed certificates for development/testing
# For production, use Let's Encrypt via certbot

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SSL_DIR="$SCRIPT_DIR/config/nginx/ssl"
POSTFIX_DIR="$SCRIPT_DIR/config/postfix/tls"
DOVECOT_DIR="$SCRIPT_DIR/config/dovecot/tls"

# Configuration
DAYS_VALID=365
KEY_SIZE=2048
COUNTRY="US"
STATE="CA"
CITY="San Francisco"
ORG="MetaBuilder"
CN="${1:-emailclient.local}"

echo "Generating SSL/TLS certificates for: $CN"
echo "Valid for: $DAYS_VALID days"
echo ""

# Create directories
mkdir -p "$SSL_DIR" "$POSTFIX_DIR" "$DOVECOT_DIR"

# Generate Nginx certificate (for HTTPS)
echo "Generating Nginx certificate..."
openssl req -x509 -newkey rsa:$KEY_SIZE -keyout "$SSL_DIR/emailclient.key" \
  -out "$SSL_DIR/emailclient.crt" -days $DAYS_VALID -nodes \
  -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/CN=$CN"

echo "✓ Nginx certificate created"
echo "  Key:  $SSL_DIR/emailclient.key"
echo "  Cert: $SSL_DIR/emailclient.crt"
echo ""

# Generate Postfix certificate (for SMTP TLS)
echo "Generating Postfix certificate..."
openssl req -x509 -newkey rsa:$KEY_SIZE -keyout "$POSTFIX_DIR/postfix.key" \
  -out "$POSTFIX_DIR/postfix.crt" -days $DAYS_VALID -nodes \
  -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/CN=$CN"

echo "✓ Postfix certificate created"
echo "  Key:  $POSTFIX_DIR/postfix.key"
echo "  Cert: $POSTFIX_DIR/postfix.crt"
echo ""

# Generate Dovecot certificate (for IMAP/POP3 TLS)
echo "Generating Dovecot certificate..."
openssl req -x509 -newkey rsa:$KEY_SIZE -keyout "$DOVECOT_DIR/dovecot.key" \
  -out "$DOVECOT_DIR/dovecot.crt" -days $DAYS_VALID -nodes \
  -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/CN=$CN"

echo "✓ Dovecot certificate created"
echo "  Key:  $DOVECOT_DIR/dovecot.key"
echo "  Cert: $DOVECOT_DIR/dovecot.crt"
echo ""

# Set proper permissions
chmod 600 "$SSL_DIR"/*.key "$POSTFIX_DIR"/*.key "$DOVECOT_DIR"/*.key
chmod 644 "$SSL_DIR"/*.crt "$POSTFIX_DIR"/*.crt "$DOVECOT_DIR"/*.crt

echo "✓ Certificates generated successfully"
echo ""
echo "Certificate information:"
echo "========================"
openssl x509 -text -noout -in "$SSL_DIR/emailclient.crt" | grep -A 3 "Subject:"
echo ""
echo "WARNING: Self-signed certificates are for development/testing only."
echo "For production, use Let's Encrypt:"
echo "  certbot certonly --standalone -d your.domain.com"
echo "  cp /etc/letsencrypt/live/your.domain.com/fullchain.pem $SSL_DIR/emailclient.crt"
echo "  cp /etc/letsencrypt/live/your.domain.com/privkey.pem $SSL_DIR/emailclient.key"
