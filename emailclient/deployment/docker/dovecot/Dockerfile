# Phase 8: Dovecot IMAP/POP3 Server
# Email Client Implementation - Mail Storage & Access Layer

FROM alpine:3.19

# Install Dovecot and dependencies
RUN apk add --no-cache \
    dovecot \
    dovecot-imapd \
    dovecot-pop3d \
    dovecot-lmtpd \
    ca-certificates \
    openssl \
    bash \
    curl \
    && mkdir -p /var/mail \
    && mkdir -p /var/run/dovecot \
    && adduser -D -H -u 1000 -s /sbin/nologin -G mail vmail || true

# Create mail spool directory with proper permissions
RUN mkdir -p /var/mail/vmail \
    && chown -R vmail:mail /var/mail \
    && chmod 700 /var/mail/vmail

# Copy configuration files
COPY dovecot.conf /etc/dovecot/dovecot.conf
COPY dovecot-local.conf /etc/dovecot/conf.d/99-local.conf
COPY dovecot-users /etc/dovecot/dovecot-users

# Fix permissions on configuration files
RUN chmod 644 /etc/dovecot/dovecot.conf \
    && chmod 644 /etc/dovecot/conf.d/99-local.conf \
    && chown vmail:mail /etc/dovecot/dovecot-users \
    && chmod 600 /etc/dovecot/dovecot-users

# Generate self-signed certificates for TLS/SSL
RUN openssl req -x509 -newkey rsa:2048 -keyout /etc/dovecot/private/dovecot.key \
    -out /etc/dovecot/certs/dovecot.crt -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=emailclient.local" \
    && mkdir -p /etc/dovecot/private \
    && mkdir -p /etc/dovecot/certs \
    && chmod 600 /etc/dovecot/private/dovecot.key \
    && chmod 644 /etc/dovecot/certs/dovecot.crt

# Health check for IMAP protocol on port 143
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f -N -X "NOOP" <(echo "A001 NOOP") telnet localhost 143 || exit 1

# Expose required ports
# 143 - IMAP (clear text)
# 993 - IMAPS (TLS/SSL)
# 110 - POP3 (clear text)
# 995 - POP3S (TLS/SSL)
EXPOSE 143 993 110 995

# Create entrypoint script for initialization
RUN mkdir -p /docker-entrypoint.d

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Non-root user execution (dovecot runs as root by default for binding to ports)
# Services run with unprivileged user where possible
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/usr/sbin/dovecot", "-F"]
