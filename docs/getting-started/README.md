# Getting Started with MetaBuilder

Welcome to MetaBuilder! This section has everything you need to get up and running.

## Quick Start (5 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/metabuilder
   cd metabuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## What's Next?

- **[PRD.md](./PRD.md)** - Learn about all features and requirements
- **[QUICK_START.md](./QUICK_START.md)** - Detailed setup instructions
- **[Architecture Overview](../architecture/5-level-system.md)** - Understand the system design

## Key Concepts

### MetaBuilder is Data-Driven
95% of functionality is defined through JSON and Lua configuration, not TypeScript. This makes it:
- **Flexible**: Change behavior without recompiling
- **Multi-tenant**: Each tenant has isolated configurations
- **Declarative**: Define what you want, not how to do it

### Five-Level Architecture
The system uses a sophisticated 5-level hierarchy:
1. Global system configuration
2. Tenant-specific features
3. Module and package definitions
4. Entity and form configurations
5. Individual records and data

[Learn more about the 5-level system](../architecture/5-level-system.md)

## Common Tasks

### I want to...

**...understand what MetaBuilder does**
→ Read [PRD.md](./PRD.md)

**...understand how it works**
→ Read [5-Level System](../architecture/5-level-system.md)

**...write code**
→ Follow [Testing Guidelines](../testing/TESTING_GUIDELINES.md)

**...deploy to production**
→ Check [Deployment Guide](../deployments/)

**...create a new package**
→ Learn about [Packages](../architecture/packages.md)

## Development Environment

### Requirements
- Node.js 18+
- npm 9+
- PostgreSQL 14+

### Useful Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build

# Database
npm run db:generate   # Generate Prisma client
npm run db:push       # Sync schema with database
npm run db:studio     # Open Prisma Studio

# Testing
npm test             # Run tests in watch mode
npm test -- --run    # Run tests once
npm run test:coverage # With coverage report

# Code Quality
npm run lint         # Check for issues
npm run lint:fix     # Auto-fix issues
```

## Documentation Hierarchy

1. **This file (README.md)** - Overview and quick start
2. **[PRD.md](./PRD.md)** - Features and requirements
3. **[Architecture](../architecture/)** - How it works
4. **[Implementation Guides](../implementation/)** - Detailed tutorials
5. **[API Reference](../api/)** - API documentation
6. **[Testing](../testing/)** - Testing guide
7. **[Security](../security/)** - Security practices

## Troubleshooting

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Database connection failed
1. Check PostgreSQL is running
2. Verify `.env` has correct `DATABASE_URL`
3. Run `npm run db:push` to initialize schema

### Tests failing
1. Ensure database is set up: `npm run db:push`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Run tests: `npm test -- --run`

## Getting Help

- 📚 Check the [full documentation index](../INDEX.md)
- 🔍 Search for your issue in the docs
- 🐛 Check [Troubleshooting](../troubleshooting/)
- 💬 Ask the team

## Next Steps

1. ✅ Complete the quick start above
2. 📖 Read [PRD.md](./PRD.md) to understand the product
3. 🏗️ Read [5-Level System](../architecture/5-level-system.md) to understand the architecture
4. 🧪 Check [Testing Guidelines](../testing/TESTING_GUIDELINES.md) before writing code
5. 🚀 Start building!

---

**Need more details?** Check the [full documentation index](../INDEX.md).
