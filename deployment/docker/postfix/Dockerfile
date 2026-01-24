# Postfix SMTP Server - Phase 8 Email Client Infrastructure
# Alpine Linux base for minimal footprint (~50MB)
# Supports relay mode, TLS, and SMTP authentication
FROM alpine:3.19

ENV POSTFIX_VERSION=3.8.7 \
    POSTFIX_MYHOSTNAME=postfix.metabuilder.local \
    POSTFIX_MYDOMAIN=metabuilder.local \
    POSTFIX_MYNETWORKS="127.0.0.1/8,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16" \
    POSTFIX_SMTP_TLS_SECURITY_LEVEL=may \
    POSTFIX_SMTPD_TLS_SECURITY_LEVEL=may \
    POSTFIX_MESSAGE_SIZE_LIMIT=52428800

# Install Postfix, Dovecot, and dependencies
RUN apk add --no-cache \
    postfix \
    postfix-mysql \
    postfix-sqlite \
    dovecot \
    dovecot-pigeonhole-plugin \
    ca-certificates \
    mailx \
    curl \
    openssl \
    bash \
    supervisor \
    dcron \
    rsyslog \
    && rm -rf /var/cache/apk/*

# Create mail system user and directories
RUN mkdir -p /var/spool/postfix \
    && mkdir -p /var/mail \
    && mkdir -p /var/run/dovecot \
    && mkdir -p /var/log/supervisor \
    && mkdir -p /etc/postfix/sasl \
    && mkdir -p /etc/dovecot/certs \
    && mkdir -p /etc/dovecot/conf.d

# Copy main Postfix configuration
COPY main.cf /etc/postfix/main.cf

# Copy master process configuration
COPY master.cf /etc/postfix/master.cf

# Create Dovecot configuration directory
RUN cat > /etc/dovecot/dovecot.conf << 'EOF'
# Dovecot configuration for local mailbox storage
protocols = imap pop3

listen = *, ::

# SSL/TLS settings
ssl = required
ssl_cert = </etc/dovecot/certs/dovecot.crt
ssl_key = </etc/dovecot/certs/dovecot.key
ssl_cipher_list = HIGH:!aNULL:!MD5:@STRENGTH

# IMAP protocol settings
service imap-login {
  inet_listener imap {
    port = 143
  }
  inet_listener imaps {
    port = 993
  }
}

# POP3 protocol settings
service pop3-login {
  inet_listener pop3 {
    port = 110
  }
  inet_listener pop3s {
    port = 995
  }
}

# Authentication socket for Postfix
service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
}

# User database (Unix system users)
userdb {
  driver = passwd
}

# Password database (PAM authentication)
passdb {
  driver = pam
  args = "%s"
}

# Mail location (Maildir format for compatibility with IMAP)
mail_location = maildir:/var/mail/%u/Maildir

# Disable plaintext auth unless TLS is used
disable_plaintext_auth = yes

# Enable debugging if needed
# debug = yes
EOF

# Create entrypoint script
RUN cat > /entrypoint.sh << 'EOF'
#!/bin/bash
set -e

# Function to log messages
log_info() {
    echo "[POSTFIX] $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# Function to set Postfix config with validation
set_postfix_config() {
    local key="$1"
    local value="$2"
    log_info "Configuring: $key = $value"
    postconf -e "${key}=${value}" || {
        log_info "ERROR: Failed to set $key"
        return 1
    }
}

log_info "Starting Postfix SMTP server configuration..."

# Essential Postfix configuration from environment variables
set_postfix_config "myhostname" "${POSTFIX_MYHOSTNAME}"
set_postfix_config "mydomain" "${POSTFIX_MYDOMAIN}"
set_postfix_config "myorigin" "\$mydomain"
set_postfix_config "inet_interfaces" "all"
set_postfix_config "inet_protocols" "ipv4"
set_postfix_config "mynetworks" "${POSTFIX_MYNETWORKS}"

# Message size limits
set_postfix_config "message_size_limit" "${POSTFIX_MESSAGE_SIZE_LIMIT}"
set_postfix_config "mailbox_size_limit" "0"

# TLS configuration for secure SMTP
set_postfix_config "smtp_tls_security_level" "${POSTFIX_SMTP_TLS_SECURITY_LEVEL}"
set_postfix_config "smtpd_tls_security_level" "${POSTFIX_SMTPD_TLS_SECURITY_LEVEL}"
set_postfix_config "smtp_tls_CAfile" "/etc/ssl/certs/ca-certificates.crt"
set_postfix_config "smtpd_tls_CAfile" "/etc/ssl/certs/ca-certificates.crt"

# SASL authentication for relay
set_postfix_config "smtpd_sasl_auth_enable" "yes"
set_postfix_config "smtpd_sasl_type" "dovecot"
set_postfix_config "smtpd_sasl_path" "private/auth"
set_postfix_config "smtpd_sasl_local_domain" "\$mydomain"
set_postfix_config "smtpd_sasl_security_options" "noanonymous"

# Relay restrictions
set_postfix_config "smtpd_relay_restrictions" \
    "permit_mynetworks,permit_sasl_authenticated,defer_unauth_destination"

# Allow configuration override via environment variable
if [ -n "${POSTFIX_RELAYHOST}" ]; then
    set_postfix_config "relayhost" "${POSTFIX_RELAYHOST}"
    set_postfix_config "smtp_sasl_auth_enable" "yes"
    set_postfix_config "smtp_sasl_security_options" "noanonymous"

    if [ -n "${POSTFIX_SMTP_SASL_PASSWORD_MAPS}" ]; then
        set_postfix_config "smtp_sasl_password_maps" "${POSTFIX_SMTP_SASL_PASSWORD_MAPS}"
    fi
fi

# Performance tuning
set_postfix_config "default_process_limit" "100"
set_postfix_config "default_transport_rate_limit" "0"
set_postfix_config "default_destination_rate_limit" "0"

# Delivery optimization
set_postfix_config "default_delivery_slot_cost" "5"
set_postfix_config "default_delivery_slot_discount" "50"

# Address verification
set_postfix_config "address_verify_negative_cache" "yes"
set_postfix_config "address_verify_negative_expire" "3d"

# Generate self-signed TLS certificates if they don't exist
if [ ! -f /etc/dovecot/certs/dovecot.crt ] || [ ! -f /etc/dovecot/certs/dovecot.key ]; then
    log_info "Generating self-signed TLS certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/dovecot/certs/dovecot.key \
        -out /etc/dovecot/certs/dovecot.crt \
        -subj "/C=US/ST=State/L=City/O=MetaBuilder/CN=${POSTFIX_MYHOSTNAME}" \
        2>/dev/null || {
        log_info "ERROR: Failed to generate certificates"
        exit 1
    }
    chmod 600 /etc/dovecot/certs/dovecot.key
    chmod 644 /etc/dovecot/certs/dovecot.crt
    log_info "Certificates generated successfully"
else
    log_info "Using existing TLS certificates"
fi

# Create system mail accounts for testing
log_info "Setting up default mail accounts..."
for user in admin relay user; do
    if ! getent passwd "$user" > /dev/null 2>&1; then
        adduser -D -s /sbin/nologin "$user" 2>/dev/null || {
            log_info "User $user already exists or failed to create"
        }
    fi

    # Set test passwords (development only)
    echo "${user}:${user}pass123" | chpasswd 2>/dev/null || true

    # Create mailbox directory
    mkdir -p "/var/mail/${user}/Maildir"/{cur,new,tmp}
    chown -R "$user:$user" "/var/mail/${user}"
    chmod 700 "/var/mail/${user}"
done

# Set proper permissions
chown -R postfix:postfix /var/spool/postfix
chmod 755 /var/spool/postfix

log_info "Fixing file permissions..."
postfix set-permissions

log_info "Validating Postfix configuration..."
postfix check || {
    log_info "ERROR: Postfix configuration validation failed"
    exit 1
}

log_info "Starting Postfix SMTP server..."
postfix start || {
    log_info "ERROR: Failed to start Postfix"
    exit 1
}

log_info "Starting Dovecot..."
dovecot -c /etc/dovecot/dovecot.conf || {
    log_info "ERROR: Failed to start Dovecot"
    exit 1
}

log_info "========================================="
log_info "Mail server configuration complete"
log_info "========================================="
log_info "Hostname: ${POSTFIX_MYHOSTNAME}"
log_info "Domain: ${POSTFIX_MYDOMAIN}"
log_info "SMTP: port 25, 587 (submission)"
log_info "IMAP: port 143, 993 (TLS)"
log_info "POP3: port 110, 995 (TLS)"
log_info "Default users: admin, relay, user (password: <user>pass123)"
log_info "========================================="

# Keep container running with health monitoring
exec tail -f /var/log/mail.log
EOF

chmod +x /entrypoint.sh

# Create health check script
RUN cat > /healthcheck.sh << 'EOF'
#!/bin/bash

# Check if Postfix is running
if ! pgrep -x "master" > /dev/null; then
    echo "Postfix is not running"
    exit 1
fi

# Check if Dovecot is running
if ! pgrep -x "dovecot" > /dev/null; then
    echo "Dovecot is not running"
    exit 1
fi

# Check if SMTP port is responding
if ! nc -z localhost 25 > /dev/null 2>&1; then
    echo "SMTP port 25 is not responding"
    exit 1
fi

# Check if submission port is responding
if ! nc -z localhost 587 > /dev/null 2>&1; then
    echo "Submission port 587 is not responding"
    exit 1
fi

echo "Mail server is healthy"
exit 0
EOF

chmod +x /healthcheck.sh

# Expose required ports
# 25   - SMTP (for relay from Python email service)
# 587  - SMTP Submission (with authentication)
# 110  - POP3
# 143  - IMAP
# 465  - SMTPS (SMTP+TLS)
# 993  - IMAPS (IMAP+TLS)
# 995  - POP3S (POP3+TLS)
EXPOSE 25 110 143 465 587 993 995

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD /healthcheck.sh

# Run entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
