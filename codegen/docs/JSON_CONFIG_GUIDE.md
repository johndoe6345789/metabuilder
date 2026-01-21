# JSON Configuration Quick Reference

## 📚 Configuration Files Overview

CodeForge now uses JSON configuration files for all major settings. This guide shows what each file contains and how to use them.

---

## 📄 File Locations

```
/workspaces/spark-template/
├── app.config.json              # Main application configuration
├── component-registry.json      # Component lazy loading definitions
├── feature-toggles.json         # Feature flag defaults and profiles
├── deployment-config.json       # Platform-specific deployment settings
├── theme.json                   # Tailwind theme customization (empty but supported)
├── components.json              # shadcn component configuration
├── architecture.json            # Architecture and page renderer config
└── src/config/
    ├── pages.json              # Page definitions and navigation
    ├── seed-data.json          # Default project data
    └── component-trees/        # JSON component tree definitions
```

---

## 🔧 app.config.json

**Purpose:** Main application settings including branding, server, build, and features

### Key Sections:

#### App Metadata
```json
{
  "app": {
    "name": "CodeForge",
    "title": "CodeForge - Low-Code Development Platform",
    "version": "6.0.0",
    "themeColor": "#8b5cf6"
  }
}
```

#### Server Configuration
```json
{
  "server": {
    "development": {
      "host": "0.0.0.0",
      "port": 5000
    },
    "production": {
      "host": "0.0.0.0",
      "port": 80,
      "basePath": "./"
    }
  }
}
```

#### Build Settings
```json
{
  "build": {
    "outDir": "dist",
    "sourcemap": false,
    "minify": "terser",
    "chunks": {
      "react-vendor": ["react", "react-dom"],
      "ui-core": ["@radix-ui/..."]
    }
  }
}
```

#### Feature Flags
```json
{
  "features": {
    "preloadCriticalComponents": true,
    "bundleMetrics": true
  }
}
```

---

## 🎨 component-registry.json

**Purpose:** Define all lazy-loaded components with preload strategies

### Structure:

```json
{
  "components": [
    {
      "name": "ProjectDashboard",
      "path": "@/components/ProjectDashboard",
      "export": "ProjectDashboard",
      "type": "feature",
      "preload": true,
      "preloadPriority": "high",
      "category": "dashboard"
    }
  ],
  "dialogs": [...],
  "pwa": [...],
  "preloadStrategy": {
    "critical": ["ProjectDashboard", "CodeEditor"],
    "preloadDelay": 100
  }
}
```

### Component Properties:

- `name` - Unique component identifier
- `path` - Import path
- `export` - Named export from module
- `type` - Component type (feature, dialog, pwa)
- `preload` - Whether to preload component
- `preloadPriority` - Priority level (high, medium, low)
- `category` - Grouping category
- `dependencies` - External dependencies (e.g., monaco-editor)
- `experimental` - Mark as experimental feature

---

## 🎛️ feature-toggles.json

**Purpose:** Feature flag defaults, profiles, and environment overrides

### Structure:

```json
{
  "defaults": {
    "codeEditor": {
      "enabled": true,
      "description": "Monaco code editor...",
      "category": "core"
    }
  },
  "categories": {
    "core": {
      "label": "Core Features",
      "icon": "StarFour"
    }
  },
  "environments": {
    "development": {
      "overrides": {
        "modelsJSON": true
      }
    }
  },
  "profiles": {
    "minimal": {
      "enabled": ["codeEditor", "documentation"]
    }
  }
}
```

### Usage:

1. **Default State** - All features have a default enabled/disabled state
2. **Environment Overrides** - Override defaults per environment (dev, staging, prod)
3. **Profiles** - Predefined feature sets (minimal, designer, developer, testing-focused)
4. **Categories** - Group related features for UI organization

---

## 🚀 deployment-config.json

**Purpose:** Platform-specific deployment configurations and optimizations

### Platforms Supported:

- ✅ CapRover
- ✅ Docker Compose
- ⚪ Heroku (disabled by default)
- ⚪ Vercel (disabled by default)
- ⚪ Netlify (disabled by default)
- ⚪ AWS ECS (disabled by default)
- ⚪ Kubernetes (disabled by default)

### CapRover Configuration:

```json
{
  "platforms": {
    "caprover": {
      "enabled": true,
      "appName": "codeforge",
      "containerHttpPort": 80,
      "healthCheck": {
        "path": "/health",
        "interval": 30
      },
      "buildOptimizations": {
        "simplifiedChunks": true,
        "aggressiveMinification": true
      }
    }
  }
}
```

### Build Profiles:

```json
{
  "buildProfiles": {
    "caprover-optimized": {
      "chunks": {
        "strategy": "simple",
        "groups": {
          "vendor": ["node_modules"],
          "app": ["src"]
        }
      }
    }
  }
}
```

---

## 📋 pages.json

**Purpose:** Define all pages, navigation, shortcuts, and component mappings

**Location:** `src/config/pages.json`

### Page Structure:

```json
{
  "pages": [
    {
      "id": "dashboard",
      "title": "Dashboard",
      "icon": "ChartBar",
      "component": "ProjectDashboard",
      "enabled": true,
      "shortcut": "ctrl+1",
      "order": 1,
      "props": {
        "state": ["files", "models"],
        "actions": ["onFileChange:handleFileChange"]
      }
    }
  ]
}
```

### Page Properties:

- `id` - Unique page identifier (used in URLs)
- `title` - Display name in navigation
- `icon` - Phosphor icon name
- `component` - Component name from registry
- `enabled` - Show/hide page
- `toggleKey` - Feature toggle key (optional)
- `shortcut` - Keyboard shortcut (optional)
- `order` - Navigation order
- `props` - State and action mappings
- `resizableConfig` - Split pane configuration (optional)

---

## 🎨 theme.json

**Purpose:** Tailwind theme customization (currently empty, ready for use)

**Location:** `theme.json` (root)

### Usage:

```json
{
  "extend": {
    "colors": {
      "brand": {
        "50": "#f0f9ff",
        "500": "#3b82f6",
        "900": "#1e3a8a"
      }
    },
    "fontFamily": {
      "custom": ["Custom Font", "sans-serif"]
    }
  }
}
```

Tailwind config already reads from this file via `tailwind.config.js`

---

## 🏗️ architecture.json

**Purpose:** High-level architecture configuration

**Location:** `architecture.json` (root)

### Structure:

```json
{
  "pages": {
    "dashboard": {
      "renderer": "json",
      "schema": "./pages/dashboard.json"
    }
  },
  "hooks": {
    "data": ["useDataSource", "useCRUD"],
    "forms": ["useFormField"],
    "ui": ["useDialog"]
  },
  "atomicComponents": {
    "maxLOC": 150,
    "categories": {
      "atoms": [...],
      "molecules": [...],
      "organisms": [...]
    }
  }
}
```

---

## 🔧 Usage Examples

### 1. Change App Name and Branding

Edit `app.config.json`:

```json
{
  "app": {
    "name": "MyApp",
    "title": "MyApp - Custom Platform",
    "themeColor": "#ff0000"
  }
}
```

Then update `index.html` to read from config (requires build script)

### 2. Enable Experimental Features in Development

Edit `feature-toggles.json`:

```json
{
  "environments": {
    "development": {
      "overrides": {
        "modelsJSON": true,
        "componentTreesJSON": true
      }
    }
  }
}
```

### 3. Optimize Build for CapRover

Use the `caprover-optimized` build profile from `deployment-config.json`:

```bash
# Set environment variable
export BUILD_PROFILE=caprover-optimized

# Build with profile
npm run build
```

### 4. Add New Page

Edit `src/config/pages.json`:

```json
{
  "pages": [
    {
      "id": "my-page",
      "title": "My Page",
      "icon": "Rocket",
      "component": "MyComponent",
      "enabled": true,
      "order": 100
    }
  ]
}
```

Add component to `component-registry.json`:

```json
{
  "components": [
    {
      "name": "MyComponent",
      "path": "@/components/MyComponent",
      "export": "MyComponent",
      "type": "feature",
      "preload": false
    }
  ]
}
```

### 5. Change Server Port

Edit `app.config.json`:

```json
{
  "server": {
    "development": {
      "port": 3000
    }
  }
}
```

Then update `vite.config.ts` to read from config

---

## 🛠️ Implementation Status

| File | Status | Needs Update |
|------|--------|--------------|
| app.config.json | ✅ Created | vite.config.ts, index.html |
| component-registry.json | ✅ Created | component-registry.ts |
| feature-toggles.json | ✅ Created | FeatureToggleSettings component |
| deployment-config.json | ✅ Created | Dockerfile, CI/CD scripts |
| pages.json | ✅ Exists | No changes needed |
| theme.json | ✅ Supported | Ready for customization |
| architecture.json | ✅ Exists | No changes needed |

---

## 🚀 Next Steps

### To Use New Configs:

1. **Update vite.config.ts** to import `app.config.json`
2. **Update component-registry.ts** to read from `component-registry.json`
3. **Update feature toggle hook** to load from `feature-toggles.json`
4. **Create build script** to generate `index.html` from template + config
5. **Update Dockerfile** to use `deployment-config.json` settings
6. **Test all configurations** in development and production

### Benefits:

- ✅ No rebuilds for config changes (in development)
- ✅ Environment-specific settings
- ✅ Platform-optimized builds
- ✅ Easy customization and branding
- ✅ Version control friendly
- ✅ Documentation via JSON schemas

---

## 📚 Related Documentation

- [HARDCODED_ANALYSIS.md](./HARDCODED_ANALYSIS.md) - Detailed analysis of hardcoded values
- [README.md](./README.md) - Full project documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [src/config/pages.json](./src/config/pages.json) - Page configuration

---

**Last Updated:** 2024
**Version:** 1.0.0
