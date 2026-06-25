// Package dict_get provides a workflow plugin for getting dictionary values.
package dict_get

import (
	"strings"
)

// DictGet implements the NodeExecutor interface for getting dictionary values.
type DictGet struct {
	NodeType    string
	Category    string
	Description string
}

// NewDictGet creates a new DictGet instance.
func NewDictGet() *DictGet {
	return &DictGet{
		NodeType:    "dict.get",
		Category:    "dict",
		Description: "Get a value from a dictionary by key",
	}
}

// Execute runs the plugin logic.
// Retrieves a value from a dictionary by key.
// Supports dot notation for nested keys (e.g., "user.name").
// Inputs:
//   - dict: the dictionary to read from
//   - key: the key to retrieve (supports dot notation)
//   - default: (optional) default value if key not found
//
// Returns:
//   - result: the value at the key or default
//   - found: whether the key was found
func (p *DictGet) Execute(inputs map[string]interface{}, runtime interface{}) map[string]interface{} {
	dict, ok := inputs["dict"].(map[string]interface{})
	if !ok {
		defaultVal := inputs["default"]
		return map[string]interface{}{"result": defaultVal, "found": false}
	}

	key, ok := inputs["key"].(string)
	if !ok {
		defaultVal := inputs["default"]
		return map[string]interface{}{"result": defaultVal, "found": false}
	}

	// Handle dot notation for nested keys
	parts := strings.Split(key, ".")
	current := dict

	for i, part := range parts {
		if val, exists := current[part]; exists {
			if i == len(parts)-1 {
				// Final key, return the value
				return map[string]interface{}{"result": val, "found": true}
			}
			// Not the final key, try to descend
			if nested, ok := val.(map[string]interface{}); ok {
				current = nested
			} else {
				// Cannot descend further
				defaultVal := inputs["default"]
				return map[string]interface{}{"result": defaultVal, "found": false}
			}
		} else {
			// Key not found
			defaultVal := inputs["default"]
			return map[string]interface{}{"result": defaultVal, "found": false}
		}
	}

	defaultVal := inputs["default"]
	return map[string]interface{}{"result": defaultVal, "found": false}
}
