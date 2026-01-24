# Phase 8: Environment Configuration Quick Start

**Purpose**: Fast reference for common environment setup tasks
**Time**: 5-10 minutes to get running
**Date**: 2026-01-24

---

## Development (5 minutes)

### 1. Copy Template

```bash
cd emailclient/deployment
cp .env.example .env.local
```

### 2. Generate Secrets (optional for dev)

```bash
# Generate JWT secret
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))" >> .env.local

# Or just use defaults for local testing
```

### 3. Start Services

```bash
# From emailclient root
docker-compose --env-file deployment/.env.local up -d
```

### 4. Verify

```bash
# Check services running
docker-compose ps

# Test database
PGPASSWORD=changeme_development_password \
  psql -h localhost -U emailclient -d emailclient_db -c "SELECT 1"

# Test Redis
redis-cli -h localhost ping

# Test API
curl http://localhost:8500/health
```

---

## Production Setup

### Prerequisites

- AWS Account (or HashiCorp Vault)
- Docker + Docker Compose
- AWS CLI configured
- PostgreSQL 16+
- Redis 7+

### Step 1: Generate Production Secrets

```bash
#!/bin/bash
cd emailclient/deployment

# Generate all secrets
POSTGRES_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
REDIS_PASSWORD=$(openssl rand -hex 20)
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ENCRYPTION_KEY=$(openssl rand -base64 32)
POSTFIX_RELAY_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

echo "Generated secrets (store in vault immediately):"
echo "POSTGRES_PASSWORD=$POSTGRES_PASSWORD"
echo "REDIS_PASSWORD=$REDIS_PASSWORD"
echo "JWT_SECRET=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "POSTFIX_RELAY_PASSWORD=$POSTFIX_RELAY_PASSWORD"
```

### Step 2: Store in AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name emailclient-prod \
  --description "Email Client Production Configuration" \
  --secret-string '{
    "POSTGRES_PASSWORD": "'$POSTGRES_PASSWORD'",
    "REDIS_PASSWORD": "'$REDIS_PASSWORD'",
    "JWT_SECRET": "'$JWT_SECRET'",
    "ENCRYPTION_KEY": "'$ENCRYPTION_KEY'",
    "POSTFIX_RELAYHOST_PASSWORD": "'$POSTFIX_RELAY_PASSWORD'"
  }'

# Verify stored
aws secretsmanager get-secret-value \
  --secret-id emailclient-prod \
  --query SecretString \
  --output text | jq '.'
```

### Step 3: Create IAM Role

```bash
# Create service role
aws iam create-role \
  --role-name emailclient-prod-service-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach secrets policy
aws iam put-role-policy \
  --role-name emailclient-prod-service-role \
  --policy-name SecretsManagerAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:emailclient-prod-*"
    }]
  }'
```

### Step 4: Deploy to Production

```bash
# Option A: Using Docker Compose + AWS Secrets
cat > docker-compose.prod.env << 'EOF'
$(aws secretsmanager get-secret-value \
  --secret-id emailclient-prod \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "\(.key)=\(.value)"')
EOF

docker-compose -f docker-compose.yml --env-file docker-compose.prod.env up -d

# Option B: Using ECS
aws ecs create-service \
  --cluster emailclient-prod \
  --service-name email-service-prod \
  --task-definition emailclient-prod:1 \
  --desired-count 3 \
  --launch-type FARGATE
```

### Step 5: Enable Monitoring

```bash
# CloudWatch logs
aws logs create-log-group --log-group-name /emailclient/prod/email-service

# CloudTrail for audit
aws cloudtrail create-trail \
  --name emailclient-prod-audit \
  --s3-bucket-name emailclient-audit-logs

# Enable secret rotation
aws secretsmanager rotate-secret \
  --secret-id emailclient-prod \
  --rotation-rules "AutomaticallyAfterDays=30"
```

---

## Common Tasks

### Add New Environment Variable

1. **Add to `.env.example`**:
   ```bash
   echo "NEW_VAR=changeme_value" >> deployment/.env.example
   ```

2. **Update template docs**:
   - Add description comment
   - Add to appropriate section
   - Add security note if sensitive

3. **Update code to use**:
   ```python
   # Flask/Python
   new_var = os.getenv('NEW_VAR', 'default_value')

   # TypeScript/Node.js
   const newVar = process.env.NEW_VAR || 'default_value'
   ```

4. **Commit changes** (excluding .env files):
   ```bash
   git add deployment/.env.example
   git commit -m "feat(env): add NEW_VAR configuration option"
   ```

---

### Rotate Database Password

```bash
#!/bin/bash
# Quick password rotation

# Generate new password
NEW_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# Update in AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id emailclient-prod \
  --secret-string '{"POSTGRES_PASSWORD": "'$NEW_PASSWORD'"}'

# Update local .env.prod
sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$NEW_PASSWORD|" deployment/.env.prod

# Restart services
docker-compose restart email-service postgres

echo "✅ Password rotated: $NEW_PASSWORD"
```

---

### Test Environment Variables Load Correctly

```bash
# Check what variables are loaded
grep -E '^[A-Z_]' deployment/.env.local | sort

# Verify key variables
source deployment/.env.local
echo "Database: $DATABASE_URL"
echo "Redis: $REDIS_URL"
echo "JWT Algorithm: $JWT_ALGORITHM"
echo "Log Level: $LOG_LEVEL"

# Check for missing critical vars
for var in \
  POSTGRES_PASSWORD \
  REDIS_PASSWORD \
  JWT_SECRET \
  ENCRYPTION_KEY \
  FLASK_ENV; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
  else
    echo "✅ Set: $var"
  fi
done
```

---

### Export Environment to YAML (Kubernetes)

```bash
#!/bin/bash
# Generate K8s secret

# Load secrets from vault
source <(aws secretsmanager get-secret-value \
  --secret-id emailclient-prod \
  --query SecretString \
  --output text | jq -r 'to_entries[] | "\(.key)=\(.value)"')

# Create K8s secret
kubectl create secret generic emailclient-env \
  --from-literal=POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  --from-literal=REDIS_PASSWORD=$REDIS_PASSWORD \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  --from-literal=ENCRYPTION_KEY=$ENCRYPTION_KEY \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

### Validate Environment Configuration

```bash
#!/bin/bash
# validate-env.sh

set -e

ENV_FILE="${1:-.env.local}"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ File not found: $ENV_FILE"
  exit 1
fi

echo "Validating $ENV_FILE..."

# Check required variables
REQUIRED_VARS=(
  "POSTGRES_PASSWORD"
  "REDIS_PASSWORD"
  "JWT_SECRET"
  "ENCRYPTION_KEY"
  "FLASK_ENV"
  "DATABASE_URL"
  "REDIS_URL"
)

source "$ENV_FILE"

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  fi
  echo "✅ $var is set"
done

# Validate database URL format
if [[ ! $DATABASE_URL =~ ^postgresql:// ]]; then
  echo "❌ Invalid DATABASE_URL format"
  exit 1
fi

# Validate JWT secret length (min 32 chars)
if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "⚠️  JWT_SECRET too short (< 32 chars)"
fi

# Validate encryption key base64
if ! echo -n "$ENCRYPTION_KEY" | base64 -d > /dev/null 2>&1; then
  echo "⚠️  ENCRYPTION_KEY is not valid base64"
fi

echo ""
echo "✅ Environment validation passed!"
echo ""
echo "Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Log Level: $LOG_LEVEL"
echo "  Flask Env: $FLASK_ENV"
echo "  Database: $DATABASE_URL"
echo "  Redis: $REDIS_URL"
```

---

### Debug: Check What Environment a Service is Using

```bash
# Check running container environment
docker exec emailclient-email-service env | grep -E '^(FLASK|DATABASE|REDIS|JWT)' | sort

# Check logs for environment-related startup messages
docker logs emailclient-email-service | grep -i "configuration\|environment"

# Connect to running service and check values
docker exec emailclient-email-service python -c "
import os
print(f'Environment: {os.getenv(\"ENVIRONMENT\")}')
print(f'Log Level: {os.getenv(\"LOG_LEVEL\")}')
print(f'Database Host: {os.getenv(\"POSTGRES_HOST\")}')
"
```

---

## Troubleshooting

### "Connection refused" on Database

```bash
# Check service is running
docker-compose ps | grep postgres

# Check database password
echo $POSTGRES_PASSWORD

# Try connecting directly
docker exec emailclient-postgres \
  psql -U $POSTGRES_USER -c "SELECT 1"

# If failed, check logs
docker logs emailclient-postgres | tail -50
```

### "REDIS_PASSWORD invalid" Error

```bash
# Check Redis password is set
echo $REDIS_PASSWORD

# Test Redis connection
docker exec emailclient-redis \
  redis-cli -a "$REDIS_PASSWORD" ping

# If error, may need to escape special characters
REDIS_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
```

### "JWT_SECRET not found" at Startup

```bash
# Check .env file is loaded
cat .env.local | grep JWT_SECRET

# Verify docker-compose loads it
docker-compose config | grep JWT_SECRET

# Try explicit env file
docker-compose --env-file deployment/.env.local up -d
```

---

## Environment Checklists

### Development Checklist

- [ ] `.env.local` created from `.env.example`
- [ ] `POSTGRES_PASSWORD` set (can be simple for dev)
- [ ] `REDIS_PASSWORD` set
- [ ] `JWT_SECRET` generated
- [ ] `ENCRYPTION_KEY` generated
- [ ] `FLASK_ENV=development`
- [ ] `DEBUG_MODE=true`
- [ ] Services started with `docker-compose up -d`
- [ ] Health checks passing

### Staging Checklist

- [ ] `.env.staging` created (not committed)
- [ ] All secrets generated and stored in vault
- [ ] Database backed up
- [ ] TLS certificates valid
- [ ] Monitoring enabled
- [ ] Backup process tested
- [ ] Log collection working
- [ ] Health checks passing

### Production Checklist

- [ ] All secrets in AWS Secrets Manager / Vault
- [ ] IAM roles configured
- [ ] PostgreSQL 16+ deployed (RDS or self-hosted)
- [ ] Redis 7+ deployed (ElastiCache or self-hosted)
- [ ] Postfix/Dovecot running
- [ ] Let's Encrypt certificates auto-renewing
- [ ] CloudTrail enabled
- [ ] CloudWatch logs configured
- [ ] Backups scheduled and tested
- [ ] Disaster recovery plan documented
- [ ] All security headers enabled
- [ ] Rate limiting configured
- [ ] Health checks passing
- [ ] Monitoring alerts active

---

## Quick Reference: Commands

```bash
# Development
docker-compose --env-file deployment/.env.local up -d
docker-compose logs -f email-service

# Production (AWS Secrets Manager)
aws secretsmanager get-secret-value --secret-id emailclient-prod \
  --query SecretString --output text | jq -r | set -a; \
  source /dev/stdin
docker-compose -f docker-compose.prod.yml up -d

# Rotate secrets
./deployment/scripts/rotate-secrets.sh

# Validate environment
./deployment/ENV_QUICK_START.md validate-env-vars

# Check logs
docker logs emailclient-email-service
```

---

**Need Help?** See:
- `SECRETS_MANAGEMENT.md` - Detailed secrets guide
- `.env.example` - All available variables
- `docker-compose.yml` - Service configuration
