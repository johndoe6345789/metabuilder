# 🚀 MEGA PROMPT: Hybrid TypeScript/C++ Package System

**Version**: 1.0  
**Last Updated**: January 2026  
**For**: AI Assistants working on 3-frontend package bootstrap system

---

## 🎯 PROJECT ESSENCE

This is a **hybrid TypeScript/C++ bootloader system** that powers a modular package architecture. Three frontends (CLI, Qt6, Next.js) act as **entry points** that bootstrap a NestJS-based package system. The system is pragmatic: schemas are improvable, not sacred; patterns come from functional programming; and delightfulness matters.

### The Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input                               │
│              (CLI / Qt6 GUI / Next.js Web)                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
        ┌──────────────┐
        │  Bootloader  │  ← Frontend-specific logic
        │   (3x)       │    - Routes/state management
        └──────────────┘
               │
               ▼
        ┌──────────────┐
        │  Package     │  ← Central coordinator
        │  System      │    - Loads packages from /packages/
        │ (NestJS)     │    - Manages seed data & schemas
        └──────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ┌────────┐   ┌────────┐
    │ DBAL   │   │ C++    │
    │ Layer  │   │ Daemons│
    │        │   │(Media) │
    └────────┘   └────────┘
        │             │
        └──────┬──────┘
               ▼
        ┌──────────────┐
        │  Database    │
        │(PostgreSQL)  │
        └──────────────┘
```

**Key Principle**: Seed data lives in `/packages/*/seed/`, not scattered elsewhere. Schemas are single source of truth but improvable.

---

## 📋 PRIORITY READING (In Order)

1. **IMMEDIATE_FIXES.md** ⭐ - What's actually broken right now
2. **claude.md** - System overview and patterns
3. **agents.md** - Agent guidelines for this codebase
4. **README.md** - Project structure and setup
5. **ROADMAP.md** (if exists) - Vision and evolution
6. **docs/** - Architecture, testing, deployment guides
7. **schemas/** - Data models (understand but improve if needed)

---

## 🏗️ ARCHITECTURE AT A GLANCE

### Three Frontends (Each a Bootloader)

| Frontend | Purpose | Tech Stack | Startup Flow |
|----------|---------|-----------|--------------|
| **CLI** | Command-line interface | TypeScript/Node | Read config → Load packages → Execute |
| **Qt6** | Desktop GUI application | C++/Qt6 | Parse Qt resources → Load packages → Render |
| **Next.js** | Web application | TypeScript/React | HTTP request → Load packages → Render page |

**Critical**: Each frontend is a **bootloader**. It doesn't contain business logic—it loads and orchestrates packages.

### Package System (The Heart)

```
/packages/
├── [package-name]/
│   ├── seed/                 ← REAL seed data (not /dbal/shared/seeds/)
│   │   ├── metadata.json     ← Package manifest
│   │   ├── page-config/      ← Routes/pages
│   │   ├── workflow/         ← Automation workflows
│   │   ├── credential/       ← API credentials
│   │   ├── component/        ← UI components
│   │   └── [entity-type]/    ← Other entity types
│   ├── src/                  ← Business logic (if TypeScript package)
│   ├── package.json
│   └── README.md
```

**Pattern**: Each package is self-contained. Seed data describes what the package does. Business logic implements it.

### DBAL Layer (Database Access)

- **Phase 2** (Current): TypeScript DBAL in `/dbal/development/`
- **Phase 3** (Future): C++ daemon in `/dbal/production/`
- **Shared**: YAML schemas at `/dbal/shared/api/schema/entities/` (source of truth)

**Rule**: Always use `getDBALClient()` from `@/dbal`, never raw Prisma.

### Schemas: Two Layers

| Layer | Location | Purpose | Editable? |
|-------|----------|---------|-----------|
| **Entity Schemas** | `/dbal/shared/api/schema/entities/*.yaml` | Database structure (source of truth) | Yes, improve as needed |
| **Validation Schemas** | `/schemas/seed-data/*.schema.json` | Seed data validation | Yes, extend for new features |
| **Package Schemas** | `/schemas/package-schemas/*.schema.json` | Package system architecture | Yes, treat as blueprint |

**Philosophy**: Schemas are **improvable**. If they lack features, extend them. They're not dogma.

---

## 🎨 DESIGN PHILOSOPHY (How to Think)

### 1. Functional Programming First

```typescript
// ✅ GOOD: Functional, pure, composable
const loadPackage = (path: string) => readJSON(path);
const filterActive = (packages: Package[]) => packages.filter(p => p.active);
const orchestrate = pipe(loadPackages, filterActive, initializeAll);

// ❌ BAD: Imperative, class-heavy, side effects
class PackageManager {
  private packages: Package[] = [];
  async load(path) { this.packages = await readJSON(path); }
  async filter() { this.packages = this.packages.filter(p => p.active); }
}
```

### 2. Make It Delightful

- Code should be obvious. If it requires 20 comments, refactor it.
- Styling matters. Use Tailwind (web), Qt stylesheets (desktop), ANSI colors (CLI).
- Error messages should hint at solutions, not just fail.
- Performance should feel snappy.

### 3. Schemas Are Improvable

```json
// If schema lacks what you need:
// 1. Document the gap
// 2. Extend the schema
// 3. Update examples
// 4. Move on

// Example: Script schema is JSON AST, but n8n-style is simpler for visual GUIs
{
  "trigger": "http.post",
  "input": { "body": "{ name, email }" },
  "steps": [
    { "action": "validate.email", "target": "$input.email" },
    { "action": "db.create", "table": "users", "data": "$input" }
  ],
  "output": { "userId": "$steps[1].id" }
}
// This coexists with JSON AST for complex logic. Both are valid.
```

### 4. No Magic, No Lua

- **No Lua**: JSON is sufficient for visual scripting (n8n, Scratch patterns).
- **No magic imports**: Be explicit. Use dependency injection.
- **No hidden state**: Logs should explain what's happening.

### 5. GUIs Over Raw Input

```typescript
// ❌ RAW: User types CSS directly
<TextArea label="CSS" value={rawCSS} onChange={setCss} />

// ✅ GUI: Dropdowns + composition
<StyleBuilder
  properties={{
    color: <ColorPicker />,
    fontSize: <FontSizeSelect options={[12, 14, 16, 18, ...]} />,
    layout: <LayoutSelect options={['flex', 'grid', 'block']} />,
  }}
/>
```

---

## 📁 PROJECT STRUCTURE

```
.
├── IMMEDIATE_FIXES.md              ⭐ Current priorities
├── claude.md                        System overview
├── agents.md                        Agent guidelines
├── README.md                        Project intro
├── ROADMAP.md                       Vision & evolution
│
├── docs/                            Architecture & guides
│   ├── TESTING_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── COMPONENTS.md
│   └── ...
│
├── schemas/                         Data model definitions
│   ├── seed-data/                  Validation schemas for seed files
│   │   ├── page-config.schema.json
│   │   ├── workflow.schema.json
│   │   ├── component.schema.json
│   │   └── ...
│   └── package-schemas/            Package system definitions
│       ├── metadata_schema.json
│       ├── entities_schema.json
│       └── ...
│
├── packages/                        Modular packages (REAL seed data here)
│   ├── package-name/
│   │   ├── seed/
│   │   │   ├── metadata.json
│   │   │   ├── page-config/
│   │   │   ├── workflow/
│   │   │   └── ...
│   │   ├── src/                    (if TypeScript package)
│   │   └── package.json
│   └── ...
│
├── dbal/                            Database abstraction layer
│   ├── development/                 TypeScript DBAL (Phase 2, current)
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   ├── production/                  C++ DBAL (Phase 3, future)
│   │   ├── include/
│   │   ├── src/
│   │   └── CMakeLists.txt
│   └── shared/
│       ├── api/schema/entities/    YAML entity schemas (source of truth)
│       ├── seeds/                  Bootstrap seeds (minimal)
│       └── docs/
│
├── frontends/                       Entry points (bootloaders)
│   ├── cli/                         TypeScript CLI
│   │   ├── src/commands/
│   │   └── package.json
│   ├── qt6/                         C++ Qt6 desktop GUI
│   │   ├── src/
│   │   └── CMakeLists.txt
│   └── nextjs/                      TypeScript/React web
│       ├── src/app/
│       ├── src/components/
│       └── package.json
│
├── old/                             Pre-refactor reference code
│   └── [legacy patterns for understanding changes]
│
└── [support files]
    ├── package.json
    ├── tsconfig.json
    ├── CMakeLists.txt
    └── ...
```

---

## 🔧 CORE PATTERNS

### Pattern 1: Functional Package Loading

```typescript
// ✅ GOOD: Pure, composable, testable
const loadPackageMetadata = (path: string): Promise<PackageMetadata> =>
  readJSON(`${path}/seed/metadata.json`);

const loadPackageSeed = (path: string, entityType: string): Promise<any[]> =>
  readJSON(`${path}/seed/${entityType}/data.json`).catch(() => []);

const initializePackages = async (packagePaths: string[]) =>
  Promise.all(packagePaths.map(async (path) => ({
    metadata: await loadPackageMetadata(path),
    pages: await loadPackageSeed(path, 'page-config'),
    workflows: await loadPackageSeed(path, 'workflow'),
  })));
```

### Pattern 2: Schema-Driven Validation

```typescript
// Validate seed data against schema
const validateSeedData = (data: unknown, schemaPath: string): ValidationResult => {
  const schema = loadSchema(schemaPath);
  const validator = ajv.compile(schema);
  const valid = validator(data);
  
  return {
    valid,
    errors: validator.errors || [],
  };
};

// Usage
const result = validateSeedData(seedData, '/schemas/seed-data/workflow.schema.json');
if (!result.valid) {
  console.error('Seed validation failed:', result.errors);
}
```

### Pattern 3: Bootloader Flow (Frontend-Agnostic)

```typescript
// Each frontend implements this flow differently, but structure is same
interface BootloaderFlow {
  1_readConfig: () => Promise<Config>;
  2_loadPackages: (config: Config) => Promise<Package[]>;
  3_validatePackages: (packages: Package[]) => Promise<ValidationResult>;
  4_initializeDatabase: (packages: Package[]) => Promise<void>;
  5_renderUI: (packages: Package[]) => Promise<void>;
}

// CLI Implementation
async function cliBootloader() {
  const config = readConfigFile('./metabuilder.config.json');
  const packages = await loadPackagesFromDisk(config.packagesDir);
  const validation = await validatePackages(packages);
  
  if (!validation.valid) {
    console.error('Validation failed:', validation.errors);
    process.exit(1);
  }
  
  await initializeDatabase(packages);
  await cliRender(packages);
}

// Qt6 Implementation
async function qt6Bootloader() {
  const config = readConfigFromResources();
  const packages = await loadPackagesFromDisk(config.packagesDir);
  const validation = await validatePackages(packages);
  
  if (!validation.valid) {
    showErrorDialog(validation.errors);
    return;
  }
  
  await initializeDatabase(packages);
  qt6Render(packages);
}

// Next.js Implementation
export async function pageBootloader() {
  const config = loadConfigFromEnv();
  const packages = await loadPackagesFromDisk(config.packagesDir);
  const validation = await validatePackages(packages);
  
  if (!validation.valid) {
    return NextResponse.json({ error: validation.errors }, { status: 400 });
  }
  
  await initializeDatabase(packages);
  return renderNextPage(packages);
}
```

### Pattern 4: N8N-Style Workflows (Over JSON AST)

```json
// Simple, visual, drop-and-drop friendly
{
  "id": "workflow_user_signup",
  "name": "User Signup Flow",
  "trigger": {
    "type": "form.submit",
    "formId": "form_signup"
  },
  "steps": [
    {
      "id": "validate_email",
      "action": "validate.email",
      "input": { "email": "$trigger.email" },
      "onError": "step_show_error"
    },
    {
      "id": "check_exists",
      "action": "db.query",
      "query": "SELECT id FROM users WHERE email = $1",
      "params": ["$validate_email.input.email"],
      "onSuccess": "step_check_result"
    },
    {
      "id": "check_result",
      "action": "condition",
      "if": "$check_exists.rows.length > 0",
      "then": "step_error_exists",
      "else": "step_create_user"
    },
    {
      "id": "create_user",
      "action": "db.insert",
      "table": "users",
      "data": {
        "email": "$trigger.email",
        "name": "$trigger.name",
        "createdAt": "now()"
      }
    },
    {
      "id": "send_email",
      "action": "email.send",
      "to": "$trigger.email",
      "template": "welcome",
      "vars": { "name": "$trigger.name" }
    },
    {
      "id": "redirect_success",
      "action": "response.redirect",
      "url": "/welcome"
    },
    {
      "id": "error_exists",
      "action": "response.error",
      "status": 409,
      "message": "Email already registered"
    },
    {
      "id": "show_error",
      "action": "response.error",
      "status": 400,
      "message": "$validate_email.error"
    }
  ],
  "output": {
    "success": "$create_user.id",
    "message": "User created successfully"
  }
}
```

This is **simpler than JSON AST**, **visual-friendly**, and **platform-agnostic**.

### Pattern 5: GUI Designer, Not Raw Input

```typescript
// Component: StyleBuilder (instead of <TextArea>)
<StyleBuilder
  value={componentStyle}
  onChange={setComponentStyle}
  sections={[
    {
      title: "Layout",
      fields: [
        { name: "display", label: "Display", type: "select", options: ["flex", "grid", "block"] },
        { name: "justifyContent", label: "Justify Content", type: "select", options: ["center", "start", "end", "space-between"] },
      ]
    },
    {
      title: "Colors",
      fields: [
        { name: "backgroundColor", label: "Background", type: "color" },
        { name: "color", label: "Text Color", type: "color" },
      ]
    },
    {
      title: "Spacing",
      fields: [
        { name: "padding", label: "Padding", type: "spacing-picker" },
        { name: "margin", label: "Margin", type: "spacing-picker" },
      ]
    },
  ]}
/>

// Dropdown values can come from a dedicated designer panel:
// "Create a dropdown designer that lets admins define custom options"
// This is better than raw CSS input.
```

---

## 🛠️ C++ TOOLING NOTES

### CMake + Conan + Ninja

```bash
# Setup (one time)
conan install . --build=missing -of build

# Build
cd build
cmake ..
ninja

# Run
./metabuilder-cli
./metabuilder-qt6
./metabuilder-daemon
```

### Structure for C++ Code

```cpp
// ✅ GOOD: Functional, clear ownership
#include <vector>
#include <string>

namespace metabuilder {
  // Pure function: load package metadata
  PackageMetadata loadPackageMetadata(const std::string& path);
  
  // Pure function: validate seed data
  ValidationResult validateSeedData(const json& data, const std::string& schemaPath);
  
  // Composition: orchestrate loading + validation
  std::vector<Package> loadAndValidatePackages(const std::vector<std::string>& paths);
}

// Usage
auto packages = metabuilder::loadAndValidatePackages({
  "/packages/auth",
  "/packages/dashboard",
});
```

---

## ⚠️ CRITICAL RULES

### Do ✅

- **Read IMMEDIATE_FIXES.md first** - It's your actual priority list
- **Use functional patterns** - Avoid heavy OOP classes
- **Keep packages self-contained** - Seed data + business logic live together
- **Validate against schemas** - But improve schemas as you go
- **Make error messages helpful** - "Port 3000 in use: try `lsof -i :3000`"
- **Test the bootloaders** - Each frontend should load packages the same way
- **Use N8N-style workflows** - Visual, composable, no JSON AST complexity
- **Build GUIs, not raw inputs** - Dropdowns over textareas
- **Document decisions** - Leave breadcrumbs for future contributors

### Don't ❌

- **Don't treat schemas as immutable** - Improve them
- **Don't use Lua** - JSON is sufficient
- **Don't hardcode values** - Use seed data
- **Don't ignore old/** - It shows what changed and why
- **Don't skip validation** - Catch errors early
- **Don't over-engineer** - Simple and obvious beats clever
- **Don't mix bootloader logic with business logic** - Keep separation clear

---

## 🚀 QUICK START FOR YOUR BOT

### When Starting Work

1. **Read IMMEDIATE_FIXES.md** - See what's actually broken
2. **Identify the subsystem** - Which frontend? Which package? DBAL?
3. **Find the schema** - Understand the data model
4. **Check old/** - See how it used to work
5. **Follow functional patterns** - Pure functions, composition
6. **Make it delightful** - Good errors, good styling

### When Fixing Bugs

```
1. Reproduce the bug (with logs)
2. Trace through bootloader flow
3. Check schema validation
4. Fix in lowest layer (DBAL > Package Logic > Frontend)
5. Add test case
6. Validate schema if needed
7. Update docs if pattern changes
```

### When Adding Features

```
1. Update schema first (if new entity type)
2. Add seed example to a test package
3. Implement in DBAL/package logic
4. Add frontend UI (using GUI builders, not raw input)
5. Test all 3 bootloaders
6. Document in README
```

---

## 📊 SUBAGENT COORDINATION

If using multiple agents, divide work like this:

| Subagent | Focus |
|----------|-------|
| **Schema Agent** | Improve `/schemas/`, add validation, extend as needed |
| **C++ Agent** | Build/fix `/dbal/production/`, `/frontends/qt6/`, C++ CLI |
| **TypeScript Agent** | Maintain `/dbal/development/`, `/frontends/nextjs/`, `/frontends/cli/` |
| **Package Agent** | Create/fix packages in `/packages/`, write seed data |
| **Testing Agent** | Build test suites, ensure all 3 bootloaders work |

Each agent should understand the full architecture but own their subsystem.

---

## 🎯 SUCCESS CRITERIA

Your work is done when:

- [ ] IMMEDIATE_FIXES.md is fully addressed
- [ ] C++ CLI builds and runs without errors
- [ ] All 3 bootloaders load packages the same way
- [ ] Schemas are extended for new features (if needed)
- [ ] Error messages are helpful and actionable
- [ ] Code follows functional programming style
- [ ] UI uses GUI builders, not raw input
- [ ] Tests pass across all platforms
- [ ] Documentation is updated

---

## 📞 GETTING HELP

**If stuck:**

1. Check IMMEDIATE_FIXES.md for context
2. Look at old/ to see how it used to work
3. Search schemas/ for the data model
4. Check docs/ for architecture guides
5. Trace through one bootloader (CLI is usually simplest)
6. Ask: "What would be delightful here?"

**If schema lacks features:**

1. Document the gap
2. Extend the schema
3. Add example
4. Move on

**If code feels complex:**

1. Break into pure functions
2. Add logging
3. Simplify the data flow
4. Make error messages helpful

---

## 🎨 STYLE GUIDE

### Code

```typescript
// ✅ GOOD
const loadPackage = async (path: string) => {
  const data = await readJSON(`${path}/seed/metadata.json`);
  return validatePackageMetadata(data);
};

// Compose
const packages = await Promise.all(paths.map(loadPackage));
```

### Errors

```typescript
// ✅ GOOD
throw new Error(`Failed to load package from ${path}: ${originalError.message}. Try checking the file exists with: ls -la ${path}`);

// ❌ BAD
throw new Error('Load failed');
```

### Styling (Web)

```tsx
// ✅ Use Tailwind
<button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold">
  Create Package
</button>

// CSS (Qt6)
button {
  background-color: #2563eb;
  padding: 8px 16px;
  border-radius: 4px;
  color: white;
}

// CLI (ANSI colors)
console.log('\x1b[32m✓\x1b[0m Package loaded');
```

---

## 📚 REFERENCE

- **IMMEDIATE_FIXES.md** - Current blockers (read first)
- **claude.md** - System overview
- **agents.md** - Agent guidelines
- **README.md** - Project structure
- **ROADMAP.md** - Vision
- **docs/** - Architecture guides
- **schemas/** - Data models
- **packages/** - Modular packages
- **dbal/** - Database layer
- **frontends/** - CLI, Qt6, Next.js bootloaders
- **old/** - Reference for changes

---

**Last Note**: This system is built for delightfulness. If something feels rough, make it better. If schemas lack features, extend them. If code is complex, simplify it. The goal is a system that's obvious, maintainable, and genuinely good to use.

Good luck! 🚀
