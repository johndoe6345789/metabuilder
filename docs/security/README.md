# Security Documentation

Complete security guides and implementation documentation for MetaBuilder.

## Documentation

- **[SECURITY.md](./SECURITY.md)** - Security policies and best practices
- **[SECURE_DATABASE_LAYER.md](./SECURE_DATABASE_LAYER.md)** - Database security implementation

## Quick Start

### Security Checklist

Before deploying to production, ensure:

- [ ] All passwords hashed with SHA-512
- [ ] HTTPS enabled
- [ ] Database credentials in environment variables
- [ ] Lua scripts are sandboxed
- [ ] User input is validated
- [ ] SQL injection protection enabled (Prisma)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] Regular security audits scheduled

### Key Security Principles

1. **Never Store Plaintext**
   - Use SHA-512 hashing for passwords
   - Use environment variables for secrets
   - Never commit credentials

2. **Sandbox Everything Untrusted**
   - Lua scripts run in sandbox
   - User-provided code is scanned
   - API inputs are validated

3. **Multi-Tenant Isolation**
   - Every query filtered by tenant
   - No cross-tenant data access
   - Separate encryption keys per tenant (optional)

4. **Parameterized Queries**
   - Use Prisma ORM (prevents SQL injection)
   - Never concatenate SQL strings
   - Always use prepared statements

5. **HTTP Security**
   - Use HTTPS in production
   - Set security headers (CSP, X-Frame-Options, etc.)
   - Enable rate limiting
   - Implement CSRF protection

## Core Topics

### Authentication
- User registration and login
- Session management
- Multi-factor authentication
- API key generation

### Authorization
- Role-based access control
- Permission checking
- Multi-level permission system
- Tenant isolation

### Data Protection
- Encryption at rest (optional)
- Encryption in transit (HTTPS)
- Secure password storage
- Secure credential management

### API Security
- Rate limiting
- Input validation
- Output encoding
- API authentication

### Code Security
- Dependency scanning
- Code review process
- Security testing
- Vulnerability patching

## Common Security Patterns

### Hashing Passwords
```typescript
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha512').update(password).digest('hex');
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
```

### Validating User Input
```typescript
// Always validate and sanitize
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 1000); // Limit length
}
```

### Checking Permissions
```typescript
async function checkPermission(
  userId: string,
  action: string,
  resource: string
): Promise<boolean> {
  const user = await db.query('users').where('id', userId).first();
  const permissions = await db.query('permissions')
    .where('userId', userId)
    .where('action', action)
    .where('resource', resource)
    .first();
  
  return !!permissions;
}
```

### Sandboxing Lua Scripts
```typescript
// Lua scripts run in isolated sandbox
const sandbox = {
  // Limited globals
  math: Math,
  table: {
    insert: (t, v) => t.push(v),
    remove: (t, i) => t.splice(i, 1),
  },
  // No access to: os, io, require, etc.
};

const result = runLua(luaScript, sandbox);
```

## Security Checklist

### Development
- [ ] Use environment variables for all secrets
- [ ] Never commit `.env` files
- [ ] Use HTTPS for all external APIs
- [ ] Validate all user inputs
- [ ] Use parameterized queries
- [ ] Sanitize HTML output
- [ ] Log security events

### Testing
- [ ] Test with invalid inputs
- [ ] Test unauthorized access attempts
- [ ] Test cross-tenant access
- [ ] Test SQL injection vectors
- [ ] Test XSS vectors
- [ ] Test CSRF attacks

### Deployment
- [ ] Use HTTPS
- [ ] Set security headers
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables
- [ ] Enable audit logging
- [ ] Regular security scans

### Maintenance
- [ ] Keep dependencies updated
- [ ] Run security audits regularly
- [ ] Monitor for vulnerabilities
- [ ] Review access logs
- [ ] Test incident response
- [ ] Update security documentation

## Incident Response

If a security issue is discovered:

1. **Assess** - Determine scope and severity
2. **Contain** - Stop the threat
3. **Eradicate** - Remove the cause
4. **Recover** - Restore systems
5. **Review** - Learn and improve

[Read full incident response guide](./SECURITY.md#incident-response)

## Compliance

MetaBuilder supports:
- GDPR compliance
- Data retention policies
- User data export
- Account deletion
- Audit logging

## External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Security Best Practices](https://cheatsheetseries.owasp.org/)

## Getting Help

### Security Concerns
- 🔒 Report security issues responsibly
- ✉️ Email: security@example.com
- 📚 Check [SECURITY.md](./SECURITY.md) first

### Implementation Help
- 📖 Read [SECURE_DATABASE_LAYER.md](./SECURE_DATABASE_LAYER.md)
- 🔍 Search codebase for examples
- 💬 Ask the team

## Quick Links

| Topic | Link |
|-------|------|
| Security Policies | [SECURITY.md](./SECURITY.md) |
| Database Security | [SECURE_DATABASE_LAYER.md](./SECURE_DATABASE_LAYER.md) |
| GDPR Compliance | [SECURITY.md](./SECURITY.md#gdpr-compliance) |
| Incident Response | [SECURITY.md](./SECURITY.md#incident-response) |
| Full Index | [../INDEX.md](../INDEX.md) |

---

**Always prioritize security. When in doubt, ask for review.**

**Last Updated**: December 2025
