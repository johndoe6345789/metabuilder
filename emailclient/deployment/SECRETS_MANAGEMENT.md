# Phase 8: Email Client Secrets Management Guide

**Last Updated**: 2026-01-24
**Status**: Comprehensive production security guide
**Scope**: Environment variables, credential storage, rotation, audit logging

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Configuration Files](#environment-configuration-files)
3. [Secret Generation](#secret-generation)
4. [Development Setup](#development-setup)
5. [Production Deployment](#production-deployment)
6. [Secret Rotation](#secret-rotation)
7. [Monitoring & Audit Logging](#monitoring--audit-logging)
8. [Emergency Procedures](#emergency-procedures)
9. [Compliance & Standards](#compliance--standards)

---

## Overview

### Philosophy

The Email Client follows a **secrets hierarchy**:

1. **Never commit secrets to version control** - `.env`, `.env.prod`, and credential files are git-ignored
2. **Externalize configuration** - Environment variables drive all configuration
3. **Multi-layer security** - Local development ≠ production
4. **Audit everything** - Track access, changes, and usage of all secrets
5. **Rotate regularly** - 30-90 day rotation schedule

### Secret Categories

| Category | Examples | Storage | Rotation |
|----------|----------|---------|----------|
| **Database** | `POSTGRES_PASSWORD`, `DATABASE_URL` | Vault/AWS Secrets Manager | Every 90 days |
| **API Keys** | `JWT_SECRET`, `ENCRYPTION_KEY` | Vault/AWS Secrets Manager | Every 60 days |
| **Service Passwords** | `REDIS_PASSWORD` | Vault/AWS Secrets Manager | Every 90 days |
| **OAuth Credentials** | Google Client ID/Secret | Vault/AWS Secrets Manager | Every 60 days |
| **TLS Certificates** | `.key`, `.crt` files | Let's Encrypt / AWS ACM | Auto-renew before expiry |
| **Email Credentials** | User account passwords | Encrypted in database | User-managed |

---

## Environment Configuration Files

### File Structure

```
emailclient/deployment/
├── .env.example          ✅ Template - SAFE to commit
├── .env.prod             ⚠️ Production template - DO NOT commit
├── .env.local            ❌ Local dev - NEVER commit
├── .env.prod.local       ❌ Local prod testing - NEVER commit
├── .gitignore            ✅ Excludes all .env files - Safe to commit
├── SECRETS_MANAGEMENT.md ✅ This file - Safe to commit
└── docker/
    └── email-service/
        └── .env.example  ✅ Service-specific template
```

### File Purposes

#### `.env.example` (Safe to Commit)

Template with placeholder values for all required variables.

**Usage**:
```bash
# Development
cp deployment/.env.example deployment/.env.local
# Edit .env.local with your local values
```

**Content**: All variables with `changeme_*` placeholders, detailed comments, production warnings

**Git**: ✅ Commit this file

---

#### `.env.prod` (DO NOT Commit)

Production configuration with secure defaults.

**Purpose**: Reference for deploying to production

**Structure**: Same variables as `.env.example`, but with:
- Strong password placeholders (`CHANGE_ME_*`)
- Production URLs
- Strict security settings
- Vault/Secrets Manager references

**Usage in Production**:
```bash
# Option 1: AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id emailclient-prod \
  --query SecretString --output text | jq -r | set -a; source /dev/stdin

# Option 2: HashiCorp Vault
vault kv get -format=json secret/emailclient-prod | \
  jq '.data.data | to_entries[] | "\(.key)=\(.value)"' | set -a

# Option 3: Docker secrets
docker run --secrets env_file emailclient-service:prod
```

**Git**: ❌ DO NOT commit - use only as reference

---

#### `.env.local` (Development Only)

Local development configuration with relaxed security.

**Purpose**: Development environment variables

**Content**:
- Same structure as `.env.example`
- Local database URL: `postgresql://emailclient:emailclient@localhost:5432/emailclient_db`
- Local Redis: `redis://localhost:6379/0`
- Dummy secrets (safe for development)
- Debug flags enabled

**Usage**:
```bash
cd emailclient
cp deployment/.env.example deployment/.env.local
# Edit with local values
# NO git operations - .gitignore prevents commits
```

**Git**: ❌ NEVER commit - automatically ignored by `.gitignore`

---

### Environment Variable Naming Convention

All environment variables follow these patterns:

**Pattern**: `CATEGORY_SUBCATEGORY_NAME=value`

**Examples**:
```
DATABASE_URL              # Primary connection string
POSTGRES_PASSWORD         # Individual field
REDIS_PASSWORD            # Cache credentials
JWT_SECRET                # API authentication
ENCRYPTION_KEY            # Data encryption
SMTP_HOST                 # Email service
CELERY_BROKER_URL         # Job queue
SENTRY_DSN                # Error tracking
```

---

## Secret Generation

### Database Passwords

**Requirements**: 32+ characters, mixed case, numbers, special characters

**Generate**:
```bash
# Option 1: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: OpenSSL
openssl rand -base64 32

# Option 3: Online generator (for local dev only!)
# https://www.lastpass.com/features/password-generator (development only!)
```

**Example**:
```
POSTGRES_PASSWORD=Xa7qP2nK9_mBcD4eF5gH6iJ7kL8mN9oP
```

---

### JWT Secrets

**Requirements**: 32+ characters, cryptographically secure random

**Generate**:
```bash
# Python (recommended)
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OpenSSL
openssl rand -base64 32
```

**Example**:
```
JWT_SECRET=7x!A%D*G-KaPdSgUkXp2s5v8y/B?E(H+MbQeThWmZq4t7w9z$C&F)J@N^L*Z&Xpd
```

---

### Encryption Keys

**Requirements**: 32 bytes for AES-256, base64 encoded, cryptographically secure

**Generate**:
```bash
# Generate 32 bytes (256 bits) for AES-256-GCM
openssl rand -base64 32

# Verify output is 32 bytes
openssl rand -base64 32 | base64 -d | wc -c
# Expected: 32
```

**Example**:
```
ENCRYPTION_KEY=TmFzZGY3WkFzZGY3WkFzZGY3WkFzZGY3WkFzZGY3WkE=
```

---

### Redis Passwords

**Requirements**: 20+ characters, URL-safe

**Generate**:
```bash
openssl rand -hex 20
```

**Example**:
```
REDIS_PASSWORD=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## Development Setup

### Initial Setup (One-Time)

```bash
cd emailclient/deployment

# 1. Copy environment template
cp .env.example .env.local

# 2. Generate secure secrets
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ENCRYPTION_KEY=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -hex 20)

# 3. Update .env.local with generated values
sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.local
sed -i.bak "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" .env.local
sed -i.bak "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|" .env.local

# 4. Remove backup
rm .env.local.bak

# 5. Verify (should show ONLY your environment)
cat .env.local | head -20
```

### Running Services Locally

```bash
cd emailclient

# Option 1: Docker Compose with .env.local
docker-compose --env-file deployment/.env.local up -d

# Option 2: Load environment, then run
set -a
source deployment/.env.local
set +a
docker-compose up -d

# Option 3: Override specific variables
POSTGRES_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))") \
  docker-compose up -d
```

### Accessing Services Locally

```bash
# Database
psql postgresql://emailclient:password@localhost:5433/emailclient_db

# Redis (if password set)
redis-cli -h localhost -p 6379 -a $REDIS_PASSWORD ping

# Email Service
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:8500/health

# Flask development server
FLASK_ENV=development FLASK_DEBUG=1 python -m flask run
```

---

## Production Deployment

### AWS Secrets Manager Setup

**Benefits**: Automatic rotation, encryption, audit logging, compliance-ready

#### 1. Create Secret in AWS Console

```bash
# Using AWS CLI
aws secretsmanager create-secret \
  --name emailclient-prod \
  --description "Email Client Production Configuration" \
  --secret-string '{
    "POSTGRES_PASSWORD": "YOUR_POSTGRES_PASSWORD",
    "REDIS_PASSWORD": "YOUR_REDIS_PASSWORD",
    "JWT_SECRET": "YOUR_JWT_SECRET",
    "ENCRYPTION_KEY": "YOUR_ENCRYPTION_KEY",
    "POSTFIX_RELAYHOST_PASSWORD": "YOUR_POSTFIX_PASSWORD"
  }'
```

#### 2. Grant IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:emailclient-prod-*"
    },
    {
      "Effect": "Allow",
      "Action": "kms:Decrypt",
      "Resource": "arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID"
    }
  ]
}
```

#### 3. Deploy with ECS/EKS

```bash
# ECS Task Definition - Reference secret
{
  "containerDefinitions": [
    {
      "name": "email-service",
      "secrets": [
        {
          "name": "POSTGRES_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:emailclient-prod:POSTGRES_PASSWORD::"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:emailclient-prod:JWT_SECRET::"
        }
      ]
    }
  ]
}
```

---

### HashiCorp Vault Setup

**Benefits**: Dynamic secrets, fine-grained access control, audit logging

#### 1. Initialize Vault

```bash
vault secrets enable -path=emailclient kv-v2

# Create secret
vault kv put secret/emailclient-prod \
  POSTGRES_PASSWORD="YOUR_PASSWORD" \
  REDIS_PASSWORD="YOUR_PASSWORD" \
  JWT_SECRET="YOUR_SECRET" \
  ENCRYPTION_KEY="YOUR_KEY"
```

#### 2. Configure Vault Authentication

```bash
# Enable Kubernetes auth
vault auth enable kubernetes

# Configure K8s auth
vault write auth/kubernetes/config \
  token_reviewer_jwt=@/var/run/secrets/kubernetes.io/serviceaccount/token \
  kubernetes_host=https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

# Create policy
vault policy write emailclient-prod - <<EOF
path "secret/data/emailclient-prod" {
  capabilities = ["read", "list"]
}
path "secret/metadata/emailclient-prod" {
  capabilities = ["read", "list"]
}
EOF
```

#### 3. Deploy Vault Agent Injector

```bash
# Helm chart with annotations
helm install vault hashicorp/vault \
  --values vault-values.yaml

# Pod annotation
apiVersion: v1
kind: Pod
metadata:
  annotations:
    vault.hashicorp.com/agent-inject: "true"
    vault.hashicorp.com/role: "emailclient-prod"
    vault.hashicorp.com/agent-inject-secret-emailclient: "secret/data/emailclient-prod"
    vault.hashicorp.com/agent-inject-template-emailclient: |
      {{- with secret "secret/data/emailclient-prod" -}}
      export POSTGRES_PASSWORD="{{ .Data.data.POSTGRES_PASSWORD }}"
      export JWT_SECRET="{{ .Data.data.JWT_SECRET }}"
      {{- end }}
```

---

### Docker Secrets (Swarm Mode)

**For**: Docker Swarm deployments

```bash
# Create secret
echo "YOUR_PASSWORD" | docker secret create postgres_password -

# Reference in docker-compose
secrets:
  postgres_password:
    external: true

services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password
```

---

### Environment Variable Loading Strategy

```yaml
# deploy/docker-compose.prod.yml
version: '3.8'

services:
  email-service:
    image: emailclient-service:prod
    env_file:
      - .env.prod  # Loaded first (low priority)
    environment:
      # AWS Secrets Manager references (high priority)
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      # These override file values
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

---

## Secret Rotation

### Rotation Schedule

| Secret | Frequency | Method | Impact |
|--------|-----------|--------|--------|
| Database passwords | Every 90 days | Update DB, redeploy services | Service restart |
| JWT secrets | Every 60 days | Update service config, invalidate tokens | User re-login required |
| Encryption keys | Every 90 days | Key rotation strategy (see below) | No downtime with proper strategy |
| TLS certificates | Before expiry | Let's Encrypt auto-renew | No downtime |
| Redis passwords | Every 90 days | Update Redis, redeploy services | Service restart |
| API keys | Every 60 days | Update external integrations | Temporary service unavailability |

### Database Password Rotation (No Downtime)

```bash
#!/bin/bash
# rotate-db-password.sh

set -e

OLD_PASSWORD=$POSTGRES_PASSWORD
NEW_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo "=== Database Password Rotation ==="
echo "Step 1: Create new user with new password"
psql -U postgres <<EOF
CREATE USER emailclient_new WITH PASSWORD '$NEW_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE emailclient_db TO emailclient_new;
EOF

echo "Step 2: Update connection pool (rolling deploy)"
# Update 1 service instance at a time
for i in {1..3}; do
  echo "  Updating service instance $i..."
  # Update .env file
  sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$NEW_PASSWORD|" .env.prod
  # Restart service with rolling update
  docker-compose restart email-service-$i
  sleep 30  # Wait for connections to drain
done

echo "Step 3: Drop old user"
psql -U postgres <<EOF
REVOKE ALL PRIVILEGES ON DATABASE emailclient_db FROM emailclient;
DROP USER emailclient;
EOF

echo "✅ Password rotation complete"
echo "New password stored in: AWS Secrets Manager / HashiCorp Vault"
```

---

### JWT Secret Rotation (Graceful)

```bash
#!/bin/bash
# rotate-jwt-secret.sh

set -e

echo "=== JWT Secret Rotation (Graceful) ==="

# Generate new secret
NEW_JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo "Step 1: Deploy with both old and new secrets (support old tokens)"
# Update service to accept both old and new JWT secrets
docker-compose -f docker-compose.prod.yml set-environment \
  JWT_SECRET_PRIMARY=$NEW_JWT_SECRET \
  JWT_SECRET_SECONDARY=$OLD_JWT_SECRET

echo "Step 2: Redeploy services"
docker-compose -f docker-compose.prod.yml up -d

echo "Step 3: Monitor token validation (24 hours)"
# During this period:
# - New tokens issued with new secret
# - Old tokens still accepted with secondary secret
# - Users don't need to re-login
sleep 86400  # 24 hours

echo "Step 4: Remove support for old secret"
docker-compose -f docker-compose.prod.yml set-environment \
  JWT_SECRET_PRIMARY=$NEW_JWT_SECRET \
  JWT_SECRET_SECONDARY=""

echo "✅ JWT rotation complete"
```

---

### Encryption Key Rotation (Crypto-Agility)

```sql
-- database-schema.sql
-- Add new encryption key column

ALTER TABLE email_credentials ADD COLUMN encrypted_key_version INT DEFAULT 1;
ALTER TABLE email_messages ADD COLUMN encrypted_key_version INT DEFAULT 1;

-- Migration script
BEGIN;

-- Step 1: Decrypt with old key, re-encrypt with new key
UPDATE email_credentials
SET encrypted_password = pgp_sym_encrypt(
  pgp_sym_decrypt(encrypted_password, OLD_ENCRYPTION_KEY),
  NEW_ENCRYPTION_KEY
),
encrypted_key_version = 2
WHERE encrypted_key_version = 1;

-- Step 2: Update application to prefer new key
-- (handle both versions during transition)

-- Step 3: Verify all records updated
COMMIT;
```

---

## Monitoring & Audit Logging

### AWS CloudTrail Setup

```bash
# Enable CloudTrail for Secrets Manager access
aws cloudtrail create-trail \
  --name emailclient-audit-trail \
  --s3-bucket-name emailclient-audit-logs \
  --is-multi-region-trail

# Create CloudWatch alarm for secret access
aws cloudwatch put-metric-alarm \
  --alarm-name EmailclientSecretAccess \
  --alarm-description "Alert on Secrets Manager access" \
  --metric-name SecretManagerAPICount \
  --namespace AWS/SecretsManager \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

### Vault Audit Log

```bash
# Enable audit logging
vault audit enable file file_path=/var/log/vault/audit.log

# Review audit log
vault audit list
tail -f /var/log/vault/audit.log | jq '.request'
```

### Application-Level Logging

```python
# flask_app.py
import logging
from pythonjsonlogger import jsonlogger

# Configure structured logging
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Log secret access (without the secret!)
@app.route('/api/accounts')
def list_accounts():
    logger.info('account_list_requested', extra={
        'user_id': user.id,
        'tenant_id': tenant_id,
        'action': 'LIST_ACCOUNTS'
    })
    # Never log actual passwords or keys!
    return {"accounts": []}
```

---

## Emergency Procedures

### Compromised JWT Secret

**Response Time**: Immediate

```bash
#!/bin/bash
# emergency-rotate-jwt.sh

echo "🚨 JWT SECRET COMPROMISED - EMERGENCY ROTATION"

# Step 1: Invalidate all existing tokens (force re-login)
psql -c "TRUNCATE TABLE sessions CASCADE;"

# Step 2: Generate new secret
NEW_JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# Step 3: Update in all running services
aws secretsmanager update-secret \
  --secret-id emailclient-prod \
  --secret-string "{\"JWT_SECRET\": \"$NEW_JWT_SECRET\"}"

# Step 4: Restart services (blue-green deployment)
# ...restart with new secret...

# Step 5: Notify users
# Send security alert to all users

# Step 6: Review audit logs
aws logs tail /aws/secretsmanager/emailclient-prod --follow

echo "✅ Emergency rotation complete"
```

---

### Database Breach

**Response Time**: Immediate

```bash
#!/bin/bash
# emergency-rotate-db.sh

echo "🚨 DATABASE BREACH - EMERGENCY ROTATION"

# Step 1: Create isolated backup
pg_dump -Fc postgresql://emailclient:$OLD_PASSWORD@postgres:5432/emailclient_db \
  > emailclient_backup_$(date +%s).sql

# Step 2: Rotate database password
NEW_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
psql -U postgres -c "ALTER USER emailclient WITH PASSWORD '$NEW_PASSWORD';"

# Step 3: Update all services
aws secretsmanager update-secret \
  --secret-id emailclient-prod \
  --secret-string "{\"POSTGRES_PASSWORD\": \"$NEW_PASSWORD\"}"

# Step 4: Trigger service restarts
kubectl rollout restart deployment/email-service -n production

# Step 5: Revoke old sessions
psql -c "DELETE FROM sessions WHERE created_at < NOW();"

# Step 6: Enable enhanced monitoring
aws rds modify-db-instance \
  --db-instance-identifier emailclient-prod \
  --enable-iam-database-authentication

echo "✅ Emergency rotation complete"
```

---

### Encryption Key Compromise

**Response Time**: Within 24 hours

```sql
-- Emergency key rotation with data re-encryption

BEGIN TRANSACTION;

-- Step 1: Create new key version
INSERT INTO encryption_keys (key_version, algorithm, created_at)
VALUES (3, 'aes-256-gcm', NOW());

-- Step 2: Re-encrypt all data (background job)
UPDATE email_credentials SET
  encrypted_password = pgp_sym_encrypt(
    pgp_sym_decrypt(encrypted_password, OLD_KEY),
    NEW_KEY
  ),
  key_version = 3
WHERE key_version = 2;

-- Step 3: Archive old key (for compliance)
UPDATE encryption_keys SET
  archived = true,
  archived_at = NOW()
WHERE key_version = 2;

COMMIT;
```

---

## Compliance & Standards

### SOC 2 Type II

- ✅ Access control (IAM roles)
- ✅ Encryption in transit (TLS)
- ✅ Encryption at rest (AWS KMS)
- ✅ Audit logging (CloudTrail, application logs)
- ✅ Change management (git audit trail)
- ✅ Incident response procedures

### HIPAA

- ✅ Encryption of all data (email contains health info)
- ✅ Access logging
- ✅ Secure key storage
- ✅ Regular audits

### GDPR

- ✅ Data minimization (only necessary secrets)
- ✅ Encryption (AES-256-GCM)
- ✅ Audit trails
- ✅ Right to deletion (secure purge process)

### PCI-DSS (If handling payment data)

- ✅ Never store complete card numbers
- ✅ Encrypt all credentials
- ✅ Restrict access by role
- ✅ Regular security testing

---

## Quick Reference

### Generate All Production Secrets

```bash
#!/bin/bash
# generate-secrets.sh

echo "Generating production secrets..."

POSTGRES_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
REDIS_PASSWORD=$(openssl rand -hex 20)
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ENCRYPTION_KEY=$(openssl rand -base64 32)

cat > .env.prod.secrets << EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY
EOF

chmod 600 .env.prod.secrets
echo "✅ Secrets generated in .env.prod.secrets"
echo "⚠️  STORE THIS FILE SECURELY - NEVER COMMIT TO GIT"
```

### Deployment Checklist

```bash
# Pre-deployment
[ ] All secrets generated
[ ] Secrets stored in vault/secrets manager
[ ] IAM roles configured
[ ] SSL certificates obtained
[ ] Database initialized
[ ] Redis configured
[ ] Postfix/Dovecot running

# Post-deployment
[ ] Health checks passing
[ ] Logs collecting
[ ] Monitoring alerts active
[ ] Audit logging enabled
[ ] Backup process running
[ ] Disaster recovery tested
```

---

## Support & References

- AWS Secrets Manager: https://docs.aws.amazon.com/secretsmanager/
- HashiCorp Vault: https://www.vaultproject.io/docs
- OWASP Secrets Management: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- CWE-798 (Hard-Coded Credentials): https://cwe.mitre.org/data/definitions/798.html

---

**Last Updated**: 2026-01-24
**Next Review**: 2026-04-24 (Quarterly)
**Security Contact**: security@emailclient.internal
