# Dovecot Testing Guide
## Phase 8: Email Client Implementation - Verification & Troubleshooting

This guide covers comprehensive testing of the Dovecot IMAP/POP3 container for the email client.

## Quick Start

### 1. Build the Container

```bash
cd deployment/docker/dovecot
docker build -t emailclient-dovecot:latest .
```

### 2. Run with Docker Compose

```bash
docker-compose -f docker-compose.override.yml up -d dovecot

# Check if it's running
docker ps | grep dovecot

# View logs
docker logs -f emailclient-dovecot-dev
```

### 3. Verify Health Status

```bash
docker exec emailclient-dovecot-dev doveconf -c /etc/dovecot/dovecot.conf

# Should show full configuration without errors
```

## Configuration Verification Tests

### Test 1: Configuration Syntax

Verify the configuration files are valid:

```bash
docker exec emailclient-dovecot-dev doveconf -c /etc/dovecot/dovecot.conf

# Expected: Full configuration output, no errors
```

### Test 2: Service Status

Check if all Dovecot services are running:

```bash
docker exec emailclient-dovecot-dev ps aux | grep dovecot

# Expected output should include:
# - dovecot (master process)
# - dovecot-lmtp (LMTP service)
# - dovecot-imap-login (IMAP login process)
# - dovecot-pop3-login (POP3 login process)
# - dovecot-auth (Authentication service)
```

### Test 3: Port Binding

Verify all ports are listening:

```bash
docker exec emailclient-dovecot-dev netstat -tlnp

# Expected listening ports:
# 143 - IMAP
# 993 - IMAPS
# 110 - POP3
# 995 - POP3S
```

### Test 4: Directory Structure

Check mail storage and configuration directories:

```bash
docker exec emailclient-dovecot-dev find /var/mail -type d

docker exec emailclient-dovecot-dev ls -la /etc/dovecot/

docker exec emailclient-dovecot-dev ls -la /var/spool/postfix/private/
```

## Protocol Connection Tests

### IMAP Connection Tests

#### Test 5: Basic IMAP Connection (Port 143)

```bash
# Using telnet (plaintext - STARTTLS negotiation)
telnet localhost 143

# Expected response:
# * OK Dovecot ready.

# Type commands:
A001 NOOP
# Expected: A001 OK NOOP completed

A002 LOGOUT
# Expected: * BYE Dovecot closing connection
# A002 OK Logout completed
```

#### Test 6: IMAPS Connection (Port 993 - TLS)

```bash
# Using openssl for TLS connection
openssl s_client -connect localhost:993

# Expected response:
# * OK Dovecot ready.

# Type commands (base64 encoded for LOGIN):
# A001 LOGIN user@localhost password
# A001 SELECT INBOX
# A001 LOGOUT
```

#### Test 7: IMAP STARTTLS

```bash
# Connect without TLS first, then negotiate STARTTLS
openssl s_client -connect localhost:143 -starttls imap

# Should show certificate information
# Then expect: * OK Dovecot ready.
```

### POP3 Connection Tests

#### Test 8: Basic POP3 Connection (Port 110)

```bash
# Using telnet (plaintext - STARTTLS negotiation)
telnet localhost 110

# Expected response:
# +OK Dovecot ready.

# Type commands:
USER testuser
# Expected: +OK

PASS testpass
# Expected: +OK Logged in.

STAT
# Expected: +OK 0 0

QUIT
# Expected: +OK Bye.
```

#### Test 9: POP3S Connection (Port 995 - TLS)

```bash
# Using openssl for TLS connection
openssl s_client -connect localhost:995

# Expected response:
# +OK Dovecot ready.

# Type commands (base64 encoded):
# USER testuser
# PASS testpass
# QUIT
```

## Authentication Tests

### Test 10: Test User Setup

Add a test user to the system:

```bash
# Generate a password hash
docker exec emailclient-dovecot-dev doveadm pw -s SHA512-CRYPT -p "test123"

# Output example:
# {SHA512-CRYPT}$6$iS1n.VaRKULYmKXp$iKDLZAKHiJC5r.9zJMXwNQOCN3Xx8CLBkVNxV3PvG8gDaXcqnKpXmCqJQLXW4zq9qlLhGpOuPXsQrN0nGjqeH0
```

Add to dovecot-users file:

```bash
# Edit dovecot-users
echo "testuser@localhost:{SHA512-CRYPT}\$6$iS1n.VaRKULYmKXp\$iKDLZAKHiJC5r.9zJMXwNQOCN3Xx8CLBkVNxV3PvG8gDaXcqnKpXmCqJQLXW4zq9qlLhGpOuPXsQrN0nGjqeH0:1000:1000:/var/mail/testuser@localhost:/sbin/nologin::" >> deployment/docker/dovecot/dovecot-users

# Rebuild and restart
docker-compose -f docker-compose.override.yml restart dovecot
```

### Test 11: Authentication Success

Test successful login:

```bash
openssl s_client -connect localhost:993 <<EOF
A001 LOGIN testuser@localhost test123
A002 NOOP
A003 LOGOUT
EOF

# Expected output should show successful login and commands
```

### Test 12: Authentication Failure

Test failed login with wrong password:

```bash
openssl s_client -connect localhost:993 <<EOF
A001 LOGIN testuser@localhost wrongpassword
EOF

# Expected: A001 NO [AUTHENTICATIONFAILED] Authentication failed
```

### Test 13: User List

List all configured users:

```bash
docker exec emailclient-dovecot-dev doveadm user "*"

# Expected output: List of all virtual users
```

## Mail Storage Tests

### Test 14: Maildir Creation

Verify Maildir structure is created:

```bash
docker exec emailclient-dovecot-dev find /var/mail -type d -name "Maildir"

# Expected: /var/mail/testuser@localhost/Maildir (created on first IMAP access)
```

### Test 15: Mailbox Navigation

Test accessing mailboxes:

```bash
openssl s_client -connect localhost:993 <<EOF
A001 LOGIN testuser@localhost test123
A002 LIST "" "*"
A003 SELECT INBOX
A004 STATUS INBOX (MESSAGES UNSEEN)
A005 LOGOUT
EOF

# Expected: List of mailboxes (INBOX, Drafts, Sent, Spam, Trash)
```

### Test 16: Message Storage

Send a test message via LMTP and retrieve via IMAP:

```bash
# First, create a test user with mail directory
docker exec emailclient-dovecot-dev mkdir -p /var/mail/testuser@localhost/Maildir/{cur,new,tmp}
docker exec emailclient-dovecot-dev chown -R vmail:mail /var/mail/testuser@localhost

# Then test via Postfix LMTP delivery (see Postfix integration tests)
```

## Postfix Integration Tests

### Test 17: LMTP Socket Availability

Check if Postfix can access the LMTP socket:

```bash
docker exec emailclient-postfix ls -la /var/spool/postfix/private/dovecot-lmtp

# Expected: Socket file with correct permissions
```

### Test 18: Message Delivery via Postfix

Send a test message through Postfix:

```bash
docker exec emailclient-postfix postmap -q testuser@localhost virtual

# Or test manually:
docker exec emailclient-postfix telnet localhost 25 <<EOF
EHLO example.com
MAIL FROM:<sender@example.com>
RCPT TO:<testuser@localhost>
DATA
From: sender@example.com
To: testuser@localhost
Subject: Test Message

This is a test message.
.
QUIT
EOF
```

### Test 19: Message Retrieval via IMAP

After message delivery, retrieve via IMAP:

```bash
openssl s_client -connect localhost:993 <<EOF
A001 LOGIN testuser@localhost test123
A002 SELECT INBOX
A003 FETCH 1 BODY[]
A004 LOGOUT
EOF

# Expected: Message content should be displayed
```

## Performance Tests

### Test 20: Connection Stress Test

Test handling multiple simultaneous connections:

```bash
# Create multiple connections
for i in {1..10}; do
  (
    openssl s_client -connect localhost:993 <<EOF
A001 LOGIN testuser@localhost test123
A002 NOOP
A003 LOGOUT
EOF
  ) &
done
wait

# Check server is still responsive
docker exec emailclient-dovecot-dev doveconf | head -1
```

### Test 21: Process Monitoring

Monitor Dovecot processes under load:

```bash
watch -n 1 'docker exec emailclient-dovecot-dev ps aux | grep dovecot | wc -l'

# Should see processes scaling up and down based on load
```

### Test 22: Memory Usage

Check memory consumption:

```bash
docker stats emailclient-dovecot-dev

# Monitor memory usage (should be < 512M based on limits)
```

## TLS/SSL Certificate Tests

### Test 23: Certificate Validation

Verify the TLS certificate:

```bash
# Check certificate details
docker exec emailclient-dovecot-dev openssl x509 -in /etc/dovecot/certs/dovecot.crt -text -noout

# Expected: Certificate info with CN=emailclient.local
```

### Test 24: TLS Protocol Support

Test available TLS protocols:

```bash
# TLS 1.2
openssl s_client -connect localhost:993 -tls1_2

# TLS 1.3
openssl s_client -connect localhost:993 -tls1_3

# Both should connect successfully
```

### Test 25: Cipher Suite Verification

Check cipher suites:

```bash
openssl s_client -connect localhost:993 <<EOF | grep Cipher
EOF

# Expected: High-security cipher like TLS_AES_256_GCM_SHA384
```

## Logging Tests

### Test 26: Log File Generation

Verify logs are being written:

```bash
docker exec emailclient-dovecot-dev ls -la /var/log/dovecot/

# Should show: dovecot.log, info.log, debug.log
```

### Test 27: Authentication Logging

Check authentication attempts in logs:

```bash
docker exec emailclient-dovecot-dev tail -f /var/log/dovecot/dovecot.log | grep -i auth

# Should show login attempts and results
```

### Test 28: Mail Operation Logging

Verify mail operations are logged:

```bash
docker logs emailclient-dovecot-dev 2>&1 | grep -i "delivery\|deletion\|copy"

# Should show mail operations if mail_log plugin is enabled
```

## Health Check Tests

### Test 29: Docker Health Status

Check container health:

```bash
docker inspect emailclient-dovecot-dev --format '{{.State.Health.Status}}'

# Expected: healthy
```

### Test 30: Health Check Execution

Manually run the health check:

```bash
docker exec emailclient-dovecot-dev doveconf -c /etc/dovecot/dovecot.conf > /dev/null 2>&1 && echo "Healthy" || echo "Unhealthy"

# Expected: Healthy
```

## LDAP Integration Tests (Optional)

### Test 31: LDAP Configuration Validation

If LDAP is configured:

```bash
docker exec emailclient-dovecot-dev cat /etc/dovecot/dovecot-ldap.conf

# Should show LDAP server details
```

### Test 32: LDAP Connection Test

Test LDAP connectivity:

```bash
docker exec emailclient-dovecot-dev ldapsearch -H ldap://ldap.example.com:389 -b "dc=example,dc=com" -x -W uid=testuser

# Should authenticate and return LDAP user object
```

## Troubleshooting Tests

### Test 33: Container Startup Issues

Check container logs for startup errors:

```bash
docker logs emailclient-dovecot-dev

# Look for error messages during initialization
```

### Test 34: Configuration Errors

Validate configuration without starting Dovecot:

```bash
docker run --rm -v $(pwd)/dovecot.conf:/etc/dovecot/dovecot.conf:ro emailclient-dovecot:latest doveconf -c /etc/dovecot/dovecot.conf

# Should complete without errors
```

### Test 35: Permission Issues

Check file permissions:

```bash
docker exec emailclient-dovecot-dev ls -la /var/mail/

# Expected: vmail:mail ownership, 700 permissions
```

## Test Suite Summary

Run all tests:

```bash
#!/bin/bash
set -e

echo "Running Dovecot Test Suite..."
echo "1. Configuration verification..."
docker exec emailclient-dovecot-dev doveconf -c /etc/dovecot/dovecot.conf > /dev/null

echo "2. IMAP connection test..."
timeout 5 bash -c 'echo "A001 LOGOUT" | nc localhost 143' || true

echo "3. POP3 connection test..."
timeout 5 bash -c 'echo "QUIT" | nc localhost 110' || true

echo "4. Health check..."
docker exec emailclient-dovecot-dev doveconf -c /etc/dovecot/dovecot.conf > /dev/null

echo "5. Port binding verification..."
docker exec emailclient-dovecot-dev netstat -tlnp | grep -E "143|993|110|995" > /dev/null

echo "All tests completed!"
```

## Automated Testing Script

Save as `test-dovecot.sh`:

```bash
#!/bin/bash

# Dovecot Automated Test Suite

CONTAINER="emailclient-dovecot-dev"
RESULTS_FILE="test-results.txt"

run_test() {
  local test_num=$1
  local test_name=$2
  local test_cmd=$3

  echo -n "Test $test_num: $test_name ... "

  if eval "$test_cmd" > /dev/null 2>&1; then
    echo "PASS"
    echo "Test $test_num: $test_name ... PASS" >> "$RESULTS_FILE"
  else
    echo "FAIL"
    echo "Test $test_num: $test_name ... FAIL" >> "$RESULTS_FILE"
  fi
}

> "$RESULTS_FILE"

run_test 1 "Configuration Valid" "docker exec $CONTAINER doveconf -c /etc/dovecot/dovecot.conf"
run_test 2 "IMAP Listening" "docker exec $CONTAINER netstat -tlnp | grep -q :143"
run_test 3 "POP3 Listening" "docker exec $CONTAINER netstat -tlnp | grep -q :110"
run_test 4 "IMAPS Listening" "docker exec $CONTAINER netstat -tlnp | grep -q :993"
run_test 5 "POP3S Listening" "docker exec $CONTAINER netstat -tlnp | grep -q :995"
run_test 6 "Mail Directory Exists" "docker exec $CONTAINER test -d /var/mail/vmail"
run_test 7 "LMTP Socket Exists" "docker exec emailclient-postfix test -S /var/spool/postfix/private/dovecot-lmtp"
run_test 8 "Certificate Exists" "docker exec $CONTAINER test -f /etc/dovecot/certs/dovecot.crt"
run_test 9 "Health Check" "docker exec $CONTAINER doveconf > /dev/null"
run_test 10 "Container Running" "docker ps | grep -q $CONTAINER"

echo ""
echo "Test Results:"
cat "$RESULTS_FILE"
```

Run with:

```bash
chmod +x test-dovecot.sh
./test-dovecot.sh
```

## Expected Results

All 35 tests should pass:
- Configuration validation ✓
- Port binding ✓
- IMAP/POP3 connectivity ✓
- Authentication ✓
- Mail storage ✓
- Postfix integration ✓
- TLS/SSL security ✓
- Health checks ✓
- Logging ✓

## References

- Dovecot IMAP Testing: https://doc.dovecot.org/
- IMAP RFC 3501: https://tools.ietf.org/html/rfc3501
- POP3 RFC 1939: https://tools.ietf.org/html/rfc1939
