# Documentation Organization Plan

This document outlines the new documentation structure for CodeForge.

## 📁 New Structure

```
/docs/
├── README.md                          # Main docs index
├── PRD.md                            # Product Requirements Document
│
├── /architecture/                     # Architecture documentation
│   ├── DECLARATIVE_SYSTEM.md         # ⭐ Primary system docs
│   ├── ARCHITECTURE_VISUAL_GUIDE.md
│   ├── CONFIG_ARCHITECTURE.md
│   ├── JSON_ORCHESTRATION_COMPLETE.md
│   ├── JSON_ORCHESTRATION_GUIDE.md
│   └── /atomic/                      # Legacy atomic design docs
│       ├── ATOMIC_README.md
│       ├── ATOMIC_COMPONENTS.md
│       ├── ATOMIC_REFACTOR_SUMMARY.md
│       ├── ATOMIC_USAGE_EXAMPLES.md
│       ├── ATOMIC_VISUAL_OVERVIEW.md
│       ├── ATOMIC_DOCS_INDEX.md
│       └── COMPONENT_MAP.md
│
├── /api/                             # API and Hook references
│   ├── COMPLETE_HOOK_LIBRARY.md
│   ├── HOOK_LIBRARY_DOCS.md
│   └── HOOK_LIBRARY_REFERENCE.md
│
├── /guides/                          # User guides
│   ├── QUICK_REFERENCE.md
│   ├── QUICKSTART_HOOKS.md
│   ├── PWA_GUIDE.md
│   ├── CI_CD_GUIDE.md
│   ├── ERROR_REPAIR_GUIDE.md
│   ├── SEED_DATA_GUIDE.md
│   ├── PROPS_CONFIG_GUIDE.md
│   ├── MIGRATION_GUIDE.md
│   └── FAVICON_DESIGNER_ACCESS.md
│
├── /testing/                         # Testing documentation
│   ├── RUN_TESTS.md
│   ├── E2E_TEST_SUMMARY.md
│   ├── SMOKE_TEST_REPORT.md
│   ├── SMOKE_TEST_QUICK_REF.md
│   └── CONNECTION_TEST_PLAN.md
│
├── /deployment/                      # Deployment and operations
│   ├── CI_FIX_SUMMARY.md
│   └── BAD_GATEWAY_FIX.md
│
├── /history/                         # Development history
│   ├── REFACTORING_PLAN.md
│   ├── REFACTORING_LOG.md
│   ├── REFACTORING_SUMMARY.md
│   ├── REFACTORING_EXAMPLE.md
│   ├── REFACTOR_PHASE2.md
│   ├── REFACTOR_PHASE3.md
│   ├── PHASE2_REFACTORING_SUMMARY.md
│   ├── PHASE3_COMPLETE.md
│   ├── PHASE4_IMPLEMENTATION_COMPLETE.md
│   ├── REFACTOR_PHASE4_COMPLETE.md
│   └── DELIVERY_COMPLETE.md
│
└── /reference/                       # Reference materials
    ├── INDEX.md
    ├── EXAMPLE_NEW_PAGE.md
    ├── AGENTS.md
    ├── APP_STATUS.md
    ├── ROADMAP.md
    └── SECURITY.md
```

## 🔄 File Migrations

### From Root → docs/architecture/
- DECLARATIVE_SYSTEM.md
- ARCHITECTURE_VISUAL_GUIDE.md
- CONFIG_ARCHITECTURE.md
- JSON_ORCHESTRATION_COMPLETE.md
- JSON_ORCHESTRATION_GUIDE.md

### From Root → docs/architecture/atomic/
- ATOMIC_README.md
- ATOMIC_COMPONENTS.md
- ATOMIC_REFACTOR_SUMMARY.md
- ATOMIC_USAGE_EXAMPLES.md
- ATOMIC_VISUAL_OVERVIEW.md
- ATOMIC_DOCS_INDEX.md
- COMPONENT_MAP.md

### From Root → docs/api/
- COMPLETE_HOOK_LIBRARY.md
- HOOK_LIBRARY_DOCS.md
- HOOK_LIBRARY_REFERENCE.md

### From Root → docs/guides/
- QUICK_REFERENCE.md
- QUICKSTART_HOOKS.md
- PWA_GUIDE.md
- CI_CD_GUIDE.md
- ERROR_REPAIR_GUIDE.md
- SEED_DATA_GUIDE.md
- PROPS_CONFIG_GUIDE.md
- MIGRATION_GUIDE.md
- FAVICON_DESIGNER_ACCESS.md

### From Root → docs/testing/
- RUN_TESTS.md
- E2E_TEST_SUMMARY.md
- SMOKE_TEST_REPORT.md
- SMOKE_TEST_QUICK_REF.md
- CONNECTION_TEST_PLAN.md

### From Root → docs/deployment/
- CI_FIX_SUMMARY.md
- BAD_GATEWAY_FIX.md

### From Root → docs/history/
- REFACTORING_PLAN.md
- REFACTORING_LOG.md
- REFACTORING_SUMMARY.md
- REFACTORING_EXAMPLE.md
- REFACTOR_PHASE2.md
- REFACTOR_PHASE3.md
- PHASE2_REFACTORING_SUMMARY.md
- PHASE3_COMPLETE.md
- PHASE4_IMPLEMENTATION_COMPLETE.md
- REFACTOR_PHASE4_COMPLETE.md
- DELIVERY_COMPLETE.md

### From Root → docs/reference/
- INDEX.md
- EXAMPLE_NEW_PAGE.md
- AGENTS.md
- APP_STATUS.md
- ROADMAP.md
- SECURITY.md

### Stay in Root
- README.md (main project README - updated to point to docs/)
- LICENSE
- package.json
- etc. (all non-documentation files)

## ✅ Benefits

1. **Cleaner Root Directory** - Only essential project files in root
2. **Logical Grouping** - Related docs are together
3. **Easy Navigation** - Clear folder names indicate content type
4. **Scalable** - Easy to add new docs in appropriate categories
5. **Better Discoverability** - Index file guides users to right docs
6. **Maintains History** - All refactoring logs preserved in /history

## 📝 Next Steps

1. ✅ Create /docs folder structure
2. ✅ Create docs/README.md index
3. ✅ Move PRD.md to docs/
4. ⏳ Create subdirectories
5. ⏳ Move files to appropriate locations
6. ⏳ Update internal links in moved files
7. ⏳ Update main README.md to reference docs/
8. ⏳ Verify all links work
