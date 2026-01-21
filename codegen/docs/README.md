# 🔨 CodeForge - Low-Code Next.js App Builder

![CodeForge](https://img.shields.io/badge/CodeForge-v6.0-blueviolet)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![AI Powered](https://img.shields.io/badge/AI-Powered-green)
![PWA](https://img.shields.io/badge/PWA-Enabled-orange)

A comprehensive visual low-code platform for generating production-ready Next.js applications with Material UI, Prisma, Flask backends, comprehensive testing suites, and persistent project management. Built with AI-powered code generation and Progressive Web App capabilities for offline-first development.

## ✨ Features

### 🏗️ Architecture (Phase 4: Declarative System ✨)
- **Declarative JSON-Driven Pages** - Add new pages by editing a JSON file, no code changes needed
- **Dynamic Component Loading** - All pages are lazy-loaded based on configuration for optimal performance
- **Automatic Keyboard Shortcuts** - Shortcuts defined in JSON and automatically wired up
- **Feature Toggle Integration** - Pages show/hide based on feature flags without conditional rendering
- **Comprehensive Hook Library** - 12+ custom hooks for data, UI, and form management (all <150 LOC)
- **Atomic Component Library** - All components under 150 LOC for maximum maintainability
- **Type-Safe Everything** - Full TypeScript + Zod validation for hooks, components, and JSON schemas
- **Centralized Configuration** - Navigation, pages, and features configured via JSON

### 🎯 Core Capabilities
- **Progressive Web App** - Install on desktop/mobile, work offline, automatic updates, and push notifications
- **Project Management** - Save, load, duplicate, export, and import complete projects with full state persistence
- **Project Dashboard** - At-a-glance overview of project status, completion metrics, and quick tips
- **Monaco Code Editor** - Full-featured IDE with syntax highlighting, autocomplete, and multi-file editing
- **Prisma Schema Designer** - Visual database model builder with relations and field configuration
- **Component Tree Builder** - Hierarchical React component designer with Material UI integration
- **Component Tree Manager** - Manage multiple named component trees for different app sections
- **Workflow Designer** - n8n-style visual workflow builder with triggers, actions, conditions, and lambdas
- **Lambda Designer** - Serverless function editor with multi-runtime support and trigger configuration
- **Theme Designer** - Advanced theming with multiple variants (light/dark/custom) and unlimited custom colors
- **Favicon Designer** - Visual icon designer with shapes, text, emojis, and multi-size export (16px to 512px)
- **Sass Styling System** - Custom Material UI components with Sass, including utilities, mixins, and animations
- **Flask Backend Designer** - Python REST API designer with blueprints, endpoints, and CORS configuration
- **Project Settings** - Configure Next.js options, npm packages, scripts, and build settings
- **CI/CD Integration** - Generate workflow files for GitHub Actions, GitLab CI, Jenkins, and CircleCI
- **Feature Toggles** - Customize your workspace by enabling/disabling designer features
- **Keyboard Shortcuts** - Power-user shortcuts for rapid navigation and actions

### 🤖 AI-Powered Generation
- **Complete App Generation** - Describe your app and get a full project structure
- **Smart Code Improvements** - Optimize code for performance and best practices
- **Model Generation** - Create Prisma schemas from natural language
- **Component Generation** - Build complex React components with proper structure
- **Theme Generation** - Generate beautiful, accessible color palettes
- **Test Generation** - Create comprehensive E2E, unit, and integration tests
- **Code Explanations** - Understand any code snippet with detailed explanations
- **Auto Error Repair** - Detect and fix syntax, type, import, and lint errors automatically

### 🧪 Testing & Quality
- **Playwright Designer** - Visual E2E test builder with step-by-step configuration
- **Storybook Designer** - Component story builder with args and variations
- **Unit Test Designer** - Comprehensive test suite builder for components, functions, and hooks
- **Error Detection** - Automated scanning for syntax, type, and lint errors
- **Auto Repair System** - AI-powered context-aware error fixing
- **Smoke Tests** - 17 critical tests validating all major features (~30-60s execution)
- **E2E Test Suite** - 50+ comprehensive tests across all functionality (~3-5min execution)

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.x
- npm >= 8.3.0 (for overrides support)
- Docker (optional, for containerization)

### Installation
```bash
# Install dependencies (no special flags needed!)
npm install

# Install Playwright browsers (for testing)
npx playwright install

# Start development server
npm run dev
```

### Docker & Multi-Architecture Support

CodeForge supports multi-architecture Docker builds (AMD64 + ARM64) using QEMU:

```bash
# Build multi-arch image locally
chmod +x scripts/build-multiarch.sh
./scripts/build-multiarch.sh codeforge latest

# Validate QEMU setup
./scripts/validate-qemu.sh

# See full documentation
cat QEMU_INTEGRATION.md
```

**Benefits:**
- Deploy to AWS Graviton, Azure ARM VMs, Apple Silicon
- 20-40% cost reduction with ARM instances
- Automatic multi-arch builds in all CI/CD pipelines

### Storage Backend Configuration

CodeForge uses **IndexedDB by default** with optional Flask API backend support. The storage system automatically falls back to IndexedDB if the Flask API is unavailable.

#### IndexedDB (Default - No Configuration Required)
- ✅ Client-side browser storage
- ✅ Works offline, no server required
- ✅ Zero configuration needed
- ✅ Perfect for development and single-user scenarios
- ✅ Automatic fallback if Flask API fails

#### Flask Backend (Optional)
- Server-side persistent storage
- Data shared across devices and browsers
- Configured via environment variable or UI settings
- Automatic fallback to IndexedDB on failure

```bash
# Use IndexedDB only (default, no configuration)
docker run -p 80:80 codeforge

# Enable Flask backend with automatic fallback
docker run -p 80:80 \
  -e VITE_FLASK_API_URL=http://backend:5001 \
  codeforge

# Or configure at runtime via Storage Settings in the UI
```

**Automatic Fallback:** If Flask API fails (network error, CORS, timeout), the app automatically switches to IndexedDB without data loss.

**📚 [Storage System Documentation](./PACKAGES_REMOVAL_FINAL.md)** - Complete storage architecture guide

**📚 [QEMU Integration Guide](./QEMU_INTEGRATION.md)** - Complete multi-architecture documentation

### Dependency Management

This project uses npm's **overrides** feature to manage dependencies without `--legacy-peer-deps`. See [docs/DEPENDENCY_MANAGEMENT.md](./docs/DEPENDENCY_MANAGEMENT.md) for details.

**Key Points:**
- ✅ No `--legacy-peer-deps` flag required
- ✅ Uses `npm ci` in CI/CD for reproducible builds
- ✅ Overrides ensure consistent React 19 and Vite 7 versions
- ✅ Monorepo workspace support with standard npm

If you encounter dependency issues, clean install:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Troubleshooting

**Getting 502 Bad Gateway errors?**

The dev server must run on port 5000 for Codespaces forwarding:

```bash
# Run diagnostics
bash scripts/diagnose-502.sh

# Kill any existing server
npm run kill

# Start fresh
npm run dev
```

For detailed troubleshooting, see [docs/502_ERROR_FIX.md](./docs/502_ERROR_FIX.md)

### Quick Start
1. **Save Your Work** - Use **Save Project** button to persist your work to the database
2. **Load Projects** - Click **Load Project** to view and switch between saved projects
3. Open the **Documentation** tab in the app for comprehensive guides
4. Use **AI Generate** to scaffold a complete application from a description
5. Navigate between tabs to design models, components, themes, and backend APIs
6. Click **Export Project** to download your complete Next.js application

### Running Tests
```bash
# Run smoke tests (quick validation - ~30-60 seconds)
npm run test:e2e:smoke

# Run all E2E tests (comprehensive - ~3-5 minutes)
npm run test:e2e

# Run tests in interactive UI mode (recommended for debugging)
npm run test:e2e:ui

# Run tests with browser visible
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

**See [docs/testing/RUN_TESTS.md](./docs/testing/RUN_TESTS.md) for detailed test execution guide.**

### Code Quality & Linting
```bash
# Check linting status (no auto-fix)
npm run lint:check

# Auto-fix all fixable issues
npm run lint

# TypeScript type checking
npx tsc --noEmit

# Quick lint status check
./quick-lint-check.sh

# Full procedural linting analysis
./procedural-lint-fix.sh

# Full verification (lint + types)
npm run lint:check && npx tsc --noEmit
```

**Linting Status**: ✅ All checks passing (exit code 0)
- ~500 non-blocking warnings (expected for JSON-driven architecture)
- See [LINT_PROCEDURAL_FIX_REPORT.md](./LINT_PROCEDURAL_FIX_REPORT.md) for detailed analysis
- Auto-fix removes unused imports and fixes formatting issues

### Project Management
- **Save Project** - Save current work with name and description to database
- **Load Project** - Browse and load any saved project
- **New Project** - Start fresh with a blank workspace
- **Duplicate** - Create a copy of any saved project
- **Export** - Download project as JSON file for backup or sharing
- **Import** - Load a project from an exported JSON file
- **Delete** - Remove projects from database

### Manual Building
1. **Models Tab** - Create your database schema with Prisma models
2. **Components Tab** - Build your UI component hierarchy
3. **Component Trees Tab** - Organize components into named trees
4. **Workflows Tab** - Design automation workflows visually
5. **Lambdas Tab** - Create serverless functions
6. **Styling Tab** - Design your theme with custom colors and typography
7. **Favicon Designer Tab** - Create app icons and favicons with visual designer
8. **Flask API Tab** - Configure your backend REST API
9. **Settings Tab** - Configure Next.js and npm packages
10. **Code Editor Tab** - Fine-tune generated code directly
11. **Export** - Download your complete, production-ready application

### Accessing Features
- **Global Search** - Press `Ctrl+K` (or `Cmd+K`) to search all features, files, and navigate instantly
- **Hamburger Menu** - Click the menu icon (☰) in the top-left to browse all available tabs
- **Feature Toggles** - Go to **Features** tab to enable/disable specific designers
- **Need Help?** - See [docs/guides/FAVICON_DESIGNER_ACCESS.md](./docs/guides/FAVICON_DESIGNER_ACCESS.md) for troubleshooting

## 🏗️ Phase 4: Refactored Architecture

CodeForge has been completely refactored with a modular, JSON-driven architecture:

### 📚 Complete Documentation

**👉 [View All Documentation in /docs](./docs/README.md)**

Quick Links:
- **[docs/PRD.md](./docs/PRD.md)** - 📋 Product Requirements Document
- **[docs/guides/QUICK_REFERENCE.md](./docs/guides/QUICK_REFERENCE.md)** - ⚡ Fast lookup guide
- **[docs/api/COMPLETE_HOOK_LIBRARY.md](./docs/api/COMPLETE_HOOK_LIBRARY.md)** - 🎣 Complete hook API reference
- **[docs/architecture/DECLARATIVE_SYSTEM.md](./docs/architecture/DECLARATIVE_SYSTEM.md)** - ⭐ JSON-driven system
- **[docs/architecture/ARCHITECTURE_VISUAL_GUIDE.md](./docs/architecture/ARCHITECTURE_VISUAL_GUIDE.md)** - 🎨 Architecture diagrams
- **[docs/testing/RUN_TESTS.md](./docs/testing/RUN_TESTS.md)** - 🧪 Testing guide

### 🎣 Hook Library (12+ Hooks, All <150 LOC)

#### Data Management (`/src/hooks/data/`)
- **`useArray`** - Enhanced array operations with persistence
- **`useCRUD`** - Complete CRUD operations for entities  
- **`useSearch`** - Multi-field debounced search
- **`useSort`** - Multi-key sorting with direction toggle
- **`usePagination`** - Client-side pagination
- **`useDebounce`** - Generic value debouncing

#### UI State (`/src/hooks/ui/`)
- **`useDialog`** - Modal/dialog state management
- **`useTabs`** - Type-safe tab navigation
- **`useSelection`** - Multi-select state management
- **`useClipboard`** - Copy to clipboard with feedback

#### Forms (`/src/hooks/forms/`)
- **`useForm`** - Complete form management with validation
- **`useFormField`** - Single field with validation rules

### 📄 JSON Orchestration Engine

Build entire pages using JSON schemas without writing React code:

```json
{
  "id": "my-page",
  "name": "My Page",
  "layout": { "type": "single" },
  "dataSources": [
    { "id": "data", "type": "kv", "key": "my-data", "defaultValue": [] }
  ],
  "components": [
    { "id": "root", "type": "Card", "children": [...] }
  ],
  "actions": [
    { "id": "add", "type": "create", "target": "data" }
  ]
}
```

**Engine Components:**
- **PageRenderer** - Interprets JSON schemas and renders React components
- **ActionExecutor** - Executes CRUD, navigation, API, and custom actions
- **DataSourceManager** - Manages KV store, API, and computed data sources
- **ComponentRegistry** - Maps JSON component types to React components

### 🎯 Key Benefits

- ✅ **All components <150 LOC** - Maximum maintainability
- ✅ **Reusable hooks** - Extract and share business logic
- ✅ **JSON-driven pages** - Build pages without writing code
- ✅ **Full type safety** - TypeScript + Zod validation
- ✅ **Easy testing** - Small, focused units
- ✅ **Rapid prototyping** - Create pages by editing JSON

## 🏗️ Architecture Documentation

CodeForge uses modern patterns for maintainability and extensibility:

### Declarative System (Primary)
- **[docs/architecture/DECLARATIVE_SYSTEM.md](./docs/architecture/DECLARATIVE_SYSTEM.md)** - **⭐ START HERE** Complete guide to the JSON-driven architecture
- Learn how to add pages by editing JSON instead of writing React code
- Understand the component registry, keyboard shortcuts, and feature toggles
- Includes migration guide and best practices

### Atomic Component Architecture (Legacy)
- **[docs/architecture/atomic/ATOMIC_README.md](./docs/architecture/atomic/ATOMIC_README.md)** - Quick start guide
- **[docs/architecture/atomic/ATOMIC_REFACTOR_SUMMARY.md](./docs/architecture/atomic/ATOMIC_REFACTOR_SUMMARY.md)** - Overview of the atomic structure
- **[docs/architecture/atomic/ATOMIC_COMPONENTS.md](./docs/architecture/atomic/ATOMIC_COMPONENTS.md)** - Complete architecture guide
- **[docs/architecture/atomic/ATOMIC_USAGE_EXAMPLES.md](./docs/architecture/atomic/ATOMIC_USAGE_EXAMPLES.md)** - Code examples and patterns
- **[docs/architecture/atomic/COMPONENT_MAP.md](./docs/architecture/atomic/COMPONENT_MAP.md)** - Visual dependency maps

### Component Levels
- **Atoms** (7) - Basic building blocks: `AppLogo`, `StatusIcon`, `ErrorBadge`, etc.
- **Molecules** (10) - Simple combinations: `SaveIndicator`, `ToolbarButton`, `EmptyState`, etc.
- **Organisms** (4) - Complex components: `AppHeader`, `NavigationMenu`, `PageHeader`, etc.
- **Features** (20+) - Domain-specific: `CodeEditor`, `ModelDesigner`, `ProjectDashboard`, etc.

## 📋 Technology Stack

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- Material UI 5
- Sass/SCSS for custom styling
- Monaco Editor
- Tailwind CSS
- Framer Motion

### Backend & Testing
- Flask REST API (Python)
- Prisma ORM
- Playwright (E2E Testing)
- Vitest + React Testing Library
- Storybook for Component Development

### AI Integration
- OpenAI GPT-4 for code generation
- Context-aware prompt engineering
- Intelligent error detection and repair
- Natural language to code translation

## 📚 Documentation

The application includes comprehensive documentation organized in the `/docs` folder:

### Core Documentation
- **[README](./README.md)** - Complete feature overview and getting started guide (this file)
- **[docs/PRD.md](./docs/PRD.md)** - Product Requirements Document
- **[docs/reference/ROADMAP.md](./docs/reference/ROADMAP.md)** - Completed features and planned enhancements

### Technical Guides
- **[docs/architecture/](./docs/architecture/)** - Architecture and design patterns
- **[docs/api/](./docs/api/)** - Hook library and API references
- **[docs/guides/](./docs/guides/)** - User guides (PWA, CI/CD, Error Repair, etc.)
- **[docs/testing/](./docs/testing/)** - Testing documentation and test execution guides
- **[docs/deployment/](./docs/deployment/)** - Deployment and operations guides

### Navigation
- **[docs/README.md](./docs/README.md)** - 📖 Documentation index with quick navigation

Access in-app documentation by clicking the **Documentation** tab in the application.

### 📱 Progressive Web App Features

CodeForge is a full-featured PWA that you can install and use offline:

- **Install Anywhere** - Install on desktop (Windows, Mac, Linux) or mobile (iOS, Android)
- **Offline Support** - Work without internet connection; changes sync when reconnected
- **Automatic Updates** - Get notified when new versions are available
- **Push Notifications** - Stay informed about project builds and updates (optional)
- **Fast Loading** - Intelligent caching for near-instant startup
- **App Shortcuts** - Quick access to Dashboard, Code Editor, and Models from your OS
- **Share Target** - Share code files directly to CodeForge from other apps
- **Background Sync** - Project changes sync automatically in the background

**To Install:**
1. Visit the app in a supported browser (Chrome, Edge, Safari, Firefox)
2. Look for the install prompt in the address bar or use the "Install" button in the app
3. Follow the installation prompts for your platform
4. Access the app from your applications menu or home screen

**PWA Settings:**
- Navigate to **PWA** tab to configure notifications, clear cache, and check installation status
- Monitor network status and cache size
- Manage service worker and offline capabilities

## 🗺️ Roadmap

### ✅ Completed (v1.0 - v5.3)
- Progressive Web App with offline support and installability
- Project persistence with save/load functionality
- Project dashboard with completion metrics
- Monaco code editor integration
- Visual designers for models, components, and themes
- Multiple component trees management
- n8n-style workflow designer
- Lambda function designer with multi-runtime support
- AI-powered generation across all features
- Multi-theme variant support
- Testing suite designers (Playwright, Storybook, Unit Tests)
- Auto error detection and repair
- Flask backend designer
- Project settings and npm management
- Custom Sass styling system with utilities and mixins
- ZIP file export with README generation
- Keyboard shortcuts for power users
- Complete CI/CD configurations (GitHub Actions, GitLab CI, Jenkins, CircleCI)
- Docker containerization with multi-stage builds
- Feature toggle system for customizable workspace
- Project export/import as JSON
- Project duplication and deletion
- Service Worker with intelligent caching
- Push notifications and background sync
- App shortcuts and share target API

### 🔮 Planned
- Real-time preview with hot reload
- Database seeding designer
- API client generator
- Visual form builder
- Authentication designer (JWT, OAuth, sessions)
- GraphQL API designer
- State management designer (Redux, Zustand, Jotai)
- Component library export
- Design system generator
- Collaboration features

## 🎨 Design Philosophy

CodeForge combines the power of visual low-code tools with professional IDE capabilities:
- **Empowering** - Control at both visual and code levels
- **Intuitive** - Complex generation made approachable
- **Professional** - Production-ready, best-practice code output

## 🤝 Contributing

CodeForge is built on the Spark platform. Contributions, feature requests, and feedback are welcome!

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

## 🔗 Resources

- **[Documentation Hub](./docs/README.md)** - 📖 Complete documentation index
- **[PRD](./docs/PRD.md)** - Product requirements and design decisions
- **[QEMU Integration](./QEMU_INTEGRATION.md)** - 🐳 Multi-architecture Docker builds guide
- **[Error Repair Guide](./docs/guides/ERROR_REPAIR_GUIDE.md)** - Error detection and repair system
- **[CI/CD Guide](./docs/guides/CI_CD_GUIDE.md)** - Complete CI/CD setup and configuration
- **[Favicon Designer Access](./docs/guides/FAVICON_DESIGNER_ACCESS.md)** - How to access and use the Favicon Designer
- **[E2E Test Documentation](./e2e/README.md)** - Comprehensive Playwright test suite guide
- **[E2E Test Summary](./docs/testing/E2E_TEST_SUMMARY.md)** - Test coverage and validation details
- **[Run Tests Guide](./docs/testing/RUN_TESTS.md)** - How to execute smoke tests and full test suite
- **[PWA Guide](./docs/guides/PWA_GUIDE.md)** - Progressive Web App features and setup

---

**Built with ❤️ using GitHub Spark**
