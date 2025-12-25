# Getting Started Guide

Welcome to MetaBuilder! This guide will help you get up and running quickly.

## Prerequisites

- Node.js 18+
- npm 9+
- Git
- Basic React/TypeScript knowledge

## Quick Setup

### 1. Clone Repository

```bash
git clone https://github.com/johndoe6345789/metabuilder.git
cd metabuilder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
```

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Create database and apply migrations
npm run db:push

# Seed initial data
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## First Steps

### Create an Admin Account

1. Start the application
2. Click "Create Account" on login page
3. Enter email and password
4. Account is created as Level 2 (User)
5. To elevate to admin, modify database directly or use Prisma Studio

```bash
npm run db:studio
# Update user.level to 3 in the UI
```

### Explore the UI

- **Level 1**: Public pages (no login)
- **Level 2**: User dashboard (after login)
- **Level 3**: Admin panel (if level 3+)
- **Level 4**: Advanced tools (if level 4+)
- **Level 5**: System settings (if level 5, supergod only)

### Understanding the Code Structure

```
src/
├── components/        # React components
├── lib/              # Business logic & database
├── hooks/            # Custom React hooks
├── types/            # TypeScript definitions
└── styles/           # SCSS stylesheets

docs/                 # Documentation
packages/             # Feature packages
prisma/              # Database schema
```

## Common Development Tasks

### Run Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

### Lint & Format Code

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

### Database Operations

```bash
# View database with UI
npm run db:studio

# Create migration after schema change
npm run db:migrate

# Reset database (destructive!)
npm run db:reset
```

## Creating Your First Component

### 1. Create Component File

```tsx
// src/components/HelloWorld.tsx
import { Button } from '@/components/ui/button'

interface HelloWorldProps {
  name: string
  onGreet?: () => void
}

/**
 * HelloWorld - Simple greeting component
 */
export const HelloWorld: React.FC<HelloWorldProps> = ({ name, onGreet }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello, {name}!</h1>
      {onGreet && (
        <Button onClick={onGreet}>Click to Greet</Button>
      )}
    </div>
  )
}
```

### 2. Use in Your App

```tsx
import { HelloWorld } from '@/components/HelloWorld'

export const Page = () => {
  return (
    <HelloWorld 
      name="World"
      onGreet={() => console.log('Greeted!')}
    />
  )
}
```

## Working with Database

### 1. Update Schema

Edit `prisma/schema.prisma`:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   @db.Text
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  tenantId  String
}
```

### 2. Create Migration

```bash
npm run db:migrate
```

### 3. Use in Code

```typescript
// Get posts for current tenant
const posts = await prisma.post.findMany({
  where: { tenantId: user.tenantId },
  include: { author: true },
})

// Create new post
const newPost = await prisma.post.create({
  data: {
    title: 'My First Post',
    content: 'Content here...',
    author: { connect: { id: user.id } },
    tenant: { connect: { id: user.tenantId } },
  },
})
```

## Permission-Based Features

### Check User Level

```typescript
import { useAuth } from '@/hooks'
import { canAccessLevel } from '@/lib/auth'

export const AdminFeature = () => {
  const { user } = useAuth()
  
  // Only show for Level 3+
  if (!canAccessLevel(user.level, 3)) {
    return <p>You don't have permission to view this.</p>
  }
  
  return <AdminPanel />
}
```

## Debugging

### Browser DevTools

```javascript
// In browser console
localStorage  // View stored data
sessionStorage // View session data
document.querySelector('[data-test-id]') // Find test elements
```

### Debug Logs

```bash
# Enable verbose logging
DEBUG=metabuilder:* npm run dev
```

### Database Debugging

```bash
# View all database operations
npm run db:studio

# Check migrations
ls prisma/migrations/
```

## Common Issues

### "Port 5173 already in use"

```bash
# Use different port
npm run dev -- --port 5174
```

### Database connection failed

```bash
# Check DATABASE_URL in .env.local
# Ensure database server is running
npm run db:push  # Recreate database
```

### TypeScript errors

```bash
# Regenerate Prisma client
npm run db:generate

# Type check
npm run type-check
```

## Next Steps

1. **Read Documentation**: Check `/docs/` for detailed guides
2. **Explore Examples**: Look at `/packages/` for example implementations
3. **Run Tests**: Study test files for usage patterns
4. **Build Features**: Create your first feature package

## Getting Help

TODO: Links in this section use ./ from docs/guides; update to correct relative paths (architecture/reference/troubleshooting) and fix README/SECURITY/COMPONENT_MAP locations below.

- 📖 [Architecture Documentation](./architecture/)
- 🔍 [API Reference](./reference/)
- 🐛 [Troubleshooting Guide](./troubleshooting/)
- 💬 [GitHub Issues](https://github.com/johndoe6345789/metabuilder/issues)

## Key Resources

- **Main README**: [README.md](../../README.md)
- **Architecture**: [5-Level System](./architecture/5-level-system.md)
- **Database Guide**: [Database Architecture](./architecture/database.md)
- **Component Guidelines**: [Component Map](./COMPONENT_MAP.md)
- **Security**: [Security Guide](./SECURITY.md)

Happy coding! 🚀
