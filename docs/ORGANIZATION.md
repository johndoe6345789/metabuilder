# Documentation Organization

MetaBuilder docs organized by purpose for easy navigation.

## Structure

```
docs/
├── README.md                  # Overview & quick links
├── INDEX.md                   # Full navigation hub
├── ORGANIZATION.md            # This file
│
├── 🎯 Core Concepts
│   ├── architecture/           # System design, 5-level permissions, packages
│   ├── api/                    # API reference & integration
│   ├── database/               # Prisma schema & design
│   └── dbal/                   # Database abstraction layer
│
├── 🛠️ Development
│   ├── getting-started/        # Setup & quickstart
│   ├── development/            # Dev workflows & tools
│   ├── packages/               # Building packages
│   └── lua/                    # Lua scripting
│
├── ✅ Quality
│   ├── testing/                # Testing guidelines
│   ├── quality-metrics/        # Code quality
│   ├── refactoring/            # Refactoring patterns
│   └── stub-detection/         # Finding unimplemented functions
│
├── 🚀 Infrastructure
│   ├── deployments/            # CI/CD & Docker
│   └── migrations/             # Database migrations
│
├── 📖 Reference
│   ├── security/               # Auth & permissions
│   ├── troubleshooting/        # Common issues
│   ├── reference/              # Diagrams & resources
│   └── guides/                 # How-to guides & tutorials
│   └── implementation/         # Feature implementations
│
└── 🗃️ archive/                # Legacy & historical
```

## Usage

- **New to MetaBuilder?** → Start with [README](./README.md)
- **Need specific info?** → Check [INDEX](./INDEX.md)
- **Searching for something?** → Use the structure above

## Guidelines

### Adding docs
1. Place in most relevant folder
2. Use kebab-case filenames
3. Update folder's README.md
4. Link from INDEX.md if new major section

### Principles
- One folder per topic area
- Each folder has README.md
- No duplicate content across folders
- Archive old/historical docs in `archive/`
