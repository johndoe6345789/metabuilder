// Package var_get provides a workflow plugin for getting workflow variables.
package var_get

// VarGet implements the NodeExecutor interface for getting workflow variables.
type VarGet struct {
	NodeType    string
	Category    string
	Description string
}

// NewVarGet creates a new VarGet instance.
func NewVarGet() *VarGet {
	return &VarGet{
		NodeType:    "var.get",
		Category:    "var",
		Description: "Get a variable from the workflow store",
	}
}

// Runtime interface for accessing workflow store.
type Runtime interface {
	GetStore() map[string]interface{}
}

// Execute runs the plugin logic.
// Retrieves a variable from the workflow store.
func (p *VarGet) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{
			"result": nil,
			"exists": false,
			"error":  "key is required",
		}
	}

	defaultVal := inputs["default"]

	// Try to access the runtime store
	var store map[string]interface{}
	if r, ok := runtime.(Runtime); ok {
		store = r.GetStore()
	} else if r, ok := runtime.(map[string]interface{}); ok {
		if s, ok := r["Store"].(map[string]interface{}); ok {
			store = s
		}
	}

	if store == nil {
		return map[string]interface{}{
			"result": defaultVal,
			"exists": false,
		}
	}

	value, exists := store[key]
	if !exists {
		value = defaultVal
	}

	return map[string]interface{}{
		"result": value,
		"exists": exists,
	}
}
