# Hardcoded Configuration Analysis & JSON Migration Plan

## Executive Summary

After analyzing the CodeForge codebase, I've identified significant hardcoded configuration scattered across multiple files. This document outlines what's been hardcoded, why it should be moved to JSON, and provides a comprehensive migration plan.

## ✅ Already JSON-Driven (Good!)

The project has made excellent progress with JSON-driven configuration:

1. **Pages Configuration** (`src/config/pages.json`) - ✅ Complete
   - All page definitions, icons, shortcuts, components
   - Feature toggle integration
   - Prop mappings and resizable configs

2. **Component Trees** (`src/config/component-trees/`) - ✅ Loaded from JSON
   - Molecule and organism component hierarchies
   - Data binding configurations

3. **Architecture Config** (`architecture.json`) - ✅ Partial
   - Basic page renderer configuration
   - Hook categories
   - Atomic component categories

4. **Theme Config** (`theme.json`) - ✅ Ready (currently empty but supported)
   - Tailwind already reads from this file

## 🔴 Currently Hardcoded (Should Be JSON)

### 1. **Application Configuration** (`src/config/app.config.ts`)

**Location:** `src/config/app.config.ts`

**Current State:** TypeScript constant with hardcoded values

```typescript
export const APP_CONFIG = {
  useRouter: false,
  logLevel: 'info',
  features: { ... },
  performance: { ... }
}
```

**Issues:**
- Can't be modified without rebuilding
- No runtime configuration
- Deployment-specific settings baked in

**Solution:** ✅ Created `app.config.json` (root level)

---

### 2. **Build Configuration** (`vite.config.ts`)

**Location:** `vite.config.ts`

**Currently Hardcoded:**
```typescript
server: {
  host: '0.0.0.0',
  port: 5000,
  strictPort: false,
}
preview: {
  host: '0.0.0.0',
  port: Number(process.env.PORT) || 80,
}
build: {
  outDir: 'dist',
  chunkSizeWarningLimit: 1000,
  // ... lots of manual chunk configuration
  terserOptions: { ... }
}
```

**Issues:**
- Port numbers hardcoded (5000, 80)
- Chunk splitting strategy not configurable
- Terser options locked in code
- Base path hardcoded as `'./'` (this was the CapRover deployment issue!)

**Impact on CapRover:** 
- The `base: './'` is correct for deployment
- BUT: The chunking strategy and minification settings can cause glitchy loads
- Manual chunks might not be optimal for all deployment scenarios

**Solution:** Move to `app.config.json` (already done) and update vite.config.ts to read from it

---

### 3. **Component Registry** (`src/lib/component-registry.ts`)

**Location:** `src/lib/component-registry.ts`

**Currently Hardcoded:** 218 lines of manual lazy loading definitions

```typescript
export const ComponentRegistry = {
  ProjectDashboard: lazyWithPreload(...),
  CodeEditor: lazyWithPreload(...),
  // ... 30+ more components
}
```

**Issues:**
- Every new component requires code changes
- No ability to disable/enable components at runtime
- Preload strategy hardcoded
- Can't configure retry logic per component

**Solution:** Create `component-registry.json` with component metadata

---

### 4. **Application Metadata** (`index.html`)

**Location:** `index.html`

**Currently Hardcoded:**
```html
<title>CodeForge - Low-Code Development Platform</title>
<meta name="description" content="...">
<meta name="theme-color" content="#8b5cf6">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono...">
```

**Issues:**
- Brand name hardcoded
- Theme color hardcoded
- Font URLs hardcoded
- Can't be customized per deployment

**Solution:** Generate from `app.config.json` during build or use template variables

---

### 5. **Docker Configuration** (`Dockerfile`)

**Location:** `Dockerfile`

**Currently Hardcoded:**
```dockerfile
FROM node:lts-alpine
WORKDIR /app
EXPOSE 80
ENV PORT=80
```

**Issues:**
- Base image version not configurable
- Port hardcoded
- No build args for customization

**Solution:** Use docker-compose.yml + app.config.json for environment-specific configs

---

### 6. **Nginx Configuration** (`nginx.conf`)

**Location:** `nginx.conf`

**Currently Hardcoded:**
```nginx
listen 80;
gzip_min_length 1024;
expires 1y;
```

**Note:** Currently NOT used (switched to Vite preview server per DEPLOYMENT.md)

**Issues (if re-enabled):**
- Port hardcoded
- Cache settings hardcoded
- Gzip settings hardcoded

**Solution:** Already in `app.config.json` under `nginx` section

---

### 7. **PWA Configuration**

**Location:** Multiple files (service-worker registration, manifest generation)

**Currently:** Partially configured, but settings scattered

**Should Include in JSON:**
- Service worker strategy
- Cache patterns
- Offline fallbacks
- Update policies
- Notification settings

**Solution:** Already in `app.config.json` under `pwa` section

---

### 8. **CI/CD Configurations**

**Location:** `.github/`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/`

**Currently Hardcoded:**
- Node versions
- Build commands
- Test commands
- Deployment targets

**Issues:**
- Inconsistent node versions across CI systems
- Duplicated configuration
- Hard to maintain

**Solution:** Already in `app.config.json` under `ci` section

---

### 9. **Seed Data** (`src/config/seed-data.json`)

**Location:** `src/config/seed-data.json`

**Current State:** ✅ Already JSON, but should be referenced in main config

**Contains:**
- Default project files
- Sample models
- Example components

**Solution:** Reference in `app.config.json` paths section

---

### 10. **Feature Toggles Defaults**

**Location:** Various components and hooks (using `useKV` for persistence)

**Currently:** Defaults scattered in code

**Should Have:**
- Central default feature toggle configuration
- Per-environment overrides
- Documentation of what each toggle does

**Solution:** Create `feature-toggles.json` with defaults and descriptions

---

## 📊 Hardcoded Values Summary

| Category | Location | Values | Priority | Migrated |
|----------|----------|--------|----------|----------|
| App Info | index.html | Title, description, theme-color | HIGH | ✅ |
| Fonts | index.html | Google Fonts URLs | HIGH | ✅ |
| Server Config | vite.config.ts | Ports, hosts | HIGH | ✅ |
| Build Options | vite.config.ts | Chunks, terser, output | HIGH | ✅ |
| Component Registry | component-registry.ts | Lazy load definitions | MEDIUM | ❌ |
| Feature Flags | app.config.ts | Boolean flags | MEDIUM | ✅ |
| Performance | app.config.ts | Timeouts, delays | MEDIUM | ✅ |
| Docker | Dockerfile | Image, ports, env vars | HIGH | ✅ |
| Nginx | nginx.conf | Server settings | LOW | ✅ (not used) |
| PWA | Various | Service worker config | MEDIUM | ✅ |
| CI/CD | Multiple files | Build configs | MEDIUM | ✅ |
| Testing | playwright.config.ts | Browser settings | LOW | ✅ |
| Paths | Various | Directory paths | LOW | ✅ |

---

## 🚀 Migration Plan

### Phase 1: Core Application Config (Priority: HIGH)
**Status:** ✅ COMPLETE - Created `app.config.json`

- [x] Create `app.config.json` with all identified settings
- [ ] Update `vite.config.ts` to read from `app.config.json`
- [ ] Update `index.html` generation to use config values
- [ ] Update `Dockerfile` to use config values via build args
- [ ] Test builds work with new config

### Phase 2: Component Registry (Priority: MEDIUM)
**Status:** ❌ NOT STARTED

- [ ] Create `component-registry.json` schema
- [ ] Define component metadata structure
- [ ] Update `component-registry.ts` to read from JSON
- [ ] Add validation for component definitions
- [ ] Test lazy loading still works

### Phase 3: Feature Toggles (Priority: MEDIUM)
**Status:** ❌ NOT STARTED

- [ ] Create `feature-toggles.json` with defaults
- [ ] Document each feature toggle
- [ ] Update feature toggle initialization
- [ ] Add environment-specific overrides
- [ ] Test toggle persistence

### Phase 4: CI/CD Templates (Priority: LOW)
**Status:** ❌ NOT STARTED

- [ ] Create CI config generator
- [ ] Use `app.config.json` as source of truth
- [ ] Generate GitHub Actions workflows
- [ ] Generate GitLab CI configs
- [ ] Test generated configs

---

## 🎯 Recommended Immediate Actions

### 1. Fix CapRover Deployment Glitches

**Root Cause:** The deployment issues mentioned in the previous prompts are likely due to:

1. **Base path is correct** (`base: './'`) - This is fine
2. **Chunk splitting might be too aggressive** - Breaking into too many small chunks
3. **Preview server configuration** - Might need better health check or startup delay

**Immediate Fixes:**

```typescript
// In vite.config.ts - Make chunks simpler
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      }
    }
  }
}
```

**Better Approach:** Use the new `app.config.json` to configure chunking strategy per environment

### 2. Update Vite Config to Read from JSON

**File:** `vite.config.ts`

```typescript
import appConfig from './app.config.json'

export default defineConfig({
  base: appConfig.server.production.basePath,
  server: appConfig.server.development,
  preview: {
    ...appConfig.server.production,
    port: Number(process.env.PORT) || appConfig.server.production.port,
  },
  build: {
    ...appConfig.build,
    // Read chunk configuration from JSON
    rollupOptions: {
      output: {
        manualChunks: appConfig.build.chunks
      }
    }
  }
})
```

### 3. Generate index.html from Template

**Create:** `index.template.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{APP_TITLE}}</title>
    <meta name="description" content="{{APP_DESCRIPTION}}">
    <meta name="theme-color" content="{{THEME_COLOR}}">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="{{FONT_URL}}" rel="stylesheet">
    
    <link href="/src/main.css" rel="stylesheet" />
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Build script** to replace placeholders from `app.config.json`

---

## 📝 Additional Files to Create

### 1. `component-registry.json`

```json
{
  "components": [
    {
      "name": "ProjectDashboard",
      "path": "@/components/ProjectDashboard",
      "export": "ProjectDashboard",
      "preload": true,
      "preloadPriority": "high",
      "category": "feature"
    },
    {
      "name": "CodeEditor",
      "path": "@/components/CodeEditor",
      "export": "CodeEditor",
      "preload": true,
      "preloadPriority": "high",
      "dependencies": ["monaco-editor"],
      "category": "feature"
    }
  ],
  "dialogs": [
    {
      "name": "GlobalSearch",
      "path": "@/components/GlobalSearch",
      "export": "GlobalSearch",
      "preload": false
    }
  ],
  "pwa": [
    {
      "name": "PWAInstallPrompt",
      "path": "@/components/PWAInstallPrompt",
      "export": "PWAInstallPrompt",
      "preload": false
    }
  ]
}
```

### 2. `feature-toggles.json`

```json
{
  "defaults": {
    "codeEditor": {
      "enabled": true,
      "description": "Monaco code editor with syntax highlighting"
    },
    "models": {
      "enabled": true,
      "description": "Prisma model designer"
    },
    "modelsJSON": {
      "enabled": false,
      "description": "JSON-based model designer (experimental)"
    },
    "components": {
      "enabled": true,
      "description": "Visual component tree builder"
    }
  },
  "environments": {
    "development": {
      "modelsJSON": true,
      "componentTreesJSON": true
    },
    "production": {
      "modelsJSON": false,
      "componentTreesJSON": false
    }
  }
}
```

### 3. `deployment-config.json`

```json
{
  "caprover": {
    "appName": "codeforge",
    "port": 80,
    "healthCheckPath": "/health",
    "instanceCount": 1,
    "containerHttpPort": 80,
    "captainDefinitionFile": "./captain-definition.json",
    "envVars": {
      "NODE_ENV": "production",
      "PORT": "80"
    }
  }
}
```

---

## 🐳 CapRover-Specific Recommendations

Based on the previous prompts mentioning CapRover deployment glitches, here's what to focus on:

### Issue: "Really glitchy when deploying to CapRover"

**Likely Causes:**

1. **Asset Loading Issues**
   - Base path might resolve incorrectly in some chunks
   - Solution: Simplify chunk strategy

2. **Health Check Timing**
   - App might not be ready when health check runs
   - Solution: Add startup delay or better health endpoint

3. **Memory/CPU Constraints**
   - Too many chunks = more requests = slower on constrained resources
   - Solution: Bundle more aggressively for production

4. **Service Worker Conflicts**
   - PWA service worker might cache incorrectly
   - Solution: Clear cache on deployment

### Recommended CapRover-Optimized Config

```json
{
  "deployment": {
    "platforms": {
      "caprover": {
        "build": {
          "simplifiedChunks": true,
          "aggressiveMinification": true,
          "inlineSmallAssets": true,
          "chunkSizeLimit": 2000
        },
        "server": {
          "startupDelay": 5000,
          "healthCheckDelay": 10000
        },
        "pwa": {
          "clearCacheOnDeploy": true,
          "serviceWorkerScope": "/"
        }
      }
    }
  }
}
```

---

## 💡 Benefits of JSON Configuration

1. **Easier Deployment**
   - Change configs per environment without rebuilding
   - Override values via environment variables
   - A/B test features by changing JSON

2. **Better Maintainability**
   - Single source of truth for all settings
   - Easy to document in JSON schema
   - Validate configurations at build time

3. **Faster Iteration**
   - No TypeScript compilation for config changes
   - Hot-reload configurations in development
   - Version control-friendly

4. **Platform Flexibility**
   - Different configs for CapRover, Vercel, Netlify, etc.
   - Easy to generate platform-specific files
   - Reduce deployment-specific code branches

---

## 🔍 Next Steps

1. **Test the new `app.config.json`**
   - Ensure schema is valid
   - Test that all expected values are present

2. **Update `vite.config.ts`**
   - Import and use values from `app.config.json`
   - Test that build still works

3. **Create simpler build profile for CapRover**
   - Less aggressive chunking
   - Better health check endpoint
   - Proper asset caching headers

4. **Document the configuration system**
   - JSON schema for validation
   - Environment variable overrides
   - Per-platform configuration guide

---

## ✅ Files Created

1. **`/workspaces/spark-template/app.config.json`** - Comprehensive application configuration
2. **`/workspaces/spark-template/HARDCODED_ANALYSIS.md`** - This document

## 📚 Files to Update (Recommended Next Steps)

1. `vite.config.ts` - Read from app.config.json
2. `src/config/app.config.ts` - Import from JSON instead of exporting constants
3. `index.html` - Convert to template or generate from config
4. `Dockerfile` - Use ARG/ENV from config
5. `docker-compose.yml` - Reference app.config.json values

---

**Last Updated:** 2024
**Status:** Initial analysis complete, app.config.json created
