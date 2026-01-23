# Workflow Plugins - Dependency Management Guide

**Last Updated**: 2026-01-23
**Status**: Complete - Ready for Use

## Quick Reference

| Language | File | Purpose | Status |
|----------|------|---------|--------|
| **Python** | `python/requirements.txt` | Base dependencies (all plugins) | ✓ Created |
| **Python** | `python/requirements-backend.txt` | Backend plugin dependencies | ✓ Created |
| **Python** | `python/requirements-web.txt` | Web plugin dependencies | ✓ Created |
| **Python** | `python/requirements-notifications.txt` | Notification plugin dependencies | ✓ Created |
| **Python** | `python/requirements-packagerepo.txt` | Package repository plugin dependencies | ✓ Created |
| **Python** | `python/requirements-testing.txt` | Testing plugin dependencies | ✓ Created |
| **Python** | `python/requirements-tools.txt` | Tools plugin dependencies | ✓ Created |
| **Python** | `python/requirements-dev.txt` | Development tools (all categories) | ✓ Created |
| **Go** | `go/go.mod` | Root module definition | ✓ Created |
| **Go** | `go/go.work` | Workspace coordination | ✓ Created |
| **Go** | `go/DEPENDENCIES.md` | Detailed documentation | ✓ Created |
| **TypeScript** | `ts/` | Analyzed for consistency | 94% compliant |

## Python Plugin Setup

### Install All Python Dependencies
```bash
cd workflow/plugins/python
pip install -r requirements.txt
```

### Install Category-Specific Dependencies
```bash
# Backend plugins (OpenAI, Slack, GitHub, Discord)
pip install -r requirements-backend.txt

# Web plugins (Flask, web server)
pip install -r requirements-web.txt

# Notification plugins (Slack, Discord)
pip install -r requirements-notifications.txt

# Package repository plugins
pip install -r requirements-packagerepo.txt

# Testing plugins
pip install -r requirements-testing.txt

# Tools plugins
pip install -r requirements-tools.txt
```

### Install Development Tools
```bash
pip install -r requirements-dev.txt
```

### Verify Python Installation
```bash
python -c "import openai, slack_sdk, discord, flask, pydantic, jwt, pytest"
echo "All dependencies installed successfully!"
```

## Go Plugin Setup

### Initialize Go Workspace
```bash
cd workflow/plugins/go
go mod download
go mod tidy
```

### Build All Go Plugins
```bash
go build ./...
```

### Test All Go Plugins
```bash
go test ./...
```

### Verify Go Module
```bash
go mod verify
```

### Key Features of Go Plugins
- **Zero external dependencies** (except core workflow interface)
- All plugins use only Go standard library
- Minimal compiled size
- Fast build times
- Cross-platform compatible

## TypeScript Plugin Overview

### Current Status
- **Total Plugins**: 25 package.json files
- **Compliance**: 94% (15/16 with consistent versioning)
- **Issue**: 1 plugin uses `workspace:*` instead of `^3.0.0`

### Dependency Consistency
- **Standard Pattern**: `@metabuilder/workflow: ^3.0.0` (15 plugins)
- **Non-Standard Pattern**: `@metabuilder/workflow: workspace:*` (1 plugin)
- **Location of Issue**: `ts/integration/smtp-relay/package.json`

### Additional TypeScript Dependencies
- `nodemailer: ^6.9.7` (SMTP relay plugin)
- `node-fetch: ^3.0.0` (HTTP request plugin)

## Dependency Summary

### Python: 9 Unique Dependencies
```
Core:
  ✓ python-dotenv>=1.0.0 (environment variables)
  ✓ tenacity>=8.2.3 (retry logic)

API Clients:
  ✓ openai>=1.3.0 (OpenAI integration)
  ✓ slack-sdk>=3.23.0 (Slack integration)
  ✓ PyGithub>=2.1.1 (GitHub integration)
  ✓ discord.py>=2.3.2 (Discord integration)

Web Framework:
  ✓ Flask>=3.0.0 (web framework)
  ✓ requests>=2.31.0 (HTTP client)

Data Processing:
  ✓ pydantic>=2.5.0 (validation)
  ✓ PyJWT>=2.8.1 (JWT tokens)
```

### Go: 0 External Dependencies
```
All 51 Go plugins use only:
  ✓ Go standard library
  ✓ github.com/metabuilder/workflow (core interface)
```

### TypeScript: 2-3 Unique Dependencies
```
Core:
  ✓ @metabuilder/workflow: ^3.0.0 (15/16 plugins)

Integration-Specific:
  ✓ nodemailer: ^6.9.7 (smtp-relay)
  ✓ node-fetch: ^3.0.0 (http-request)
```

## Plugin Statistics

### By Language
| Language | Plugin Count | Categories | External Deps |
|----------|--------------|------------|---------------|
| Python | 138 | 15 | 9 |
| Go | 51 | 15 | 0 |
| TypeScript | 25 | 9 | 2-3 |
| **TOTAL** | **214** | — | — |

### Python Categories (15 total)
1. backend (15 plugins)
2. control (4 plugins)
3. convert (7 plugins)
4. core (7 plugins)
5. dict (6 plugins)
6. list (7 plugins)
7. logic (9 plugins)
8. math (10 plugins)
9. notifications (3 plugins)
10. packagerepo (12 plugins)
11. string (10 plugins)
12. test (5 plugins)
13. tools (7 plugins)
14. utils (7 plugins)
15. var (4 plugins)

### Go Categories (14 total)
1. control (1 plugin)
2. convert (7 plugins)
3. core (1 plugin)
4. dict (6 plugins)
5. list (7 plugins)
6. logic (9 plugins)
7. math (4 plugins)
8. notifications (1 plugin)
9. string (8 plugins)
10. test (5 plugins)
11. tools (1 plugin)
12. utils (1 plugin)
13. var (4 plugins)
14. web (1 plugin)

## Installation Verification Commands

### Python
```bash
# Full verification
pip install -r workflow/plugins/python/requirements.txt
python -m pytest workflow/plugins/python/*/*/

# Per-category verification
for category in backend web notifications packagerepo testing tools; do
  pip install -r workflow/plugins/python/requirements-${category}.txt
done
```

### Go
```bash
# Full verification
cd workflow/plugins/go
go mod verify
go build ./...
go test ./...
```

### TypeScript
```bash
# Check consistency (before standardization)
npm --prefix workflow/plugins/ts run audit:dependencies
```

## Next Steps

### Recommended Actions
1. **Python**: Test installation with `pip install -r requirements.txt`
2. **Go**: Initialize workspace with `go mod download && go mod tidy`
3. **TypeScript**: Decide on standardization approach for smtp-relay plugin
4. **CI/CD**: Add dependency checks to continuous integration
5. **Documentation**: Create per-plugin dependency documentation

### Configuration for CI/CD

#### Python (GitHub Actions)
```yaml
- name: Install Python dependencies
  run: pip install -r workflow/plugins/python/requirements.txt

- name: Verify imports
  run: python -m py_compile workflow/plugins/python/*/*.py
```

#### Go (GitHub Actions)
```yaml
- name: Verify Go modules
  run: |
    cd workflow/plugins/go
    go mod verify
    go build ./...
```

## Troubleshooting

### Python: Import Errors
```bash
# Reinstall with upgrade
pip install --upgrade -r workflow/plugins/python/requirements.txt

# Verify specific package
python -c "import openai; print(openai.__version__)"
```

### Go: Module Conflicts
```bash
# Clean and tidy
cd workflow/plugins/go
go clean -modcache
go mod tidy
go mod download
```

### TypeScript: Version Mismatches
```bash
# Reinstall dependencies
cd workflow/plugins/ts
npm install
npm run build
```

## Documentation References

- **Python Details**: See `/workflow/plugins/python/requirements.txt` header
- **Go Details**: See `/workflow/plugins/go/DEPENDENCIES.md`
- **Setup Report**: See `/txt/plugin_dependency_setup_2026-01-23.txt`

## Support

For questions or issues with workflow plugin dependencies:
1. Check the category-specific requirements files
2. Review the DEPENDENCIES.md files in each language directory
3. See the setup report for detailed analysis

---

**Created**: 2026-01-23
**Status**: Complete and Ready for Use
**Next Review**: Recommended after first installation/build cycle
