#!/bin/bash
# Generate self-signed SSL certificates for local development
# Usage: ./generate-dev-certs.sh
# Output: ssl/cert.pem, ssl/key.pem, ssl/dhparam.pem

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="$SCRIPT_DIR/ssl"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"
DHPARAM_FILE="$SSL_DIR/dhparam.pem"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Email Client SSL Certificate Generator ===${NC}"
echo "Location: $SSL_DIR"
echo ""

# Create ssl directory
if [ ! -d "$SSL_DIR" ]; then
  echo -e "${YELLOW}Creating ssl directory...${NC}"
  mkdir -p "$SSL_DIR"
  chmod 700 "$SSL_DIR"
fi

# Check if certificates already exist
if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  echo -e "${YELLOW}SSL certificates already exist!${NC}"

  # Show expiration date
  EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
  echo "Certificate expires: $EXPIRY"

  # Ask if user wants to regenerate
  read -p "Do you want to regenerate certificates? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping certificate generation."
    exit 0
  fi
fi

# Generate private key
echo -e "${YELLOW}Step 1/3: Generating private key (2048-bit RSA)...${NC}"
openssl genrsa -out "$KEY_FILE" 2048
echo -e "${GREEN}✓ Private key generated${NC}"

# Generate self-signed certificate
echo ""
echo -e "${YELLOW}Step 2/3: Generating self-signed certificate (365 days)...${NC}"
openssl req -new -x509 \
  -key "$KEY_FILE" \
  -out "$CERT_FILE" \
  -days 365 \
  -subj "/C=US/ST=California/L=San Francisco/O=MetaBuilder/CN=localhost/emailSubjectAltName=DNS:localhost,DNS:*.emailclient.local,DNS:emailclient.local,DNS:api.emailclient.local"
echo -e "${GREEN}✓ Certificate generated${NC}"

# Generate DH parameters
echo ""
echo -e "${YELLOW}Step 3/3: Generating DH parameters (2048-bit)...${NC}"
echo "This may take 2-5 minutes. Please wait..."
openssl dhparam -out "$DHPARAM_FILE" 2048
echo -e "${GREEN}✓ DH parameters generated${NC}"

# Set permissions
chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"
chmod 644 "$DHPARAM_FILE"

# Verify certificates
echo ""
echo -e "${YELLOW}Verifying certificates...${NC}"

# Check key/cert match
CERT_MD5=$(openssl x509 -noout -modulus -in "$CERT_FILE" | openssl md5 | cut -d' ' -f2)
KEY_MD5=$(openssl rsa -noout -modulus -in "$KEY_FILE" | openssl md5 | cut -d' ' -f2)

if [ "$CERT_MD5" = "$KEY_MD5" ]; then
  echo -e "${GREEN}✓ Certificate and key match${NC}"
else
  echo -e "${RED}✗ Certificate and key do not match!${NC}"
  exit 1
fi

# Show certificate details
echo ""
echo -e "${GREEN}=== Certificate Details ===${NC}"
openssl x509 -in "$CERT_FILE" -text -noout | grep -E "Subject:|Issuer:|Not Before:|Not After:|Public-Key:"

# Show summary
echo ""
echo -e "${GREEN}=== Summary ===${NC}"
echo "Certificate: $CERT_FILE"
echo "Private Key: $KEY_FILE"
echo "DH Params:   $DHPARAM_FILE"
echo ""
echo -e "${GREEN}SSL certificates generated successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy ssl/ directory to your deployment location"
echo "2. Build Docker image: docker build -t metabuilder-email-nginx:latest ."
echo "3. Run container with volumes: -v ./ssl:/etc/nginx/ssl:ro"
echo ""
echo "To trust this certificate locally:"
echo "  macOS:   security add-trusted-cert -d -r trustRoot $CERT_FILE"
echo "  Linux:   sudo cp $CERT_FILE /usr/local/share/ca-certificates/ && sudo update-ca-certificates"
echo "  Windows: Import-Certificate -FilePath \"$CERT_FILE\" -CertStoreLocation \"Cert:\CurrentUser\Root\""
