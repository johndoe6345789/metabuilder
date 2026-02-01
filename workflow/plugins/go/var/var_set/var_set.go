// Package var_set provides a workflow plugin for setting workflow variables.
package var_set

// VarSet implements the NodeExecutor interface for setting workflow variables.
type VarSet struct {
	NodeType    string
	Category    string
	Description string
}

// NewVarSet creates a new VarSet instance.
func NewVarSet() *VarSet {
	return &VarSet{
		NodeType:    "var.set",
		Category:    "var",
		Description: "Set a variable in the workflow store",
	}
}

// Runtime interface for accessing workflow store.
type Runtime interface {
	GetStore() map[string]interface{}
}

// Execute runs the plugin logic.
// Stores a variable in the workflow store.
func (p *VarSet) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	key, ok := inputs["key"].(string)
	if !ok {
		return map[string]interface{}{"success": false, "error": "key is required"}
	}

	value := inputs["value"]

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

	store[key] = value

	return map[string]interface{}{"success": true, "key": key}
}
