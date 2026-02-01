# Go Workflow Plugins - Dependency Management

**Last Updated**: 2026-01-23
**Go Version**: 1.21+

## Overview

All Go workflow plugins are designed to have **zero external dependencies** (except the core workflow interface). All plugins use only the Go standard library.

## Module Structure

### Root Module: `go.mod`
- **Module Path**: `github.com/metabuilder/workflow-plugins-go`
- **Go Version**: 1.21
- **Dependencies**: Only `github.com/metabuilder/workflow` for the interface

### Workspace: `go.work`
- Coordinates all 15 plugin categories
- Enables monorepo development with `go mod tidy`

## Plugin Categories (Zero External Dependencies)

| Category | Plugins | External Deps | Status |
|----------|---------|---------------|--------|
| **control** | 1 | None | ✓ Complete |
| **convert** | 7 | None | ✓ Complete |
| **core** | 1 | None | ✓ Complete |
| **dict** | 6 | None | ✓ Complete |
| **list** | 7 | None | ✓ Complete |
| **logic** | 9 | None | ✓ Complete |
| **math** | 4 | None | ✓ Complete |
| **notifications** | 1 | None | ✓ Complete |
| **string** | 8 | None | ✓ Complete |
| **test** | 5 | None | ✓ Complete |
| **tools** | 1 | None | ✓ Complete |
| **utils** | 1 | None | ✓ Complete |
| **var** | 4 | None | ✓ Complete |
| **web** | 1 | None | ✓ Complete |

**Total Go Plugins**: 51

## Development Workflow

### Initialize Workspace
```bash
cd workflow/plugins/go
go mod download
go mod tidy
```

### Build All Plugins
```bash
go build ./...
```

### Test All Plugins
```bash
go test ./...
```

### Add New Plugin Module

For a new category `new_category`:

1. Create directory: `new_category/new_plugin/`
2. Add `main.go` with plugin implementation
3. Update `go.work` to include `./new_category`
4. Run `go mod tidy`

## Plugin Implementation Pattern

All Go plugins follow this interface:

```go
package plugin

// Plugin is the interface all workflow plugins must implement.
type Plugin interface {
	Run(runtime *Runtime, inputs map[string]interface{}) (map[string]interface{}, error)
}

// Runtime provides context for plugin execution.
type Runtime struct {
	Store   map[string]interface{} // Workflow state storage
	Context map[string]interface{} // Shared context (clients, config)
	Logger  Logger                 // Logging interface
}
```

## Migration Notes

### From Node Modules (TypeScript)
- Go plugins use workspace coordination instead of npm workspaces
- Each plugin category is a standalone Go module directory
- No package.json dependencies needed

### Dependencies Decision
- **External libraries**: Explicitly avoided to minimize deployment size
- **Standard library only**: Ensures compatibility across platforms
- **Plugin interface**: Single external import from `metabuilder/workflow`

## Future Enhancements

1. Consider adding optional plugins with external dependencies (separate directory)
2. Implement plugin registry for dynamic loading
3. Add plugin versioning strategy
4. Create plugin template generator

## Troubleshooting

### Import conflicts
```bash
go mod verify
go mod tidy
```

### Workspace issues
```bash
go work init
go work use ./...
```

### Version mismatches
```bash
go get -u ./...
go mod tidy
```
