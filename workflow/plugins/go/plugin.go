// Package plugin defines the workflow plugin interface for Go.
//
// Go plugins follow the same pattern as Python:
//   - Each file contains one operation
//   - All plugins implement the Run function
//   - Input/output are map[string]interface{}
package plugin

// Runtime provides context for plugin execution.
type Runtime struct {
	Store   map[string]interface{} // Workflow state storage
	Context map[string]interface{} // Shared context (clients, config)
	Logger  Logger                 // Logging interface
}

// Logger interface for plugin logging.
type Logger interface {
	Info(msg string)
	Error(msg string)
	Debug(msg string)
}

// Plugin is the interface all workflow plugins must implement.
type Plugin interface {
	// Run executes the plugin with given inputs.
	// Returns output map and optional error.
	Run(runtime *Runtime, inputs map[string]interface{}) (map[string]interface{}, error)
}

// PluginFunc is a function type that implements Plugin interface.
type PluginFunc func(runtime *Runtime, inputs map[string]interface{}) (map[string]interface{}, error)

// Run implements Plugin interface for PluginFunc.
func (f PluginFunc) Run(runtime *Runtime, inputs map[string]interface{}) (map[string]interface{}, error) {
	return f(runtime, inputs)
}
