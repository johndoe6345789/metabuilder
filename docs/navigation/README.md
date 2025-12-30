# MetaBuilder - Enterprise Data Platform

MetaBuilder is a powerful, declarative enterprise data platform built on a 5-level permission system. It enables rapid development of multi-tenant data applications with JSON configurations and Lua scripting.

TODO: This file lives under docs/; links that start with ./docs/ are broken and PRD/SECURITY paths are outdated.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Development](#development)
- [Project Structure](#project-structure)

## ✨ Features

- **5-Level Permission System** - Granular access control (User, Admin, God, SuperGod, SystemRoot)
- **Multi-Tenant Architecture** - Built-in support for tenant isolation
- **Declarative Configuration** - Define features in JSON, not code
- **Lua Scripting** - Dynamic business logic without recompilation
- **Database-Driven** - All configuration stored and managed in database
- **Package System** - Modular, reusable feature packages
- **Type-Safe** - Full TypeScript support throughout
- **CI/CD Ready** - Automated testing, linting, and deployment workflows

## 🧪 Testing Workflows Locally

**New:** Test GitHub Actions workflows locally before pushing!

```bash
# Quick start - runs full CI pipeline
npm run act

# Test specific components
npm run act:lint        # ESLint linting
npm run act:build       # Production build
npm run act:e2e         # End-to-end tests
npm run act:typecheck   # TypeScript validation

# Interactive testing
npm run act:test        # Menu-driven testing

# Diagnostics
npm run act:diagnose    # Check setup (no Docker required)
```

See [ACT Cheat Sheet](docs/guides/ACT_CHEAT_SHEET.md) for quick reference or [Act Testing Guide](docs/guides/ACT_TESTING.md) for detailed documentation.

**Benefits:**
- ✅ Catch CI failures before pushing to GitHub
- ✅ No more "fix CI" commits
- ✅ Fast feedback loop (5-10 minutes per run)
- ✅ Works offline after first run

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for deployment)

### Development Setup

```bash
# Clone repository
git clone <repo>
cd metabuilder

# Install dependencies
npm install

# Set up database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## 📐 Architecture

MetaBuilder uses a **5-level permission system**:

```
SuperGod (Level 5) - System administrator, full access
   ↓
God (Level 4) - Power user, can modify system configuration
   ↓
Admin (Level 3) - Tenant administrator, manage users and data
   ↓
User (Level 2) - Regular user, standard data access
   ↓
Guest (Level 1) - Read-only access (not implemented)
```

### Key Components

- **Prisma ORM** - Type-safe database queries
- **React + TypeScript** - Modern UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Lua (Fengari)** - Embedded scripting

For detailed architecture information, see [Architecture Documentation](./docs/architecture/).

## 📚 Documentation

### Getting Started

- [Getting Started Guide](./docs/guides/getting-started.md) - Setup and first steps
- [5-Level Permission System](./docs/architecture/5-level-system.md) - Understanding permissions

### Development Guides

- [API Development](./docs/guides/api-development.md) - Creating API routes
- [Package System](./docs/architecture/packages.md) - Building packages
- [Database Guide](./docs/architecture/database.md) - Working with Prisma

### Reference

- [Project Requirements (PRD)](./docs/PRD.md)
- [Security Guidelines](./docs/SECURITY.md)
- [Code Documentation Index](./docs/CODE_DOCS_MAPPING.md)

### Local Testing with Act

- [Act Cheat Sheet](./docs/guides/ACT_CHEAT_SHEET.md) - Quick reference for common commands
- [Act Testing Guide](./docs/guides/ACT_TESTING.md) - Complete documentation
- [GitHub Actions Reference](./docs/guides/github-actions-local-testing.md) - Technical details

### Full Documentation

See [docs/README.md](./docs/README.md) for the complete documentation index.

## 🔧 Development

### Available Scripts

```bash
# Development & Building
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests
npm run test:e2e:ui      # Run e2e tests with UI
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues

# Local Workflow Testing (Act)
npm run act              # Run full CI pipeline locally
npm run act:lint         # Test linting
npm run act:build        # Test production build
npm run act:e2e          # Test E2E tests
npm run act:test         # Interactive testing menu
npm run act:diagnose     # Check setup (no Docker)

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Apply schema changes
npm run db:studio        # Open database UI

# Other
npm run act              # Run GitHub Actions locally
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run all tests
npm run test:e2e
```

## 📁 Project Structure

```
metabuilder/
├── src/                    # React application source
│   ├── app/               # App layout and pages
│   ├── components/        # React components
│   ├── lib/              # Utility libraries
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── seed-data/        # Database initialization data
├── prisma/               # Database schema & migrations
│   └── schema.prisma     # Prisma schema
├── packages/             # Modular feature packages
│   ├── admin_dialog/
│   ├── dashboard/
│   ├── data_table/
│   ├── form_builder/
│   └── ...
├── docs/                 # Documentation
│   ├── architecture/     # Architecture guides
│   ├── guides/          # Development guides
│   └── ...
├── e2e/                 # End-to-end tests
├── scripts/             # Utility scripts
│   └── doc-quality-checker.sh  # Documentation quality assessment
├── deployment/          # Deployment configurations
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── middleware.ts        # Next.js middleware
└── package.json         # Dependencies & scripts
```

### Directory Guide

TODO: src/README.md does not exist under docs/; confirm correct location or add missing docs/src.

- **src/** - See [src/README.md](./src/README.md)
- **packages/** - See [packages/README.md](./packages/README.md)
- **docs/** - See [docs/README.md](./docs/README.md)
- **prisma/** - Database schema and migrations
- **e2e/** - Playwright end-to-end tests
- **scripts/** - Utility scripts including documentation quality checker

## 🔐 Security

- All credentials stored as SHA-512 hashes
- 5-level permission system for granular access control
- Sandboxed Lua script execution
- Type-safe database queries with Prisma
- Security documentation: [SECURITY.md](./docs/SECURITY.md)

## 📦 Deployment

### Docker

```bash
# Development
docker-compose -f deployment/docker-compose.development.yml up

# Production
docker-compose -f deployment/docker-compose.production.yml up
```

### Manual Deployment

TODO: Manual deployment docs are not under docs/deployment; update this link to the correct location.
See [deployment/README.md](./deployment/README.md) for detailed instructions.

## 🤝 Contributing

1. Check [documentation guidelines](./docs/guides/api-development.md)
2. Follow code conventions in [Copilot instructions](./.github/copilot-instructions.md)
3. Run linter: `npm run lint:fix`
4. Run tests: `npm run test:e2e`
5. Update documentation as needed

## 📊 Documentation Quality

This project maintains high documentation standards:

```bash
# Check documentation quality
./scripts/doc-quality-checker.sh /workspaces/metabuilder
```

Current metrics:
- README Coverage: 60%+
- JSDoc Coverage: 100%
- Type Annotations: 80%+
- Security Docs: 100%

## 📄 License

See [LICENSE](./LICENSE) file.

## 📞 Support

For questions or issues:

1. Check the [documentation](./docs/)
2. Review [example code](./src/components/examples/)
3. Check [existing tests](./e2e/) for patterns
4. Review [SECURITY.md](./docs/SECURITY.md) for security questions

## Quick Links

- **Permission Model**: [5-Level System](./docs/architecture/5-level-system.md)
- **Database Schema**: [Prisma Schema](./prisma/schema.prisma)
- **API Patterns**: [API Development Guide](./docs/guides/api-development.md)
- **Security**: [Security Guidelines](./docs/SECURITY.md)
- **Packages**: [Package System](./docs/architecture/packages.md)
