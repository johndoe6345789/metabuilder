# DBAL - Database Abstraction Layer

A language-agnostic database abstraction layer that provides a secure interface between client applications and database backends.

## Structure

```
dbal/
├── development/     # TypeScript implementation (fast iteration)
├── production/      # C++ implementation (security & performance)
├── shared/          # Shared resources (API specs, tools, etc.)
└── docs/            # Documentation
```

## Quick Links

- 📖 **[Full Documentation](docs/README.md)** - Complete project documentation
- 🚀 **[Quick Start](shared/docs/QUICK_START.md)** - Get started in 5 minutes
- 🏗️ **[Architecture](docs/PROJECT.md)** - System architecture and design
- 🤖 **[Agent Guide](docs/AGENTS.md)** - AI development guidelines
- 📋 **[Restructure Info](docs/RESTRUCTURE_SUMMARY.md)** - Recent organizational changes
- ☁️ **[S3 Configuration](docs/S3_CONFIGURATION.md)** - S3 blob storage setup

## Development

### TypeScript (Development)
```bash
cd development
npm install
npm run build
npm test
```

### C++ (Production)
```bash
cd production
# See production/docs/ for C++ build instructions
```

### Shared Resources
- **API Schemas**: `shared/api/schema/`
- **Tools**: `shared/tools/` (codegen, build assistant)
- **Scripts**: `shared/scripts/` (build, test)

## License

MIT - See [LICENSE](LICENSE) file.
