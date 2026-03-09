# Email Client

A full-featured email client built with Next.js, React, Redux, and FakeMUI components. Supports IMAP/POP3 for receiving emails and SMTP for sending.

## Features

- Multi-account email management
- IMAP/POP3 support with automatic sync
- SMTP support for sending emails
- Folder management (Inbox, Sent, Drafts, Trash, Custom)
- Email search and filtering
- Attachment handling
- Email composition with rich editor
- Multi-tenant support via DBAL
- Declarative UI from JSON configuration

## Quick Start

### Prerequisites

- Node.js 18+ (for Next.js development)
- Docker and Docker Compose (for services)
- npm or yarn

### Installation

1. Clone the repository and navigate to the emailclient directory:

```bash
cd emailclient
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start the required services (Docker):

```bash
docker-compose up -d
```

This will start:
- **Postfix** - SMTP relay (port 25, 587)
- **Dovecot** - IMAP/POP3 server (ports 143, 993, 110, 995)
- **Redis** - Cache layer (port 6379)
- **PostgreSQL** - Email metadata storage (port 5432)
- **Email Service** - Flask backend (port 5000)

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Docker Compose Services

#### SMTP Relay (Postfix)

Handles outgoing email delivery.

```bash
docker-compose logs postfix
```

Test SMTP connection:

```bash
telnet localhost 25
EHLO test
QUIT
```

#### IMAP Server (Dovecot)

Stores and retrieves emails.

```bash
docker-compose logs dovecot
```

Test IMAP connection:

```bash
openssl s_client -connect localhost:993
```

#### Redis Cache

Caches email sync state and user sessions.

```bash
docker-compose logs redis
```

Access Redis CLI:

```bash
docker-compose exec redis redis-cli
```

#### Email Service (Flask)

Backend service for email operations (sync, fetch, send).

```bash
docker-compose logs email-service
```

#### PostgreSQL Database

Stores email metadata and user accounts.

```bash
docker-compose logs postgres
```

Access PostgreSQL:

```bash
docker-compose exec postgres psql -U emailclient -d emailclient
```

## Testing

### Create Test Email Accounts

Use the Docker Compose environment to create test accounts:

```bash
docker-compose exec dovecot adduser test1@example.com
docker-compose exec dovecot adduser test2@example.com
```

### Send Test Email

```bash
docker-compose exec postfix sendmail test1@example.com < /path/to/test.eml
```

### Access Test Email Via IMAP

```bash
openssl s_client -connect localhost:993
a login test1@example.com password
b list "" "*"
c select INBOX
d fetch 1 body
e logout
```

## Development

### Environment Variables

Key environment variables are defined in `.env.example`:

- `POSTFIX_HOST` - SMTP server hostname
- `DOVECOT_HOST` - IMAP server hostname
- `REDIS_URL` - Redis connection string
- `DATABASE_URL` - PostgreSQL connection string
- `API_BASE_URL` - API base URL for frontend

### Project Structure

```
emailclient/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main email client page
│   ├── layout.tsx         # Root layout with Redux provider
│   └── globals.css        # Global styles
├── docs/                  # Documentation
│   └── CLAUDE.md         # Development guide
├── docker-compose.yml     # Docker services
├── .env.example          # Example environment variables
├── package.json          # Dependencies
└── README.md            # This file
```

### Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix lint errors

# Testing
npm run test             # Run Jest tests
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode
```

## API Integration

The email client communicates with the backend via:

1. **DBAL** - For email entity operations (accounts, messages, folders, attachments)
2. **Workflow Engine** - For email sync and send operations
3. **Email Service** - Flask microservice for IMAP/SMTP operations

### API Endpoints

Email operations follow the standard API pattern:

```
GET    /api/v1/{tenant}/email_client/accounts          # List email accounts
POST   /api/v1/{tenant}/email_client/accounts          # Create account
GET    /api/v1/{tenant}/email_client/messages          # List messages
POST   /api/v1/{tenant}/email_client/messages/send     # Send email
PUT    /api/v1/{tenant}/email_client/messages/{id}     # Update message status
```

## Debugging

### Redux DevTools

Redux state is visible in browser Redux DevTools extension:

1. Install Redux DevTools browser extension
2. Open DevTools (F12)
3. Go to Redux tab to inspect state changes

### Console Logging

Email operations log to browser console with `[emailclient]` prefix.

### Service Logs

Check Docker service logs:

```bash
docker-compose logs -f email-service
docker-compose logs -f postfix
docker-compose logs -f dovecot
```

## Architecture

The email client is built as a **minimal Next.js bootloader** that loads the `email_client` package:

1. **Bootloader** (`emailclient/`) - Minimal Next.js app
2. **Package** (`packages/email_client/`) - UI components, page config, Redux slices
3. **DBAL** - Email entity schemas and database operations
4. **Workflow Engine** - Email sync and send workflows
5. **Services** - Flask backend for IMAP/SMTP operations

All UI is declarative JSON loaded from the package configuration.

## Production Deployment

### Environment Setup

1. Update `.env.local` with production values
2. Set `NODE_ENV=production`
3. Configure SMTP relay to your mail provider
4. Use PostgreSQL with proper backups
5. Enable Redis persistence

### Docker Build

```bash
docker build -t emailclient:latest .
docker-compose -f docker-compose.production.yml up -d
```

### Scaling

For production, consider:

- Separate database replica for backups
- Redis cluster for horizontal scaling
- Load balancer for multiple app instances
- CDN for static assets
- Email queue for async send operations

## Contributing

See [docs/CLAUDE.md](./docs/CLAUDE.md) for development guidelines.

## License

Proprietary - MetaBuilder
