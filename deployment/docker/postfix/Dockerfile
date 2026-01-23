# Postfix Mail Server
# Based on Debian slim for minimal footprint
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install Postfix and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    postfix \
    ca-certificates \
    mailutils \
    curl \
    vim-tiny \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create entrypoint script
RUN cat > /entrypoint.sh << 'EOF'
#!/bin/bash
set -e

# Function to set Postfix config
set_postfix_config() {
    local key="$1"
    local value="$2"
    postconf -e "${key}=${value}"
}

echo "Configuring Postfix..."

# Basic hostname and domain settings
set_postfix_config "myhostname" "${POSTFIX_myhostname:-mail.example.com}"
set_postfix_config "mydomain" "${POSTFIX_mydomain:-example.com}"
set_postfix_config "myorigin" "\$mydomain"

# Allowed networks (default: localhost + Docker networks)
set_postfix_config "mynetworks" "${POSTFIX_mynetworks:-127.0.0.1/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16}"

# Relay host (if using external SMTP)
if [ -n "${POSTFIX_relayhost}" ]; then
    set_postfix_config "relayhost" "${POSTFIX_relayhost}"

    # SASL authentication for relay
    if [ "${POSTFIX_smtp_sasl_auth_enable}" = "yes" ]; then
        set_postfix_config "smtp_sasl_auth_enable" "yes"
        set_postfix_config "smtp_sasl_security_options" "noanonymous"

        if [ -n "${POSTFIX_smtp_sasl_password_maps}" ]; then
            set_postfix_config "smtp_sasl_password_maps" "${POSTFIX_smtp_sasl_password_maps}"
        fi
    fi
fi

# TLS settings
TLS_LEVEL="${POSTFIX_smtp_tls_security_level:-may}"
set_postfix_config "smtp_tls_security_level" "${TLS_LEVEL}"
set_postfix_config "smtp_tls_CAfile" "/etc/ssl/certs/ca-certificates.crt"

# Recipient verification (optional)
set_postfix_config "address_verify_negative_cache" "yes"
set_postfix_config "address_verify_negative_expire" "3d"

# Performance tuning
set_postfix_config "default_process_limit" "100"
set_postfix_config "default_transport_rate_limit" "0"
set_postfix_config "default_destination_rate_limit" "0"

# Logging
set_postfix_config "maillog_file" "/var/log/postfix.log"

echo "Starting Postfix..."
/etc/init.d/postfix start

echo "Postfix running on $(hostname)"
# Keep container alive
tail -f /var/log/mail.log 2>/dev/null || tail -f /var/log/syslog 2>/dev/null || sleep infinity
EOF
RUN chmod +x /entrypoint.sh

# Create healthcheck script
RUN cat > /healthcheck.sh << 'EOF'
#!/bin/bash
postfix status > /dev/null 2>&1 && echo "Postfix is running" && exit 0
echo "Postfix is not running"
exit 1
EOF
RUN chmod +x /healthcheck.sh

# Configure Postfix (minimal config for Docker)
RUN postconf -e "inet_interfaces = all" \
    && postconf -e "inet_protocols = ipv4" \
    && postconf -e "smtp_address_preference = ipv4" \
    && postconf -e "smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination" \
    && postconf -e "mailbox_size_limit = 0" \
    && postconf -e "message_size_limit = 52428800"

# Expose SMTP ports
EXPOSE 25 587 465

ENTRYPOINT ["/entrypoint.sh"]
