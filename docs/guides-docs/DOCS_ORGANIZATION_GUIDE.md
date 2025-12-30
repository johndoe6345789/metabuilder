# 📚 MetaBuilder Documentation Organization Guide

Welcome! All MetaBuilder documentation is organized in the `/docs` folder. This guide helps you navigate it effectively.

TODO: This file is already in docs/; links that start with ./docs/ are broken and should be updated to correct relative paths.

## 🚀 Quick Start (Choose Your Path)

### 👤 I'm New to MetaBuilder
**→ Start here:** [docs/getting-started/NEW_CONTRIBUTOR_PATH.md](./docs/getting-started/NEW_CONTRIBUTOR_PATH.md)  
A structured 2-3 hour learning path that teaches you everything you need to know.

### 🔍 I Need Something Specific
**→ Use this:** [docs/NAVIGATION.md](./docs/NAVIGATION.md)  
Master navigation hub with links to all documentation organized by category.

### 📖 I Want to Browse
**→ Go here:** [docs/INDEX.md](./docs/INDEX.md)  
Quick navigation with highlighted quick-reference links.

### 🗂️ I Want to Understand the Structure
**→ Read this:** [docs/ORGANIZATION.md](./docs/ORGANIZATION.md)  
Detailed breakdown of how documentation is organized.

---

## 📂 Directory Structure

```
docs/
├── NAVIGATION.md              ← 🗺️ Master navigation (use this!)
├── INDEX.md                   ← Quick nav hub
├── ORGANIZATION.md            ← How docs are organized
├── README.md                  ← Docs overview
│
├── getting-started/
│   ├── NEW_CONTRIBUTOR_PATH.md   ← 👈 NEW TEAM MEMBERS START HERE
│   ├── README.md
│   ├── PRD.md
│   └── ...
│
├── architecture/              ← System design & concepts
├── testing/                   ← Testing guidelines & patterns
├── implementation/            ← How-to guides for features
├── refactoring/               ← Code quality standards
├── packages/                  ← Package system docs
├── guides/                    ← How-to guides & tutorials
├── dbal/                      ← Database abstraction layer
├── api/                       ← API reference
├── deployments/               ← Deployment & DevOps
├── development/               ← Development workflows
├── database/                  ← Database documentation
├── quality-metrics/           ← Code quality & metrics
├── security/                  ← Security best practices
├── lua/                       ← Lua scripting
├── troubleshooting/           ← Problem solving
├── reference/                 ← Quick reference & lookup
├── archive/                   ← Historical/deprecated docs
├── stub-detection/            ← Stub detection system
├── src/                       ← Source code documentation
├── migrations/                ← Database migrations
├── iterations/                ← Project iteration histories
└── builds/                    ← Build system docs
```

---

## 🎯 Common Tasks

| I want to... | Link | Time |
|---|---|---|
| **Get started developing** | [NEW_CONTRIBUTOR_PATH.md](./docs/getting-started/NEW_CONTRIBUTOR_PATH.md) | 2-3 hrs |
| **Understand the architecture** | [5-level-system.md](./docs/architecture/5-level-system.md) | 15 min |
| **Write a test** | [TESTING_GUIDELINES.md](./docs/testing/TESTING_GUIDELINES.md) | 10 min |
| **Create a new component** | [implementation/COMPONENT_MAP.md](./docs/implementation/COMPONENT_MAP.md) | 20 min |
| **Add a database feature** | [DBAL_INTEGRATION.md](./docs/implementation/DBAL_INTEGRATION.md) | 30 min |
| **Deploy the application** | [deployments/README.md](./docs/deployments/README.md) | 15 min |
| **Fix a bug** | [refactoring/REFACTORING_STRATEGY.md](./docs/refactoring/REFACTORING_STRATEGY.md) | varies |
| **Create a package** | [packages/README.md](./docs/packages/README.md) | 30 min |
| **Solve a problem** | [troubleshooting/README.md](./docs/troubleshooting/README.md) | varies |
| **Run tests locally** | [guides/ACT_CHEAT_SHEET.md](./docs/guides/ACT_CHEAT_SHEET.md) | 5 min |

---

## 📊 Documentation Quick Facts

- **Total Files**: 144+ markdown documents
- **Main Categories**: 23 directories
- **Quick References**: 10+ cheat sheets & quick-start guides
- **Implementation Guides**: 15+ detailed step-by-step guides
- **Architecture Documentation**: 8+ core architecture files

---

## 🔑 Key Documentation

### **MUST READ** (Everyone)
1. **[5-level-system.md](./docs/architecture/5-level-system.md)** - Permission hierarchy
2. **[TESTING_GUIDELINES.md](./docs/testing/TESTING_GUIDELINES.md)** - How we test
3. **[Copilot Instructions](./docs/../../.github/copilot-instructions.md)** - Development standards

### **MUST READ** (By Role)

**Frontend Developers**:
- [generic-page-system.md](./docs/architecture/generic-page-system.md) - Component rendering
- [packages/README.md](./docs/packages/README.md) - Package system
- [guides/SASS_CONFIGURATION.md](./docs/guides/SASS_CONFIGURATION.md) - Styling

**Backend Developers**:
- [DBAL_INTEGRATION.md](./docs/implementation/DBAL_INTEGRATION.md) - Database layer
- [database/PRISMA_SETUP.md](./docs/database/PRISMA_SETUP.md) - ORM setup
- [migrations/README.md](./docs/migrations/README.md) - Migrations

**DevOps/Infrastructure**:
- [deployments/README.md](./docs/deployments/README.md) - Deployment
- [deployments/GITHUB_WORKFLOWS_AUDIT.md](./docs/deployments/GITHUB_WORKFLOWS_AUDIT.md) - CI/CD
- [builds/CROSS_PLATFORM_BUILD.md](./docs/builds/CROSS_PLATFORM_BUILD.md) - Builds

**QA/Testing**:
- [TESTING_GUIDELINES.md](./docs/testing/TESTING_GUIDELINES.md) - Test standards
- [testing/TESTING_IMPLEMENTATION_SUMMARY.md](./docs/testing/TESTING_IMPLEMENTATION_SUMMARY.md) - Implementation
- [testing/FUNCTION_TEST_COVERAGE.md](./docs/testing/FUNCTION_TEST_COVERAGE.md) - Coverage

---

## 🔍 Search Tips

### Using VS Code

1. **Quick Open**: `Ctrl+P` (or `Cmd+P` on Mac)
2. **Search Examples**:
   - `testing` - Find testing files
   - `DBAL` - Find DBAL documentation
   - `refactoring` - Find refactoring guides
   - `arch/` - Browse architecture files

### Using File Search
- `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) to search within files
- Search for "ERROR:", "TODO:", "FIXME:" to find action items

---

## 📝 Navigation Patterns

### From Root
Files at the root level are kept minimal:
- `README.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines  
- `START_HERE.md` - Entry point
- All other docs are in `/docs` folder ✅

### By Category
Browse `/docs/{category}/README.md` for category overview:
- `docs/architecture/README.md` - Architecture overview
- `docs/testing/README.md` - Testing overview
- `docs/implementation/README.md` - Implementation overview

### Quick References
Most categories have quick-reference guides:
- `QUICK_START.md` - Fast onboarding
- `CHEAT_SHEET.md` - Quick lookup
- `QUICK_REFERENCE.md` - Common patterns

---

## 💡 Pro Tips

### ✅ DO:
- ✅ Start with [NEW_CONTRIBUTOR_PATH.md](./docs/getting-started/NEW_CONTRIBUTOR_PATH.md) if you're new
- ✅ Use [NAVIGATION.md](./docs/NAVIGATION.md) to find anything
- ✅ Check [troubleshooting/](./docs/troubleshooting/) if stuck
- ✅ Reference [archive/](./docs/archive/) for historical context
- ✅ Keep [Copilot Instructions](./docs/../../.github/copilot-instructions.md) handy

### ❌ DON'T:
- ❌ Search randomly - use the navigation files
- ❌ Refer to archived docs for current practices
- ❌ Ignore the [5-level-system.md](./docs/architecture/5-level-system.md) - it's critical
- ❌ Skip the [TESTING_GUIDELINES.md](./docs/testing/TESTING_GUIDELINES.md)
- ❌ Add docs to root - everything goes in `/docs` folder

---

## 🤝 Contributing

When you add new documentation:
1. **Save it in the right place** - Use the category structure
2. **Update the README.md** in that category
3. **Update [NAVIGATION.md](./docs/NAVIGATION.md)** - Add a link
4. **Add a brief description** - Help others find it
5. **Use consistent formatting** - Follow existing doc style

For guidelines, see [ORGANIZATION.md](./docs/ORGANIZATION.md).

---

## 🆘 Still Lost?

Try these in order:
1. **[NAVIGATION.md](./docs/NAVIGATION.md)** - Find by category
2. **[NEW_CONTRIBUTOR_PATH.md](./docs/getting-started/NEW_CONTRIBUTOR_PATH.md)** - Structured learning
3. **[troubleshooting/](./docs/troubleshooting/)** - Common issues
4. **[INDEX.md](./docs/INDEX.md)** - Quick nav hub
5. **[Copilot Instructions](./docs/../../.github/copilot-instructions.md)** - Ask for help

---

## 📚 Full Documentation Tree

See the complete documentation tree in [NAVIGATION.md](./docs/NAVIGATION.md).

---

**Last Updated**: December 2025  
**Next Task**: Go to [docs/getting-started/NEW_CONTRIBUTOR_PATH.md](./docs/getting-started/NEW_CONTRIBUTOR_PATH.md) to start learning! 🚀
