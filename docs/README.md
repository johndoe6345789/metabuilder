# MetaBuilder Documentation

Welcome to the MetaBuilder documentation. This directory contains comprehensive documentation organized into logical categories.

## 🚀 Quick Start

**New to the project?** Start here:
1. [Platform Guide](reference/platform-guide.md) - Overview of the 5-level system
2. [Quick Reference](reference/quick-reference.md) - Common tasks and patterns
3. [Data-Driven Architecture](architecture/data-driven-architecture.md) - Core concepts

**Ready to build?**
- [Package System](packages/package-system.md) - Create and use packages
- [Lua Integration](lua/integration.md) - Add custom logic
- [Generic Page System](architecture/generic-page-system.md) - Build pages without code

## 📁 Current Directory Structure

```
docs/
├── README.md (this file)
├── RELOCATION_SUMMARY.md        # Guide for organizing docs
├── FILE_RELOCATION_GUIDE.md     # Detailed relocation instructions
│
├── architecture/                 # System Architecture
│   ├── data-driven-architecture.md
│   ├── declarative-components.md
│   └── generic-page-system.md
│
├── database/                     # Database Documentation
│   └── overview.md
│
├── development/                  # Development Guides
│   ├── typescript-reduction-guide.md
│   ├── cruft-removal-report.md
│   └── improvements.md
│
├── iterations/                   # Project History
│   ├── iteration-24-summary.md
│   ├── iteration-25-summary.md
│   ├── iteration-25-complete.md
│   ├── iteration-26-summary.md
│   └── the-transformation.md
│
├── lua/                         # Lua Integration
│   ├── integration.md
│   └── snippets-guide.md
│
├── packages/                    # Package System
│   ├── package-system.md
│   ├── import-export.md
│   ├── scripts-guide.md
│   ├── modular-packages-guide.md
│   ├── modular-seed-data-guide.md
│   └── irc-conversion-guide.md
│
├── reference/                   # Quick Reference
│   ├── quick-reference.md
│   ├── documentation-index.md
│   └── platform-guide.md
│
└── security/                    # Security
    └── guide.md
```

## 📖 Documentation Categories

### Architecture
Deep dives into system design and implementation patterns:
- **Data-Driven Architecture** - How the system minimizes TypeScript dependencies
- **Declarative Components** - Component system built on JSON + Lua
- **Generic Page System** - Dynamic page rendering from configuration

### Database
Database layer documentation:
- **Overview** - KV persistence, schemas, and CRUD operations

### Development
Guides for contributors and developers:
- **TypeScript Reduction Guide** - Strategy for data-driven approach
- **Improvements** - UI/UX enhancements and builder tools
- **Cruft Removal Report** - Cleanup and maintenance history

### Iterations
Project evolution and milestone documentation:
- **Iteration Summaries** - What was accomplished in each iteration
- **The Transformation** - Before/after comparison of the data-driven shift

### Lua
Lua scripting integration:
- **Integration** - How Lua works in MetaBuilder
- **Snippets Guide** - Reusable Lua patterns and examples

### Packages
Package system documentation:
- **Package System** - Overview and architecture
- **Import/Export** - Sharing and distributing packages
- **Modular Guides** - Creating modular, reusable components
- **IRC Conversion** - Case study of converting components to declarative

### Reference
Quick lookup and overview materials:
- **Quick Reference** - Common tasks and code snippets
- **Documentation Index** - Finding the right docs for your needs
- **Platform Guide** - High-level overview of the 5-level system

### Security
Security practices and guidelines:
- **Guide** - Authentication, authorization, and best practices
```

## 🔗 Quick Links

**Getting Started:**
- [Platform Guide](reference/platform-guide.md) - 5-level architecture overview
- [Quick Reference](reference/quick-reference.md) - Common tasks
- [Documentation Index](reference/documentation-index.md) - Find what you need

**Core Concepts:**
- [Data-Driven Architecture](architecture/data-driven-architecture.md)
- [Generic Page System](architecture/generic-page-system.md)
- [Declarative Components](architecture/declarative-components.md)

**Building With MetaBuilder:**
- [Package System](packages/package-system.md)
- [Lua Integration](lua/integration.md)
- [Modular Seed Data](packages/modular-seed-data-guide.md)

**Development:**
- [TypeScript Reduction Strategy](development/typescript-reduction-guide.md)
- [Recent Improvements](development/improvements.md)
- [Security Guide](security/guide.md)

**Project History:**
- [The Transformation](iterations/the-transformation.md)
- [Iteration 25 Complete](iterations/iteration-25-complete.md)
- [Iteration 26 Summary](iterations/iteration-26-summary.md)

## 🎯 Find What You Need

### I want to understand...
- **The big picture**: [Platform Guide](reference/platform-guide.md)
- **How data-driven works**: [Data-Driven Architecture](architecture/data-driven-architecture.md)
- **Project evolution**: [The Transformation](iterations/the-transformation.md)

### I want to build...
- **A new package**: [Package System](packages/package-system.md) → [Modular Packages](packages/modular-packages-guide.md)
- **Custom logic**: [Lua Integration](lua/integration.md) → [Lua Snippets](lua/snippets-guide.md)
- **A new page**: [Generic Page System](architecture/generic-page-system.md)

### I want to learn from...
- **Examples**: [IRC Conversion Guide](packages/irc-conversion-guide.md)
- **Quick patterns**: [Quick Reference](reference/quick-reference.md)
- **History**: Browse [iterations/](iterations/)

## 📝 Documentation Standards

All documentation in this directory follows these standards:

1. **Markdown Format**: All files use GitHub-flavored markdown
2. **Code Examples**: Include practical, working examples
3. **Cross-References**: Link to related documentation
4. **Up-to-Date**: Documentation is updated with each iteration
5. **Comprehensive**: Cover both basic and advanced use cases

## 🔄 Relocating Documentation

If documentation files need to be organized from the root:

1. See [RELOCATION_SUMMARY.md](RELOCATION_SUMMARY.md) for overview
2. Run the provided `move-docs.sh` script from the project root
3. Or follow [FILE_RELOCATION_GUIDE.md](FILE_RELOCATION_GUIDE.md) for manual steps

## 🤝 Contributing to Documentation

When adding new documentation:

1. Place it in the appropriate category directory
2. Follow the naming convention: lowercase-with-hyphens.md
3. Add cross-references to related docs
4. Include code examples where applicable
5. Update this README's Quick Links if adding important docs

## 📊 Documentation Metrics

- **Total Categories**: 8 (Architecture, Database, Development, Iterations, Lua, Packages, Reference, Security)
- **Key Documents**: 20+ comprehensive guides
- **Iteration History**: 4 detailed summaries
- **Last Updated**: Iteration 27
