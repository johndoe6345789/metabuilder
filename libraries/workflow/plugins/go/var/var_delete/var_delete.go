// Package var_delete provides a workflow plugin for deleting workflow variables.
package var_delete

// VarDelete implements the NodeExecutor interface for deleting workflow variables.
type VarDelete struct {
	NodeType    string
	Category    string
	Description string
}

// NewVarDelete creates a new VarDelete instance.
func NewVarDelete() *VarDelete {
	return &VarDelete{
		NodeType:    "var.delete",
		Category:    "var",
		Description: "Delete a variable from the workflow store",
	}
}

// Runtime interface for accessing workflow store.
type Runtime interface {
	GetStore() map[string]interface{}
}

// Execute runs the plugin logic.
// Removes a variable from the workflow store.
func (p *VarDelete) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"success": false, "error": "key is required"}
	}

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
		return map[string]interface{}{"success": false, "error": "runtime store not available"}
	}

	_, existed := store[key]
	delete(store, key)

	return map[string]interface{}{"success": true, "existed": existed}
}
