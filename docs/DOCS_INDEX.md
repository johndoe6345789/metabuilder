# Documentation Index - Organized by Subsystem

**Last Updated**: 2026-01-23

This index organizes all documentation in `docs/` by subsystem for easier navigation.

---

## Directory Structure

```
docs/
├── core/                    # Core project docs, contracts, and policies
├── dbal/                    # Database Abstraction Layer (11 files)
├── workflow/                # Workflow Engine & Executor (27 files)
├── plugins/                 # Workflow Plugins (7 files)
├── n8n/                     # N8N Migration & Compliance (21 files)
├── gameengine/              # Game Engine (7 files)
├── packages/                # Feature Packages (56 files)
├── ui/                      # UI Components & Frontends (15 files)
├── analysis/                # Analysis & Status (23 files)
├── architecture/            # Architectural Docs (6 files)
├── archive/                 # Legacy & Archived (37 files)
├── guides/                  # Implementation Guides
├── implementation/          # Implementation Specifics
├── phases/                  # Phase-specific docs
├── plans/                   # Strategic Plans
├── testing/                 # Testing Documentation
└── workflow/                # Workflow Examples & Specs
```

---

## By Subsystem

### Core (11 files)
Core project documents, policies, and general guidance.

- **AGENTS.md** - Domain-specific rules and task guidance
- **CONTRACT.md** - Development contract and standards
- **CLAUDE.md** - Main AI Assistant guide (sync with root)
- **CODE_REVIEW_FINDINGS.md** - Code review standards
- **PROMPT.md** - System prompts and instructions
- **CI_CD_WORKFLOW_INTEGRATION.md** - CI/CD integration details
- **IMPLEMENTATION_VERIFICATION.md** - Verification checklist
- **EXECUTOR_VALIDATION_ERROR_HANDLING_SUMMARY.md** - Error handling specs
- **VARIABLES_ENHANCEMENT_SUMMARY.md** - Variable system enhancements
- **WEEK_2_IMPLEMENTATION_ROADMAP.md** - Implementation roadmap
- **PHASE3_WEEK4_DELIVERY_SUMMARY.md** - Delivery status
- **SMTP_RELAY_INTEGRATION.md** - SMTP integration guide

### DBAL (11 files)
Database Abstraction Layer documentation.

- **DBAL_ANALYSIS_SUMMARY.md** - Analysis summary
- **DBAL_ARCHITECTURE_ANALYSIS.md** - Architecture deep dive
- **DBAL_DOCUMENTATION_INDEX.md** - Documentation index
- **DBAL_INTEGRATION_GUIDE.md** - Integration guide
- **DBAL_QUICK_REFERENCE.md** - Quick reference
- **DBAL_WORKFLOW_DOCUMENTATION_INDEX.md** - Workflow integration index
- **DBAL_WORKFLOW_EXTENSION_SPECIFICATION.md** - Workflow extensions
- **DBAL_WORKFLOW_INTEGRATION_COMPLETE.md** - Integration completion status
- **DBAL_WORKFLOW_INTEGRATION_GUIDE.md** - Full integration guide
- **DBAL_WORKFLOW_QUICK_REFERENCE.md** - Workflow quick reference
- **DBAL_WORKFLOW_SPECIFICATION_SUMMARY.md** - Specification summary

### Workflow Engine (27 files)
Workflow executor, DAG engine, and related documentation.

- **WORKFLOW_DOCUMENTATION_INDEX.md** - Main documentation index
- **WORKFLOW_EXECUTOR_ANALYSIS.md** - Executor analysis
- **WORKFLOW_EXECUTOR_INDEX.md** - Executor documentation index
- **WORKFLOW_EXECUTOR_INTEGRATION_POINTS.md** - Integration points
- **WORKFLOW_EXECUTOR_QUICK_REFERENCE.md** - Quick reference
- **WORKFLOW_LOADERV2_IMPLEMENTATION.md** - LoaderV2 implementation
- **WORKFLOW_LOADERV2_INTEGRATION_GUIDE.md** - LoaderV2 integration
- **WORKFLOW_LOADERV2_INTEGRATION_PLAN.md** - LoaderV2 integration plan
- **WORKFLOW_LOADERV2_QUICK_REFERENCE.md** - LoaderV2 quick reference
- **WORKFLOW_LOADERV2_SUMMARY.txt** - LoaderV2 summary
- **WORKFLOW_ENDPOINTS_REFERENCE.md** - API endpoint reference
- **WORKFLOW_COMPLIANCE_README.md** - Compliance guide
- **WORKFLOW_COMPLIANCE_FIXER_GUIDE.md** - Fixing compliance issues
- **WORKFLOW_COMPLIANCE_IMPLEMENTATION.md** - Compliance implementation
- **WORKFLOW_VALIDATION_CHECKLIST.md** - Validation checklist
- **WORKFLOW_INVENTORY.md** - Workflow inventory
- **WORKFLOW_API_INTEGRATION_UPDATES.md** - API integration updates
- **WORKFLOW_SERVICE_ANALYSIS_SUMMARY.md** - Service analysis
- **WORKFLOW_UPDATE_SUMMARY.txt** - Update summary
- **WORKFLOW_PLUGINS_ARCHITECTURE.md** - Plugin architecture
- **WORKFLOW_PLUGINS_COMPLETION_SUMMARY.md** - Plugin completion
- **DAG_EXECUTOR_DOCUMENTATION_INDEX.md** - DAG executor index
- **DAG_EXECUTOR_N8N_INTEGRATION_ANALYSIS.md** - N8N integration analysis
- **DAG_EXECUTOR_QUICK_START.md** - Quick start guide
- **DAG_EXECUTOR_TECHNICAL_REFERENCE.md** - Technical reference
- **SUBPROJECT_WORKFLOW_UPDATE_GUIDE.md** - Subproject workflow guide

### Plugins (7 files)
Workflow plugin system documentation.

- **PLUGIN_REGISTRY_START_HERE.md** - Starting point
- **PLUGIN_REGISTRY_INDEX.md** - Plugin index
- **PLUGIN_REGISTRY_IMPLEMENTATION_PLAN.md** - Implementation plan
- **PLUGIN_REGISTRY_CODE_TEMPLATES.md** - Code templates
- **PLUGIN_REGISTRY_QUICK_START.md** - Quick start
- **PLUGIN_REGISTRY_SUMMARY.md** - Summary
- **PLUGIN_INITIALIZATION_GUIDE.md** - Initialization guide

### N8N Migration (21 files)
N8N compliance and migration documentation.

- **N8N_MIGRATION_STATUS.md** - Migration status
- **N8N_INTEGRATION_COMPLETE.md** - Integration completion
- **N8N_COMPLIANCE_AUDIT.md** - Compliance audit
- **N8N_COMPLIANCE_AUDIT_INDEX.md** - Audit index
- **N8N_COMPLIANCE_AUDIT_USER_MANAGER.md** - User manager audit
- **N8N_COMPLIANCE_ANALYSIS_2026-01-22.md** - Compliance analysis
- **N8N_COMPLIANCE_QUICK_FIX.md** - Quick fix guide
- **N8N_COMPLIANCE_FIX_CHECKLIST.md** - Fix checklist
- **N8N_VARIABLES_GUIDE.md** - Variables guide
- **N8N_SCHEMA_GAPS.md** - Schema gaps analysis
- **N8N_PHASE3_WEEK1_COMPLETE.md** - Phase 3 Week 1 status
- **N8N_PHASE3_WEEK3_EXECUTIVE_SUMMARY.md** - Phase 3 Week 3 summary
- **N8N_PHASE3_WEEKS_1_3_COMPLETE.md** - Phase 3 completion
- **N8N_AUDIT_LOG_COMPLIANCE.md** - Audit log compliance
- **N8N_GAMEENGINE_COMPLIANCE_AUDIT.md** - GameEngine compliance
- **N8N_COMPLIANCE_GAMEENGINE_INDEX.md** - GameEngine compliance index
- **N8N_GAMEENGINE_ASSETS_AUDIT.md** - GameEngine assets audit
- **N8N_GAMEENGINE_ASSETS_COMPLIANCE_SUMMARY.md** - Assets compliance summary
- **N8N_MATERIALX_COMPLIANCE_AUDIT.md** - MaterialX compliance
- **N8N_MATERIALX_QUICK_REFERENCE.md** - MaterialX quick reference
- **N8N_MATERIALX_COMPLIANCE_SUMMARY.json** - MaterialX compliance summary

### GameEngine (7 files)
Game engine documentation.

- **GAMEENGINE_PACKAGES_COMPREHENSIVE_AUDIT.md** - Comprehensive audit
- **GAMEENGINE_PACKAGES_QUICK_REFERENCE.md** - Quick reference
- **GAMEENGINE_GUI_N8N_COMPLIANCE_AUDIT.md** - GUI compliance audit
- **GAMEENGINE_SEED_WORKFLOW_N8N_AUDIT.md** - Seed workflow audit
- **QUAKE3_WORKFLOW_COMPLIANCE_AUDIT.md** - Quake3 compliance
- **SOUNDBOARD_WORKFLOW_COMPLIANCE_AUDIT.md** - Soundboard compliance
- **ENGINE_TESTER_N8N_COMPLIANCE_AUDIT.md** - Engine tester compliance

### Packages (56 files)
Documentation for 62 feature packages in the system.

#### Forum Forge (4 files)
- FORUM_FORGE_N8N_COMPLIANCE_REPORT.md
- FORUM_FORGE_WORKFLOW_UPDATE_PLAN.md
- + 2 files in analysis/

#### IRC Webchat (5 files)
- IRC_WEBCHAT_DOCUMENTATION_INDEX.md
- IRC_WEBCHAT_N8N_COMPLIANCE_AUDIT.md
- IRC_WEBCHAT_QUICK_REFERENCE.md
- IRC_WEBCHAT_SCHEMA_UPDATES.md
- IRC_WEBCHAT_WORKFLOW_UPDATE_PLAN.md

#### Media Center (4 files)
- MEDIA_CENTER_DOCUMENTATION_INDEX.md
- MEDIA_CENTER_IMPLEMENTATION_CHECKLIST.md
- MEDIA_CENTER_SCHEMA_MIGRATION_GUIDE.md
- MEDIA_CENTER_WORKFLOW_UPDATE_PLAN.md

#### Notification Center (3 files)
- NOTIFICATION_CENTER_COMPLIANCE_AUDIT.md
- NOTIFICATION_CENTER_WORKFLOW_UPDATE_PLAN.md
- + 1 file in analysis/

#### Stream Cast (7 files)
- STREAM_CAST_AUDIT_INDEX.md
- STREAM_CAST_N8N_COMPLIANCE_AUDIT.md
- STREAM_CAST_TECHNICAL_ISSUES.md
- STREAM_CAST_WORKFLOW_INDEX.md
- STREAM_CAST_WORKFLOW_QUICK_REFERENCE.md
- STREAM_CAST_WORKFLOW_README.md
- STREAM_CAST_WORKFLOW_TECHNICAL_DETAILS.md
- STREAM_CAST_WORKFLOW_UPDATE_PLAN.md

#### Audit Log (1 file)
- AUDIT_LOG_WORKFLOW_UPDATE_PLAN.md

#### User Manager (4 files)
- USER_MANAGER_DELIVERABLES_SUMMARY.md
- USER_MANAGER_IMPLEMENTATION_CHECKLIST.md
- USER_MANAGER_QUICK_REFERENCE.md
- USER_MANAGER_WORKFLOW_UPDATE_PLAN.md

#### PackageRepo (3 files)
- PACKAGEREPO_AUDIT_INDEX.md
- PACKAGEREPO_ISSUES_MATRIX.md
- PACKAGEREPO_WORKFLOW_COMPLIANCE.md

#### Dashboard (5 files)
- DASHBOARD_WORKFLOW_COMPLIANCE_AUDIT.md
- DASHBOARD_WORKFLOW_IMPLEMENTATION.md
- DASHBOARD_WORKFLOW_QUICK_REFERENCE.md
- DASHBOARD_WORKFLOW_README.md
- DASHBOARD_WORKFLOW_UPDATE_PLAN.md

#### Data Table (5 files)
- DATA_TABLE_N8N_COMPLIANCE_AUDIT.md
- DATA_TABLE_WORKFLOW_IMPLEMENTATION_GUIDE.md
- DATA_TABLE_WORKFLOW_JSON_EXAMPLES.md
- DATA_TABLE_WORKFLOW_UPDATE_PLAN.md
- DATA_TABLE_WORKFLOW_VALIDATION_CHECKLIST.md

### UI Components & Frontends (15 files)
UI and frontend-related documentation.

- **UI_AUTH_WORKFLOWS_INDEX.md** - Auth workflows index
- **UI_AUTH_WORKFLOW_QUICK_REFERENCE.md** - Auth quick reference
- **UI_AUTH_WORKFLOW_UPDATE_PLAN.md** - Auth update plan
- **UI_AUTH_VALIDATION_TEMPLATE.md** - Auth validation template
- **UI_SCHEMA_EDITOR_WORKFLOWS_INDEX.md** - Schema editor index
- **UI_SCHEMA_EDITOR_WORKFLOWS_SUMMARY.md** - Schema editor summary
- **UI_SCHEMA_EDITOR_WORKFLOW_CHECKLIST.md** - Schema editor checklist
- **UI_SCHEMA_EDITOR_WORKFLOW_UPDATE_PLAN.md** - Schema editor update plan
- **UI_JSON_SCRIPT_EDITOR_N8N_COMPLIANCE_AUDIT.md** - JSON script editor audit
- **UI_SCHEMA_EDITOR_N8N_COMPLIANCE_REPORT.md** - Schema editor compliance
- **UI_WORKFLOW_EDITOR_UPDATE_PLAN.md** - Workflow editor update plan
- **UI_DATABASE_MANAGER_WORKFLOWS_QUICK_REFERENCE.md** - Database manager quick ref
- **UI_DATABASE_MANAGER_WORKFLOWS_UPDATE_PLAN.md** - Database manager update plan
- **NEXTJS_WORKFLOW_SERVICE_MAP.md** - Next.js workflow service map
- **FRONTEND_WORKFLOW_SERVICE_IMPLEMENTATION.md** - Frontend workflow service

### Analysis (23 files)
Project status, analysis, and assessments.

Located in `docs/analysis/` - includes:
- System health assessments
- Competitive analysis
- Migration status reports
- Executive summaries
- Functional priorities

### Architecture (6 files)
Architectural documentation and system design.

Located in `docs/architecture/` - includes:
- System architecture
- Component architecture
- Universal platform design
- DBAL refactoring plans

### Archive (37 files)
Legacy and archived documentation.

Located in `docs/archive/` - includes:
- Historical implementation summaries
- Deprecated approaches
- Legacy system documentation
- Recovery and consolidation guides

### Guides, Implementation, Phases, Plans, Testing, Workflow
Existing subdirectories with specialized documentation.

---

## Quick Links

**Start Here**: [AGENTS.md](./core/AGENTS.md) - Domain-specific rules

**For Developers**:
- [DBAL Integration](./dbal/DBAL_INTEGRATION_GUIDE.md)
- [Workflow Engine](./workflow/WORKFLOW_DOCUMENTATION_INDEX.md)
- [Plugin System](./plugins/PLUGIN_REGISTRY_START_HERE.md)

**For Package Maintainers**:
- [Packages Overview](./packages/)
- [Package Implementation Guides](./guides/)

**For Operations**:
- [Architecture Overview](./architecture/ARCHITECTURE.md)
- [Compliance Documentation](./n8n/)

**Project Status**:
- [Analysis & Status](./analysis/METABUILDER_STATUS_2026-01-21.md)
- [Roadmap](./ROADMAP.md)

---

## Statistics

- **Total Files**: ~155 markdown documents
- **Subsystems Documented**: 8 major systems
- **Organized By**: Subsystem/module
- **Last Reorganized**: 2026-01-23
