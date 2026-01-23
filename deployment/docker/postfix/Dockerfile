# Postfix Mail Server
# Based on Debian slim for minimal footprint
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install Postfix, Dovecot (POP3/IMAP), and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    postfix \
    dovecot-core \
    dovecot-imapd \
    dovecot-pop3d \
    ca-certificates \
    mailutils \
    curl \
    vim-tiny \
    sudo \
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

echo "Generating self-signed certificates for Dovecot..."
mkdir -p /etc/dovecot/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/dovecot/certs/dovecot.key \
  -out /etc/dovecot/certs/dovecot.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=metabuilder.local" 2>/dev/null

chmod 600 /etc/dovecot/certs/dovecot.key
chmod 644 /etc/dovecot/certs/dovecot.crt

echo "Creating default mail accounts..."
# Create mail user if it doesn't exist
if ! id -u mail > /dev/null 2>&1; then
    useradd -r -u 8 -g mail -d /var/mail -s /usr/sbin/nologin mail
fi

# Create default accounts with passwords
mkdir -p /var/mail/metabuilder.local
useradd -m -s /sbin/nologin admin 2>/dev/null || true
useradd -m -s /sbin/nologin relay 2>/dev/null || true
useradd -m -s /sbin/nologin user 2>/dev/null || true

# Set passwords (plain text - testing only)
echo "admin:password123" | chpasswd
echo "relay:relaypass" | chpasswd
echo "user:userpass" | chpasswd

# Set mailbox permissions
chown -R mail:mail /var/mail
chmod 700 /var/mail

echo "Configuring Dovecot..."
# Configure Dovecot for POP3/IMAP
mkdir -p /etc/dovecot
cat > /etc/dovecot/dovecot.conf << 'DOVECOT_EOF'
protocols = imap pop3
listen = *, ::

# SSL configuration with self-signed cert
ssl = required
ssl_cert = </etc/dovecot/certs/dovecot.crt
ssl_key = </etc/dovecot/certs/dovecot.key
disable_plaintext_auth = yes

service imap-login {
  inet_listener imap {
    port = 143
  }
  inet_listener imaps {
    port = 993
  }
}

service pop3-login {
  inet_listener pop3 {
    port = 110
  }
  inet_listener pop3s {
    port = 995
  }
}

service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
}

userdb {
  driver = passwd
}

passdb {
  driver = pam
  args = "%s"
}

mail_location = maildir:~/Maildir
DOVECOT_EOF

echo "Starting Postfix..."
/etc/init.d/postfix start

echo "Starting Dovecot..."
/etc/init.d/dovecot start

echo "Mail server running on $(hostname)"
echo "Accounts: admin (password123), relay (relaypass), user (userpass)"
echo "SMTP: localhost:25, 587"
echo "IMAP: localhost:143, 993 (TLS)"
echo "POP3: localhost:110, 995 (TLS)"

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

# Expose SMTP, POP3, IMAP ports (with TLS variants)
EXPOSE 25 110 143 465 587 993 995

ENTRYPOINT ["/entrypoint.sh"]
