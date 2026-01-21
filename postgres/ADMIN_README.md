# Postgres Web Admin Panel

A **modern, beautiful replacement for legacy database admin tools** like phpMyAdmin, Adminer, and pgAdmin.

Built with Next.js 16, Material UI, and TypeScript for a superior user experience.

## Why This Instead of Legacy Tools?

### 🎨 Modern vs. Crusty
- **Beautiful Material UI** instead of outdated 2000s-era interfaces
- **Dark mode friendly** and responsive design
- **Fast, smooth interactions** with React and Next.js
- **Clean, intuitive navigation** vs cluttered legacy UIs

### 🚀 All-in-One Solution
- **Includes PostgreSQL** - no separate database setup needed
- **Docker-ready** - deploy anywhere in seconds
- **Zero configuration** - works out of the box
- **Built-in authentication** - no complicated auth setup

### 🔒 Security First
- **Modern authentication** with bcrypt + JWT
- **SQL injection protection** with multiple layers
- **Session management** with HTTP-only cookies
- **Auto-generated passwords** - no default "admin/admin"

### 💼 Production Ready
- **Caprover compatible** - deploy with one click
- **GitHub Container Registry** - automated CI/CD
- **Cloudflare Tunnel support** - easy HTTPS
- **Persistent storage** - data survives restarts

## Replaces These Legacy Tools

| Old Tool | Issues | This Solution |
|----------|--------|---------------|
| **phpMyAdmin** | PHP-based, outdated UI, MySQL-focused | Modern Next.js, beautiful UI, PostgreSQL-focused |
| **Adminer** | Single PHP file, basic features | Full-featured app with authentication |
| **pgAdmin** | Heavy desktop app, complex setup | Lightweight web app, simple deployment |
| **SQL Workbench** | Desktop only, OS-specific | Web-based, works everywhere |

## Features

- 🔐 User/password authentication
- 💎 Material UI design
- 📊 View database tables
- 🔍 SQL query interface (SELECT only for security)
- 📋 Table data viewer with pagination
- 🐳 Docker support
- 📦 GitHub Container Registry (GHCR) integration

## Quick Start

### 1. Setup Database

First, ensure your database is running and migrations are applied:

```bash
npm run db:migrate
```

### 2. Create Admin User

Create an admin user for logging into the admin panel:

```bash
npm run db:seed-admin
```

**Auto-generated password**: If you don't provide a password, a secure 32-character password will be automatically generated:

```bash
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Username: admin
🔑 Password: aB3$xK9@mP2&vL8#qR5!wN7^zT4%yU6*
⚠️  This password was auto-generated. Save it securely!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Login at: http://localhost:3000/admin/login
```

**Custom credentials**: You can also provide custom credentials:

```bash
ADMIN_USERNAME=myuser ADMIN_PASSWORD=mypassword npm run db:seed-admin
```

### Generate Secure Passwords

Use the built-in password generator to create secure passwords:

```bash
# Generate a 32-character password (default)
npm run generate:password

# Generate a 64-character password
npm run generate:password 64

# Generate without special characters
npm run generate:password 32 false
```

Example output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Secure Password Generated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Password: xK9@mP2&vL8#qR5!wN7^zT4%yU6*aB3$
Length: 32 characters
Special characters: Yes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Save this password securely!

💡 Usage examples:
   ADMIN_PASSWORD="xK9@mP2&vL8#qR5!wN7^zT4%yU6*aB3$" npm run db:seed-admin
   export JWT_SECRET="xK9@mP2&vL8#qR5!wN7^zT4%yU6*aB3$"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Access the Admin Panel

Start the development server:
```bash
npm run dev
```

Navigate to: **http://localhost:3000/admin/login**

## Caprover Deployment

The application is ready to deploy on Caprover with minimal configuration.

### Deploy to Caprover

1. **Create a new app** in your Caprover dashboard
   - App Name: `postgres-admin` (or your choice)
   - Enable HTTPS (Caprover handles SSL automatically)

2. **Deploy via Dockerfile**:
   - Caprover will automatically use the Dockerfile in the repository
   - No additional configuration needed!

3. **Set Environment Variables** in Caprover:
   ```
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   CREATE_ADMIN_USER=true
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ```

4. **Access your admin panel**:
   - https://postgres-admin.your-caprover-domain.com/admin/login

### Captain Definition (Optional)

If you want to customize the build, create `captain-definition` in the root:

```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

### Caprover One-Click App (Optional)

For easier deployment, you can also deploy as a one-click app. The all-in-one Docker image includes PostgreSQL and Next.js, so no external database needed!

### Notes

- **HTTPS**: Caprover automatically provides HTTPS via Let's Encrypt
- **Built-in Database**: The Docker image includes PostgreSQL, no need for separate database setup
- **Persistent Storage**: Caprover automatically handles volume persistence
- **Auto-restart**: Caprover restarts the container automatically on failure

## Cloudflare Tunnel Deployment (Alternative)

<details>
<summary>Click to expand Cloudflare Tunnel instructions</summary>

The application works seamlessly with Cloudflare Tunnel for secure HTTPS access without exposing ports.

### Prerequisites

1. Install `cloudflared`: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
2. Cloudflare account with a domain

### Quick Setup with Cloudflare Tunnel

1. **Start the application**:
   ```bash
   docker-compose up -d
   ```

2. **Create a Cloudflare Tunnel**:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create postgres-admin
   ```

3. **Create tunnel configuration** (`~/.cloudflared/config.yml`):
   ```yaml
   tunnel: <your-tunnel-id>
   credentials-file: /home/user/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: postgres-admin.yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

4. **Route DNS**:
   ```bash
   cloudflared tunnel route dns postgres-admin postgres-admin.yourdomain.com
   ```

5. **Run the tunnel**:
   ```bash
   cloudflared tunnel run postgres-admin
   ```

6. **Access your admin panel** at:
   - https://postgres-admin.yourdomain.com/admin/login

### Docker Compose with Cloudflare Tunnel

Create a complete setup with tunnel included:

```yaml
version: '3.8'

services:
  postgres-admin:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://docker:docker@localhost:5432/postgres
      - JWT_SECRET=your-secret-key-change-in-production
      - CREATE_ADMIN_USER=true
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=admin123
    volumes:
      - postgres_data:/var/lib/postgresql/15/main

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=<your-tunnel-token>
    depends_on:
      - postgres-admin
    restart: unless-stopped

volumes:
  postgres_data:
```

Get your tunnel token from: https://one.dash.cloudflare.com/

### Security Considerations with Cloudflare

✅ **Automatic HTTPS** - Cloudflare provides SSL/TLS automatically
✅ **DDoS Protection** - Built-in Cloudflare protection
✅ **Access Control** - Use Cloudflare Access for additional authentication
✅ **Rate Limiting** - Configure Cloudflare rate limits
✅ **WAF** - Web Application Firewall protection

### Recommended Cloudflare Settings

1. **SSL/TLS Mode**: Full (strict) recommended
2. **Always Use HTTPS**: Enabled
3. **Automatic HTTPS Rewrites**: Enabled
4. **HTTP Strict Transport Security (HSTS)**: Enabled
5. **Rate Limiting**: Configure for /api/* endpoints

### Cloudflare Access (Optional Extra Security)

Add an extra authentication layer:

```bash
# In Cloudflare Dashboard > Access > Applications
# Create a new application for postgres-admin.yourdomain.com
# Add authentication methods (Email OTP, Google, etc.)
```

</details>

## Docker Deployment

The project includes an **all-in-one Docker image** that contains both PostgreSQL and the Next.js application, making deployment simple and straightforward.

### Build Docker Image

```bash
docker build -t postgres-admin .
```

### Run with Docker (All-in-One)

The simplest way to run the application is using the all-in-one image:

```bash
docker run -p 3000:3000 -p 5432:5432 \
  -e JWT_SECRET="your-secret-key" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="admin123" \
  postgres-admin
```

The container will:
1. Start PostgreSQL automatically
2. Run database migrations
3. Create the admin user
4. Start the Next.js application

Access the admin panel at: **http://localhost:3000/admin/login**

### Using Docker Compose

The easiest way to run the application:

```bash
docker-compose up
```

This will:
- Build the all-in-one image
- Start PostgreSQL and Next.js in the same container
- Expose ports 3000 (web) and 5432 (database)
- Create a persistent volume for PostgreSQL data
- Automatically create an admin user

Access the admin panel at: **http://localhost:3000/admin/login**

Default credentials:
- **Username**: admin
- **Password**: admin123

### Multi-Container Setup (Optional)

If you prefer to run PostgreSQL in a separate container, create this `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  admin:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/mydb
      JWT_SECRET: your-secret-key-here
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up
```

## GitHub Container Registry (GHCR)

The project automatically builds and publishes Docker images to GitHub Container Registry when you push to the main branch or create tags.

### Pull from GHCR

```bash
docker pull ghcr.io/johndoe6345789/postgres:latest
```

### Run from GHCR

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-secret-key" \
  ghcr.io/johndoe6345789/postgres:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-change-in-production` |
| `ADMIN_USERNAME` | Initial admin username | `admin` |
| `ADMIN_PASSWORD` | Initial admin password | `admin123` |

## Security

- Only SELECT queries are allowed in the SQL query interface
- Password authentication with bcrypt hashing
- JWT-based session management
- HTTP-only cookies for session tokens
- Protected API routes requiring authentication

## API Routes

- `POST /api/admin/login` - User login
- `POST /api/admin/logout` - User logout
- `GET /api/admin/tables` - List all database tables
- `POST /api/admin/query` - Execute SQL query (SELECT only)

## Production Deployment

1. Set strong passwords for admin users
2. Use a secure JWT_SECRET
3. Enable HTTPS
4. Configure proper CORS settings
5. Set up database backups
6. Monitor logs and errors

## Development

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Create admin user
npm run db:seed-admin

# Start dev server
npm run dev
```

## License

MIT
