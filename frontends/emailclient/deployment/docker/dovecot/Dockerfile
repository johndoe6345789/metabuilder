# Phase 8: Dovecot IMAP/POP3 Server
# Email Client Implementation - Mail Storage & Access Layer

FROM alpine:3.19

# Install Dovecot and dependencies
# Alpine 3.19: IMAP is in base dovecot, POP3 and LMTP are separate subpackages
RUN apk add --no-cache \
    dovecot \
    dovecot-pop3d \
    dovecot-lmtpd \
    ca-certificates \
    openssl \
    bash \
    curl \
    && mkdir -p /var/mail /var/run/dovecot /var/log/dovecot \
    && adduser -D -H -u 1000 -s /sbin/nologin -G mail vmail || true

# Create mail spool directory with proper permissions
RUN mkdir -p /var/mail/vmail \
    && chown -R vmail:mail /var/mail \
    && chmod 700 /var/mail/vmail

# Create certificate directories BEFORE generating certs
RUN mkdir -p /etc/dovecot/private /etc/dovecot/certs /etc/dovecot/conf.d

# Generate self-signed certificates for TLS/SSL
RUN openssl req -x509 -newkey rsa:2048 \
    -keyout /etc/dovecot/private/dovecot.key \
    -out /etc/dovecot/certs/dovecot.crt \
    -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=MetaBuilder/CN=metabuilder.local" \
    && chmod 600 /etc/dovecot/private/dovecot.key \
    && chmod 644 /etc/dovecot/certs/dovecot.crt

# Copy configuration files
COPY dovecot.conf /etc/dovecot/dovecot.conf
COPY dovecot-local.conf /etc/dovecot/conf.d/99-local.conf
COPY dovecot-users /etc/dovecot/dovecot-users

# Fix permissions on configuration files
# dovecot-users must be readable by the dovecot auth process (uid=90 dovecot)
# Using root:dovecot ownership with 640 so both root and dovecot group can read
RUN chmod 644 /etc/dovecot/dovecot.conf \
    && chmod 644 /etc/dovecot/conf.d/99-local.conf \
    && chown root:dovecot /etc/dovecot/dovecot-users \
    && chmod 640 /etc/dovecot/dovecot-users

# Ensure /var/run/dovecot is owned by dovecot for auth-token-secret.dat
RUN chown -R dovecot:dovecot /var/run/dovecot \
    && chmod 750 /var/run/dovecot

# Health check - verify dovecot master process is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD doveadm service status imap-login || exit 1

# Expose required ports
# 143 - IMAP (STARTTLS)
# 993 - IMAPS (TLS/SSL)
# 110 - POP3
# 995 - POP3S (TLS/SSL)
EXPOSE 143 993 110 995

# Create entrypoint script for initialization
RUN mkdir -p /docker-entrypoint.d

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/usr/sbin/dovecot", "-F"]
