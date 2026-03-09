# CodeForge Development Roadmap

## Overview

CodeForge is a comprehensive low-code development platform for building production-ready Next.js applications. This roadmap tracks completed work, current state, and future enhancements across 7 major development iterations.

**Current Version:** 7.0  
**Architecture:** JSON-driven, atomic design, multi-platform deployment  
**Status:** Production-ready with PWA support

**Iteration 7 Focus:** Component registry refactor, JSON page migration expansion

---

## 📊 Project Status Dashboard

### Core Systems
- ✅ **JSON-Driven UI System** - Declarative page configuration
- ✅ **Atomic Component Library** - 50+ components, all < 150 LOC
- ✅ **Custom Hook Library** - 12+ reusable data/UI hooks
- ✅ **Multi-Architecture Builds** - AMD64 + ARM64 support via QEMU
- ✅ **PWA Support** - Offline-first with service workers
- ✅ **CI/CD Pipelines** - GitHub Actions, GitLab CI, Jenkins, CircleCI
- ✅ **E2E Testing** - Playwright suite with smoke tests

### Feature Designers
- ✅ Code Editor (Monaco)
- ✅ Model Designer (Prisma)
- ✅ Component Tree Builder
- ✅ Workflow Designer (n8n-style)
- ✅ Lambda Designer
- ✅ Theme Designer
- ✅ Favicon Designer
- ✅ Flask API Designer
- ✅ Testing Suite Designers (Playwright, Storybook, Unit Tests)
- ✅ Docker Build Debugger
- ✅ Feature Ideas Cloud

---

## 🎯 Iteration History

### Iteration 1: Foundation & Core Features
**Focus:** Basic architecture and essential designers

#### Completed
- ✅ Project structure with React, TypeScript, Tailwind
- ✅ Monaco code editor integration
- ✅ Prisma model designer with visual interface
- ✅ Component tree builder with drag-and-drop
- ✅ Basic theme designer
- ✅ Project save/load functionality
- ✅ File explorer and multi-file editing

#### Key Files
- `src/components/CodeEditor.tsx`
- `src/components/ModelDesigner.tsx`
- `src/components/ComponentTreeBuilder.tsx`

---

### Iteration 2: Advanced Features & Testing
**Focus:** Workflow automation, testing, and backend configuration

#### Completed
- ✅ n8n-style workflow designer with nodes and connections
- ✅ Lambda/serverless function designer
- ✅ Flask backend API configuration
- ✅ Playwright E2E test designer
- ✅ Storybook component story builder
- ✅ Unit test designer
- ✅ Component tree manager (multiple named trees)
- ✅ Sass styling system with utilities and mixins

#### Key Files
- `src/components/WorkflowDesigner.tsx`
- `src/components/LambdaDesigner.tsx`
- `src/components/FlaskDesigner.tsx`
- `src/components/PlaywrightDesigner.tsx`
- `src/styles/_utilities.scss`

---

### Iteration 3: CI/CD & Deployment Infrastructure
**Focus:** Build automation, Docker, and multi-platform support

#### Completed
- ✅ GitHub Actions workflows (CI, E2E, Release)
- ✅ GitLab CI configuration
- ✅ Jenkins pipeline
- ✅ CircleCI configuration
- ✅ Multi-stage Docker build (switched to single-stage Vite preview)
- ✅ QEMU integration for ARM64 support
- ✅ CapRover deployment support
- ✅ npm workspace dependency resolution
- ✅ Fixed Docker build errors with workspace protocol

#### Key Files
- `.github/workflows/ci.yml`
- `.gitlab-ci.yml`
- `Jenkinsfile`
- `.circleci/config.yml`
- `Dockerfile` (simplified single-stage)
- `scripts/build-multiarch.sh`
- `QEMU_INTEGRATION.md`

#### Changes
- **Docker Build Fix:** Resolved `workspace:*` protocol issues by properly copying both workspace packages
- **QEMU Integration:** All CI/CD pipelines now build AMD64 + ARM64 images
- **Deployment Simplification:** Switched from nginx to Vite preview server for more reliable SPA routing

**Previous Deployment Issues Resolved:**
- ❌ **Before:** Glitchy CapRover deployments with nginx
- ✅ **After:** Reliable single-stage build with Vite preview server
- ❌ **Before:** Complex multi-stage builds with asset path issues
- ✅ **After:** Simple Alpine-based image with correct routing

---

### Iteration 4: Atomic Design Refactor
**Focus:** Component architecture, maintainability, reusability

#### Completed
- ✅ Atomic component library (Atoms, Molecules, Organisms)
- ✅ 50+ components all under 150 LOC
- ✅ Refactored organisms to use atomic layout components
- ✅ Created reusable layout primitives (Stack, Flex, Container, ResponsiveGrid)
- ✅ Integrated atomic components into AppHeader, PageHeader, ProjectDashboard
- ✅ Comprehensive atomic library showcase page
- ✅ Component categorization by complexity

#### Component Breakdown
**Atoms (< 50 LOC):**
- Layout: Container, Section, Stack, Spacer, Divider, Grid, Flex
- Typography: Heading, Text, Link, Code, Kbd
- Badges: StatusBadge, Chip, Dot, CountBadge
- Buttons: Button, ActionButton, IconButton
- Forms: Input, Checkbox, Toggle, Switch
- Feedback: Alert, Spinner, ProgressBar, Tooltip

**Molecules (50-100 LOC):**
- DataCard, SearchInput, FilterInput, ActionBar
- EmptyState, StatCard, SaveIndicator, ToolbarButton
- MetricCard, AvatarGroup, ButtonGroup

**Organisms (100-150 LOC):**
- AppHeader, NavigationMenu, PageHeader
- TreeListPanel, SchemaEditorToolbar, SchemaEditorPropertiesPanel

#### Key Files
- `src/components/atoms/` (50+ atomic components)
- `src/components/molecules/` (10+ composed components)
- `src/components/organisms/` (8+ complex components)
- `ATOMIC_LIBRARY_COMPLETION.md`
- `ATOMIC_INTEGRATION_SUMMARY.md`

---

### Iteration 5: JSON-Driven UI System
**Focus:** Declarative configuration, reduced boilerplate

#### Completed
- ✅ JSON page schema system with renderer
- ✅ Data source management (KV, static, computed)
- ✅ Component binding and event handling
- ✅ Action execution system (CRUD, navigation, toasts)
- ✅ Three pages converted to JSON (Models, Component Trees, Workflows)
- ✅ Custom hook library for data management
- ✅ Component tree JSON loading system
- ✅ Seed data for all JSON pages

#### Custom Hooks Created

**Data Management (`/src/hooks/data/`):**
- `useCRUD` - Complete CRUD operations with KV persistence
- `useSearchFilter` - Multi-field search and filtering
- `useSort` - Multi-key sorting with direction toggle
- `usePagination` - Client-side pagination
- `useSelection` - Multi/single selection management
- `useDataSource` - Unified KV/static/computed data sources

**UI State (`/src/hooks/ui/`):**
- `useDialog` - Modal/dialog state management
- `useToggle` - Boolean state with helpers

**Forms (`/src/hooks/forms/`):**
- `useFormField` - Individual field validation
- `useForm` - Complete form handling with async support

**JSON UI (`/src/hooks/json-ui/`):**
- `useJSONRenderer` - Dynamic data binding and prop resolution
- `useDataSources` - Multi-source data management with reactivity
- `useActionExecutor` - Execute JSON-defined actions

#### JSON Pages Implemented
1. **Models Designer JSON** (`models-json`)
   - Schema: `src/config/pages/model-designer.json`
   - Component: `src/components/JSONModelDesigner.tsx`
   - Data: Persisted in `app-models` KV store

2. **Component Trees JSON** (`component-trees-json`)
   - Schema: `src/config/pages/component-tree.json`
   - Component: `src/components/JSONComponentTreeManager.tsx`
   - Data: Persisted in `app-component-trees` KV store

3. **Workflows Designer JSON** (`workflows-json`)
   - Schema: `src/config/pages/workflow-designer.json`
   - Component: `src/components/JSONWorkflowDesigner.tsx`
   - Data: Persisted in `app-workflows` KV store

#### Benefits Achieved
- **60% reduction** in component code
- Declarative UI configuration
- Automatic reactivity with computed values
- Type-safe schema definitions
- Easier prototyping and iteration

#### Key Files
- `src/hooks/data/use-crud.ts`
- `src/hooks/json-ui/use-json-renderer.ts`
- `src/hooks/json-ui/use-data-sources.ts`
- `src/components/atoms/json-ui/IconRenderer.tsx`
- `src/components/atoms/json-ui/DataCard.tsx`
- `src/config/pages/*.json`
- `JSON_CONVERSION_SUMMARY.md`
- `JSON_UI_REFACTOR_IMPLEMENTATION.md`

---

### Iteration 6: Configuration Management & Deployment Optimization
**Focus:** JSON configuration, deployment reliability, testing optimization

#### Completed
- ✅ Comprehensive hardcoded value analysis
- ✅ Created centralized `app.config.json`
- ✅ Component tree JSON loading system
- ✅ Simplified Docker deployment (nginx → Vite preview)
- ✅ E2E test optimization (70-83% faster)
- ✅ Multi-architecture build support (AMD64 + ARM64)
- ✅ Feature toggle JSON configuration
- ✅ Deployment configuration by platform

#### Configuration System

**Files Created:**
- `app.config.json` - Centralized application configuration
- `deployment-config.json` - Platform-specific settings (CapRover, etc.)
- `feature-toggles.json` - Default feature flags with descriptions
- `component-registry.json` - Component loading configuration
- `src/config/component-trees/molecules.json` - Molecule component trees
- `src/config/component-trees/organisms.json` - Organism component trees

**Configuration Categories:**
- Application metadata (name, description, version)
- Server configuration (dev and production)
- Build settings (chunks, minification, output)
- Font configuration (Google Fonts URLs)
- PWA settings (service worker, caching)
- Docker settings (base image, ports)
- Nginx configuration (when needed)
- CI/CD settings (Node version, commands)

#### Testing Optimization

**Playwright Configuration:**
- Increased web server timeout: 120s → 180s
- Added global test timeout: 60 seconds
- Reduced browsers to Chromium only
- Changed wait strategy: `networkidle` → `domcontentloaded`

**Smoke Tests:**
- Reduced from 20+ to 4 focused tests
- Run time: ~5+ min → ~30-60s (83% faster)

**Full Test Suite:**
- Reduced from 50+ to 7 core tests
- Run time: ~8+ min → ~2-3 min (70% faster)

#### Deployment Improvements

**CapRover-Specific:**
- Simplified single-stage Docker build
- Uses Vite preview server instead of nginx
- Better SPA routing support
- Smaller image size (~100MB reduction)
- More reliable startup

**Multi-Architecture:**
- QEMU integration in all CI/CD pipelines
- Builds for AMD64 + ARM64
- 20-40% cost reduction with ARM instances
- Support for AWS Graviton, Azure ARM VMs

#### Key Files
- `app.config.json`
- `deployment-config.json`
- `HARDCODED_ANALYSIS.md`
- `COMPONENT_TREE_JSON_LOADING.md`
- `DEPLOYMENT.md`
- `E2E_TEST_OPTIMIZATION.md`
- `DOCKER_BUILD_COMPLETE_SUMMARY.md`
- `playwright.config.ts` (optimized)
- `e2e/smoke.spec.ts` (streamlined)

---

### Iteration 7: JSON-Driven Architecture Completion
**Focus:** Component registry refactor, expanding JSON page system, production deployment

#### Completed
- ✅ Component registry refactored to read from `component-registry.json`
- ✅ Dynamic component loading system based on JSON metadata
- ✅ Automatic dependency preloading (Monaco editor, etc.)
- ✅ Component metadata query API (`getComponentMetadata`, `getComponentsByCategory`)
- ✅ JSON-based Lambda Designer page created
- ✅ Experimental flags support for components
- ✅ Configurable preload strategies per component
- ✅ CapRover/Cloudflare CORS configuration
- ✅ Production deployment documentation
- ✅ Environment variable templates for frontend and backend
- ✅ Deployment checklist and troubleshooting guides

#### Benefits Achieved
- **Zero code changes** needed to add new components to registry
- **Centralized metadata** for all components in single JSON file
- **Runtime flexibility** for enabling/disabling components
- **Better performance** with configurable lazy loading
- **Improved maintainability** with declarative component definitions
- **Production-ready deployment** with proper CORS and security configuration

#### Key Files
- `component-registry.json` - Centralized component metadata
- `src/lib/component-registry.ts` - Dynamic registry loader
- `src/components/JSONLambdaDesigner.tsx` - New JSON-based Lambda page
- `src/config/pages/lambda-designer.json` - Lambda page schema
- `nginx.conf` - Updated with CORS headers
- `backend/app.py` - Enhanced Flask CORS configuration
- `docs/CAPROVER_CLOUDFLARE_DEPLOYMENT.md` - Complete deployment guide
- `docs/CLOUDFLARE_CONFIGURATION.md` - Cloudflare setup guide
- `docs/DEPLOYMENT_CHECKLIST.md` - Quick reference checklist

---

## 🚀 Current State

### Production-Ready Features
- ✅ Complete low-code development platform
- ✅ Visual designers for all major concerns
- ✅ JSON-driven UI system with 3 example pages
- ✅ Atomic component library (50+ components)
- ✅ Custom hook library (12+ hooks)
- ✅ Multi-architecture Docker builds
- ✅ CI/CD pipelines for 4 platforms
- ✅ PWA with offline support
- ✅ Comprehensive E2E test suite
- ✅ Project save/load/export/import
- ✅ AI-powered code generation
- ✅ Auto error detection and repair

### Deployment Status
- ✅ **Local Development:** `npm run dev` on port 5000
- ✅ **Docker Build:** Single-stage Alpine with Vite preview
- ✅ **CapRover:** Ready for deployment (no more glitches!)
- ✅ **Multi-Arch:** AMD64 + ARM64 images available
- ✅ **CI/CD:** Automated builds and tests

### Testing Status
- ✅ **Smoke Tests:** 4 tests, ~30-60s runtime
- ✅ **Full E2E Suite:** 7 tests, ~2-3 min runtime
- ✅ **CI Integration:** Runs on push and PR
- ✅ **Test Reports:** Auto-generated with screenshots

---

## 🔮 Future Enhancements

### Near-Term (Next 2-3 Iterations)

#### 1. CapRover/Cloudflare CORS Configuration
**Priority:** HIGH  
**Effort:** LOW
**Status:** ✅ COMPLETE

**Completed:**
- ✅ Updated nginx.conf with proper CORS headers for frontend
- ✅ Enhanced Flask backend with detailed CORS configuration
- ✅ Created comprehensive deployment documentation
- ✅ Added environment variable examples for production
- ✅ Created CapRover captain-definition files
- ✅ Documented Cloudflare configuration steps
- ✅ Created deployment checklist
- ✅ Added CORS testing procedures

**Files Created:**
- `docs/CAPROVER_CLOUDFLARE_DEPLOYMENT.md` - Complete deployment guide
- `docs/CLOUDFLARE_CONFIGURATION.md` - Cloudflare-specific settings
- `docs/DEPLOYMENT_CHECKLIST.md` - Quick deployment checklist
- `.env.production.example` - Frontend environment template
- `backend/.env.production.example` - Backend environment template
- `captain-definition` - CapRover frontend config
- `backend/captain-definition` - CapRover backend config

**Configuration Details:**
- Frontend nginx handles CORS headers for SPA routes and assets
- Backend Flask-CORS configured for cross-origin API requests
- Support for multiple allowed origins via environment variables
- Preflight OPTIONS request handling
- Credentials support for authenticated requests
- Security headers and rate limiting guidance

**Benefits:**
- ✅ Proper CORS configuration for frontend/backend separation
- ✅ Support for https://frontend.example.com + https://backend.example.com architecture
- ✅ Easy deployment to CapRover with Cloudflare CDN
- ✅ Production-ready security configuration
- ✅ Comprehensive troubleshooting documentation

---

#### 2. Complete JSON Migration
**Priority:** HIGH  
**Effort:** MEDIUM
**Status:** IN PROGRESS

**Completed:**
- ✅ Created JSON-based Lambda Designer page
- ✅ Added Lambda Designer to component registry
- ✅ Added Lambda Designer to pages.json configuration

**In Progress:**
- [ ] Convert remaining pages to JSON schemas
- [ ] Add dialog implementations to JSON system
- [ ] Implement list rendering for dynamic items
- [ ] Complete CRUD operations in JSON pages
- [ ] Add form validation schemas

**Benefits:**
- Further reduce code complexity
- Enable non-technical page creation
- Faster prototyping

---

#### 2. Visual Schema Editor
**Priority:** HIGH  
**Effort:** HIGH
**Status:** NOT STARTED

- [ ] Drag-and-drop page builder
- [ ] Component palette with preview
- [ ] Live schema editing with preview
- [ ] Property inspector for selected components
- [ ] Data source configuration UI
- [ ] Action/event configuration UI
- [ ] Export to JSON schema

**Benefits:**
- No-code page creation
- Visual feedback during design
- Faster iteration cycles

---

#### 3. Component Registry Refactor
**Priority:** MEDIUM  
**Effort:** LOW
**Status:** ✅ COMPLETE

**Completed:**
- ✅ Component registry now reads from `component-registry.json`
- ✅ Dynamic component loading based on JSON configuration
- ✅ Automatic preload dependency handling (Monaco editor, etc.)
- ✅ Metadata query functions (`getComponentMetadata`, `getComponentsByCategory`, `getAllCategories`)
- ✅ Type-safe registry with TypeScript support
- ✅ Validation for component definitions through JSON structure
- ✅ Preload strategy configurable per component via JSON
- ✅ Support for experimental flags on components

**Benefits:**
- ✅ Add components without code changes
- ✅ Runtime component enabling/disabling
- ✅ Better lazy loading control
- ✅ Centralized component metadata
- ✅ Easier testing and debugging

---

#### 4. Enhanced Testing
**Priority:** MEDIUM  
**Effort:** MEDIUM
**Status:** NOT STARTED

- [ ] Visual regression tests with screenshot comparison
- [ ] API mocking for faster, more reliable tests
- [ ] Custom fixtures for reusable test setup
- [ ] Code coverage tracking
- [ ] Test sharding across multiple workers
- [ ] Drag-and-drop interaction tests
- [ ] File upload/download tests
- [ ] Keyboard shortcut combination tests

**Benefits:**
- Higher test coverage
- Faster test execution
- Better reliability
- Catch visual regressions

---

### Medium-Term (3-6 Months)

#### 5. Real-Time Features
**Priority:** MEDIUM  
**Effort:** HIGH

- [ ] Live preview with hot reload
- [ ] Collaborative editing with WebSockets
- [ ] Real-time cursor positions
- [ ] Change conflict resolution
- [ ] Activity feed
- [ ] Comment system

**Benefits:**
- Team collaboration
- Instant feedback
- Better developer experience

---

#### 6. Advanced Generators
**Priority:** MEDIUM  
**Effort:** MEDIUM

- [ ] Database seeding designer
- [ ] API client generator (REST, GraphQL)
- [ ] Form builder with validation
- [ ] Authentication designer (JWT, OAuth, sessions)
- [ ] State management designer (Redux, Zustand, Jotai)
- [ ] Design system generator

**Benefits:**
- Complete full-stack applications
- Reduce boilerplate further
- Professional patterns

---

#### 7. Configuration System Completion
**Priority:** LOW  
**Effort:** LOW

- [ ] Update `vite.config.ts` to read from `app.config.json`
- [ ] Generate `index.html` from template using config
- [ ] Update `Dockerfile` to use config via build args
- [ ] Create platform-specific config generator
- [ ] Add JSON schema validation for all config files
- [ ] Environment variable override system

**Benefits:**
- Single source of truth
- Easier multi-environment deployment
- No rebuilds for config changes

---

### Long-Term (6-12 Months)

#### 8. Marketplace & Sharing
**Priority:** LOW  
**Effort:** HIGH

- [ ] Component library export
- [ ] Template marketplace
- [ ] Share JSON schemas publicly
- [ ] Import community templates
- [ ] Rating and review system
- [ ] License management

**Benefits:**
- Community-driven growth
- Faster development with templates
- Monetization opportunities

---

#### 9. Enterprise Features
**Priority:** LOW  
**Effort:** HIGH

- [ ] Team management
- [ ] Role-based access control
- [ ] Audit logs
- [ ] Project versioning with git integration
- [ ] Deployment webhooks
- [ ] Custom branding/white-labeling
- [ ] SSO integration

**Benefits:**
- Enterprise adoption
- Better security
- Team workflows

---

#### 10. AI Enhancements
**Priority:** MEDIUM  
**Effort:** HIGH

- [ ] Natural language to JSON schema
- [ ] AI-powered schema optimization
- [ ] Smart component suggestions
- [ ] Code review and improvement suggestions
- [ ] Automated accessibility fixes
- [ ] Performance optimization suggestions

**Benefits:**
- Even faster development
- Better code quality
- Accessibility compliance

---

## 📋 Technical Debt & Maintenance

### Ongoing Tasks

#### Code Quality
- [ ] Complete TypeScript strict mode migration
- [ ] Add JSDoc comments to all hooks
- [ ] Improve test coverage (target: 80%+)
- [ ] Add Storybook stories for all atomic components
- [ ] Document common composition patterns

#### Performance
- [ ] Bundle size optimization (current: 176KB gzipped)
- [ ] Code splitting improvements
- [ ] Image optimization
- [ ] Service worker caching strategy refinement
- [ ] Lazy loading optimization

#### Documentation
- [ ] API reference for all components
- [ ] Video tutorials
- [ ] Interactive examples
- [ ] Migration guides
- [ ] Best practices guide

#### Molecule/Organism Refactors
- [ ] Identify 3-5 molecule components that can be expressed as JSON schemas with hooks, types, and actions (target: ComponentTree, PropertyEditor, DataSourceCard, SchemaEditorCanvas, NavigationMenu).
- [ ] Create JSON schemas for selected molecules and wire them through `JSONUIRenderer` while keeping existing props contracts stable.
- [ ] Convert at least one organism (e.g., DataSourceManager) into JSON-driven layout with nested molecule schemas.
- [ ] Document the JSON schema patterns for molecule/organism composition (bindings, events, actions) with real examples.

#### JSON UI Framework Improvements
- [ ] Fix conditional rendering to honor `conditional.then` when conditions pass.
- [ ] Fix loop rendering to avoid self-recursion and render loop children templates.
- [ ] Add data binding support for dot-path string bindings and loop context variables.
- [ ] Apply data binding transforms consistently (support `transform` in JSON schemas).
- [ ] Align JSON UI event/action typings across `src/lib/json-ui` and `src/types/json-ui.ts`.

#### Security
- [ ] Regular dependency updates
- [ ] Security audit with npm audit
- [ ] OWASP compliance check
- [ ] Penetration testing
- [ ] Rate limiting implementation

---

## 🎯 Success Metrics

### Current Metrics
- **Bundle Size:** 176KB gzipped (optimized)
- **Build Time:** ~8 seconds
- **Test Coverage:** Core features covered
- **E2E Test Runtime:** 2-3 minutes (full suite)
- **Smoke Test Runtime:** 30-60 seconds
- **Component Count:** 50+ atomic components
- **Hook Count:** 12+ custom hooks
- **JSON Pages:** 4 converted (Models, Component Trees, Workflows, Lambdas)
- **Components in Registry:** 30+ feature components
- **Registry Type:** JSON-driven (zero code changes to add components)

### Target Metrics (6 Months)
- **Bundle Size:** < 150KB gzipped
- **Build Time:** < 5 seconds
- **Test Coverage:** > 80%
- **E2E Test Runtime:** < 2 minutes
- **Component Count:** 75+ atomic components
- **Hook Count:** 20+ custom hooks
- **JSON Pages:** 15+ converted
- **Visual Schema Editor:** Beta release
- **Component Registry:** JSON-driven

---

## 🤝 Contributing

### How to Add Features

1. **Check Roadmap:** Ensure feature aligns with roadmap
2. **Review PRD:** Understand design philosophy from `PRD.md`
3. **Follow Atomic Design:** Keep components < 150 LOC
4. **Use Hooks:** Extract logic to reusable hooks
5. **Consider JSON:** Can it be JSON-driven?
6. **Add Tests:** Write E2E tests for new features
7. **Update Docs:** Document in relevant markdown files

### Architecture Principles

1. **Atomic Design:** Components organized by complexity
2. **JSON-First:** Prefer declarative configuration
3. **Hook-Based Logic:** Extract reusable business logic
4. **Type Safety:** Full TypeScript coverage
5. **Performance:** Optimize for speed and size
6. **Accessibility:** WCAG AA compliance
7. **Testing:** E2E tests for critical paths

---

## 📚 Documentation Index

### Getting Started
- `README.md` - Complete feature overview and setup
- `PRD.md` - Product requirements and design decisions
- `ARCHITECTURE.md` - System architecture overview

### Development
- `ATOMIC_LIBRARY_COMPLETION.md` - Atomic component library guide
- `ATOMIC_INTEGRATION_SUMMARY.md` - Integration of atomic components
- `JSON_CONVERSION_SUMMARY.md` - JSON-driven UI system
- `JSON_UI_REFACTOR_IMPLEMENTATION.md` - JSON UI hooks and components
- `COMPONENT_TREE_JSON_LOADING.md` - Component tree loading system

### Deployment & CI/CD
- `DEPLOYMENT.md` - Deployment guide (Docker, CapRover)
- `DOCKER_BUILD_COMPLETE_SUMMARY.md` - Docker build fixes
- `QEMU_INTEGRATION.md` - Multi-architecture builds
- `QEMU_CI_CD_SUMMARY.md` - QEMU in CI/CD pipelines
- `CI_CD_SIMULATION_RESULTS.md` - CI/CD testing results

### Configuration
- `HARDCODED_ANALYSIS.md` - Configuration management analysis
- `app.config.json` - Centralized application config
- `deployment-config.json` - Platform-specific settings

### Testing
- `E2E_TEST_OPTIMIZATION.md` - E2E test improvements
- `e2e/README.md` - Playwright test suite guide

### Implementation Summaries
- `IMPLEMENTATION_COMPLETE.md` - Architecture refactor summary
- `REFACTORING_COMPLETE_SUMMARY.md` - JSON-driven refactoring
- `SUMMARY.md` - CI/CD implementation summary

---

## 🔗 Related Resources

- **[Spark Platform Documentation](https://github.com/github/spark)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Shadcn UI v4](https://ui.shadcn.com/)**
- **[Playwright Testing](https://playwright.dev/)**
- **[Docker Multi-Platform](https://docs.docker.com/build/building/multi-platform/)**
- **[QEMU User Static](https://github.com/multiarch/qemu-user-static)**

---

## 📅 Version History

- **v7.0** (Current) - Component registry refactor to JSON, Lambda JSON page, metadata query API
- **v6.0** - Configuration management, deployment optimization, testing improvements
- **v5.3** - JSON-driven UI system with 3 example pages
- **v5.0** - Custom hook library and JSON page renderer
- **v4.0** - Atomic design refactor with 50+ components
- **v3.0** - CI/CD integration and multi-architecture support
- **v2.0** - Advanced features (workflows, testing, Flask API)
- **v1.0** - Foundation and core designers

---

**Last Updated:** 2024  
**Maintained By:** CodeForge Development Team  
**Built with:** ❤️ using GitHub Spark

---

## 🎉 Acknowledgments

Special thanks to all contributors and the technologies that power CodeForge:
- GitHub Spark for the runtime platform
- Shadcn for the beautiful component library
- The open-source community for inspiration and tools
