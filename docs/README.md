# MetaBuilder Documentation

Complete documentation for the MetaBuilder data-driven application platform.

## Start Here

- **New?** → [Getting Started](./getting-started/)
- **Want quick navigation?** → [Documentation Index](./INDEX.md)
- **Looking for something specific?** → Use the quick links below

## Core Documentation

| | | |
|------|---|---|
| 🚀 **Getting Started** | [Setup & quickstart](./getting-started/) | First time? Start here |
| 🏗️ **Architecture** | [Design & concepts](./architecture/) | How MetaBuilder works |
| 🧪 **Testing** | [Quality & best practices](./testing/) | Testing strategies |
| 🔧 **Development** | [Tools & workflows](./development/) | Dev environment |
| 📦 **Packages** | [Building packages](./packages/) | Package system |
| 🛢️ **Database** | [Schema & design](./database/) | Data layer |
| 🔄 **DBAL** | [Abstraction layer](./dbal/) | TypeScript & C++ |
| 🔐 **Security** | [Auth & permissions](./security/) | Security practices |
| 🚢 **Deployments** | [CI/CD & Docker](./deployments/) | Production |
| 📚 **Reference** | [Guides & materials](./reference/) | Resources |

## What is MetaBuilder?

MetaBuilder is a **data-driven, multi-tenant platform** where:
- **95% functionality** in JSON/Lua, not TypeScript
- **Configuration-driven** from database, not hardcoded
- **Modular packages** for features and components
- **Multi-tenancy** is built in by default
- **Customization** happens without code changes

### Key Features

✅ **5-Level Architecture** - Sophisticated hierarchy for global, tenant, module, entity, and record levels
✅ **Data-Driven Design** - Define functionality declaratively in JSON and Lua
✅ **Multi-Tenant Ready** - Built-in tenant isolation and configuration
✅ **Package System** - Self-contained, importable/exportable packages
✅ **Generic Components** - Render complex UIs from configuration
✅ **Lua Scripting** - Business logic without redeploying
✅ **Secure Database Layer** - Type-safe ORM with built-in security
✅ **Comprehensive Testing** - Unit, integration, and E2E test suites

## Documentation Structure

```
docs/
├── README.md (this file)           # Overview
├── INDEX.md                        # Complete documentation index
│
├── getting-started/                # For new developers
│   ├── README.md
│   ├── PRD.md                      # Product requirements
│   └── QUICK_START.md              # Setup guide
│
├── architecture/                   # System design
│   ├── 5-level-system.md
│   ├── data-driven-architecture.md
│   ├── packages.md
│   └── ...
│
├── testing/                        # Testing docs
│   ├── TESTING_GUIDELINES.md
│   ├── UNIT_TESTS_IMPLEMENTATION.md
│   └── ...
│
├── security/                       # Security docs
│   ├── SECURITY.md
│   └── SECURE_DATABASE_LAYER.md
│
├── api/                            # API documentation
│   ├── platform-guide.md
│   ├── DBAL_INTEGRATION.md
│   └── ...
│
├── implementation/                 # Detailed guides
│   ├── COMPONENT_MAP.md
│   ├── MULTI_TENANT_SYSTEM.md
│   └── ...
│
├── refactoring/                    # Refactoring guides
│   ├── REFACTORING_STRATEGY.md
│   └── ...
│
└── ...other directories
```

## Common Tasks

### I'm new to MetaBuilder
→ Go to [Getting Started](./getting-started/)

### I need to understand the architecture
→ Read [5-Level System](./architecture/5-level-system.md)

### I need to write tests
→ Check [Testing Guidelines](./testing/TESTING_GUIDELINES.md)

### I need to implement a feature
→ See [Implementation Guides](./implementation/)

### I need to set up security
→ Read [Security Guide](./security/SECURITY.md)

### I need to refactor code
→ Check [Refactoring Strategy](./refactoring/REFACTORING_STRATEGY.md)

## Key Concepts

### Five-Level Architecture
MetaBuilder organizes configuration and functionality across five levels:

1. **Level 0 (Global)** - Platform-wide settings
2. **Level 1 (Tenant)** - Tenant-specific customization
3. **Level 2 (Modules)** - Package definitions
4. **Level 3 (Entities)** - Schemas and forms
5. **Level 4 (Records)** - Individual data records

[Learn more](./architecture/5-level-system.md)

### Data-Driven Design
Instead of coding everything, MetaBuilder uses:
- **JSON** for configuration
- **Lua** for business logic
- **Database** as source of truth

Benefits: Multi-tenancy, flexibility, no redeployment needed.

[Learn more](./architecture/data-driven-architecture.md)

### Package System
Features are self-contained packages with:
- Configuration (seeds)
- Components
- Scripts
- Assets

[Learn more](./architecture/packages.md)

## Development Workflow

### 1. Plan
- Review the PRD and architecture docs
- Design your solution
- Create a feature branch

### 2. Implement
- Start with database schema (Prisma)
- Add seed data and configuration
- Create generic components
- Add Lua scripts for logic

### 3. Test
- Write unit tests
- Run `npm run test:coverage`
- Test with different permission levels
- Run E2E tests

### 4. Document
- Update relevant doc files
- Add code comments
- Update this README if needed

### 5. Deploy
- Run linting: `npm run lint:fix`
- Test in staging
- Deploy to production

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build

# Database
npm run db:generate           # Generate Prisma client
npm run db:push              # Sync schema
npm run db:studio            # Prisma Studio

# Testing
npm test                      # Watch mode
npm test -- --run             # Run once
npm run test:coverage         # With coverage
npm run test:e2e              # E2E tests

# Code Quality
npm run lint                  # Check
npm run lint:fix              # Auto-fix
```

## System Requirements

- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Getting Help

1. **Read the docs** - Start with the [Documentation Index](./INDEX.md)
2. **Search the docs** - Use Ctrl+F to search
3. **Check examples** - Look at existing code
4. **Ask the team** - Connect with other developers

## Contributing

When contributing to MetaBuilder:
1. Follow the [Refactoring Guide](./refactoring/)
2. Write tests for your code
3. Follow security best practices
4. Update documentation
5. Get code review before merging

## Key Resources

- 📖 [Documentation Index](./INDEX.md) - Complete navigation
- 🏗️ [Architecture Overview](./architecture/5-level-system.md)
- 🧪 [Testing Guide](./testing/TESTING_GUIDELINES.md)
- 🔒 [Security Guide](./security/SECURITY.md)
- 🔄 [Refactoring Guide](./refactoring/REFACTORING_STRATEGY.md)

## Status

✅ **Architecture** - Complete and documented
✅ **Core Features** - Fully implemented
✅ **Testing** - Comprehensive test suite
✅ **Security** - Production-ready
✅ **Documentation** - Well-organized and detailed

## License

See [LICENSE](../LICENSE) file for details.

---

**Last Updated**: December 2025
**Questions?** Check [INDEX.md](./INDEX.md) for detailed navigation
